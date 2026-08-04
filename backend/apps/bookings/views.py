from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import login
from django.utils import timezone
from datetime import datetime

from apps.core.services.wallet import credit_balance, debit_balance
from apps.users.models import PhoneVerificationCode
from apps.users.serializers import UserProfileSerializer
from apps.users.services import get_or_create_user_by_phone
from apps.wallet.models import ReferralCommission

from .models import Cottage, Booking, Review
from .serializers import (
    CottageSerializer, CottageListSerializer, BookingSerializer,
    BookingCreateSerializer, PriceCalculationSerializer, ReviewSerializer
)
from .services import calculate_booking_price

REFERRAL_BOOKING_COMMISSION_RATE = 0.15


# COTTAGES

@api_view(['GET'])
@permission_classes([AllowAny])
def cottage_list(request):
    cottages = Cottage.objects.filter(is_active=True)
    serializer = CottageListSerializer(cottages, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def cottage_detail(request, pk):
    cottage = get_object_or_404(Cottage, pk=pk, is_active=True)
    serializer = CottageSerializer(cottage)
    return Response(serializer.data)


# PRICE CALCULATOR

@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_price(request):
    serializer = PriceCalculationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    cottage = get_object_or_404(Cottage, pk=data['cottage_id'], is_active=True)

    try:
        result = calculate_booking_price(
            cottage, data['check_in'], data['check_out'], data['guests'], data.get('promo_code', ''),
        )
    except ValueError as err:
        return Response({'error': str(err)}, status=400)

    return Response(result)


# BOOKINGS

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_list(request):
    bookings = Booking.objects.filter(user=request.user)
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def booking_create(request):
    serializer = BookingCreateSerializer(data=request.data, context={'request': request})
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    cottage = data['cottage']
    check_in = data['check_in']
    check_out = data['check_out']
    guests = data['guests']

    if request.user.is_authenticated:
        user = request.user
    else:
        phone_number = data['phone_number']
        verification = PhoneVerificationCode.objects.filter(
            phone_number=phone_number, code=data['verification_code'],
            is_used=False, expires_at__gt=timezone.now(),
        ).first()
        if not verification:
            return Response({'error': 'Неверный или истёкший код подтверждения'}, status=400)
        verification.is_used = True
        verification.save(update_fields=['is_used'])
        user, _ = get_or_create_user_by_phone(phone_number)
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')

    # Проверка пересечения дат
    overlapping = Booking.objects.filter(
        cottage=cottage,
        status__in=['pending', 'confirmed', 'paid'],
        check_in__lt=check_out,
        check_out__gt=check_in,
    ).exists()

    if overlapping:
        return Response({'error': 'Эти даты уже заняты'}, status=status.HTTP_400_BAD_REQUEST)

    if guests > cottage.max_guests:
        return Response({'error': f'Максимум гостей: {cottage.max_guests}'}, status=400)

    promo_code = data.get('promo_code', '')
    try:
        price = calculate_booking_price(cottage, check_in, check_out, guests, promo_code)
    except ValueError as err:
        return Response({'error': str(err)}, status=400)

    total_price = price['total_price']
    balance_amount_used = min(float(data.get('balance_amount_used') or 0), float(user.balance), total_price)

    booking = Booking.objects.create(
        user=user,
        cottage=cottage,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        total_price=total_price,
        promo_code=promo_code,
        notes=data.get('notes', ''),
        status='paid',
    )

    if balance_amount_used > 0:
        debit_balance(
            user, balance_amount_used, 'booking_payment_from_balance',
            description=f'Оплата брони №{booking.id} с баланса',
            related_object_type='booking', related_object_id=booking.id,
        )

    if user.referred_by:
        commission_amount = round(total_price * REFERRAL_BOOKING_COMMISSION_RATE, 2)
        ReferralCommission.objects.create(
            referrer=user.referred_by,
            referred_user=user,
            source_type='booking_payment',
            source_object_id=booking.id,
            base_amount=total_price,
            commission_rate=REFERRAL_BOOKING_COMMISSION_RATE,
            commission_amount=commission_amount,
        )
        credit_balance(
            user.referred_by, commission_amount, 'referral_booking_bonus',
            description=f'Реферальный бонус за бронь №{booking.id}',
            related_object_type='booking', related_object_id=booking.id,
        )

    # Отправка email
    send_mail(
        subject=f'Подтверждение бронирования — {cottage.name}',
        message=f'''Здравствуйте, {user.first_name}!\n\nВаше бронирование подтверждено:\n\nКоттедж: {cottage.name} (Домик №{cottage.number})\nДаты: {check_in} — {check_out}\nГостей: {guests}\nНочей: {price['nights']}\nИтого: {booking.total_price} Kč\n\nСтатус: Оплачено\n\nС уважением,\nКоманда Пикник Эко-парк''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )

    return Response({
        'message': 'Бронирование создано',
        'booking': BookingSerializer(booking).data,
        'user': UserProfileSerializer(user).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_detail(request, pk):
    booking = get_object_or_404(Booking, pk=pk, user=request.user)
    serializer = BookingSerializer(booking)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def booking_cancel(request, pk):
    booking = get_object_or_404(Booking, pk=pk, user=request.user)
    if booking.status in ['completed', 'cancelled']:
        return Response({'error': 'Нельзя отменить это бронирование'}, status=400)
    booking.status = 'cancelled'
    booking.save()
    return Response({'message': 'Бронирование отменено', 'booking': BookingSerializer(booking).data})


# REVIEWS

@api_view(['GET'])
@permission_classes([AllowAny])
def review_list(request, cottage_id):
    reviews = Review.objects.filter(booking__cottage_id=cottage_id)
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def review_create(request):
    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# WEATHER

@api_view(['GET'])
@permission_classes([AllowAny])
def weather(request):
    import requests
    lat = request.GET.get('lat', 55.7558)
    lon = request.GET.get('lon', 37.6173)
    try:
        url = f'https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&timezone=Europe/Moscow'
        resp = requests.get(url, timeout=5)
        data = resp.json()
        cw = data.get('current_weather', {})
        return Response({
            'temperature': cw.get('temperature'),
            'windspeed': cw.get('windspeed'),
            'weathercode': cw.get('weathercode'),
        })
    except Exception:
        return Response({'error': 'Не удалось получить погоду'}, status=503)