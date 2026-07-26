from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime

from .models import Cottage, Booking, Review
from .serializers import (
    CottageSerializer, CottageListSerializer, BookingSerializer,
    BookingCreateSerializer, PriceCalculationSerializer, ReviewSerializer
)


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

    check_in = data['check_in']
    check_out = data['check_out']
    guests = data['guests']
    promo_code = data.get('promo_code', '')

    if check_out <= check_in:
        return Response({'error': 'Дата выезда должна быть позже даты заезда'}, status=400)

    nights = (check_out - check_in).days
    total = float(cottage.price_per_night) * nights * guests

    # Промокоды
    discount = 0
    if promo_code.upper() == 'PIKNIK10':
        discount = total * 0.10
    elif promo_code.upper() == 'WELCOME':
        discount = total * 0.05

    final_price = total - discount

    return Response({
        'cottage_id': cottage.id,
        'cottage_name': cottage.name,
        'price_per_night': float(cottage.price_per_night),
        'nights': nights,
        'guests': guests,
        'subtotal': round(total, 2),
        'discount': round(discount, 2),
        'total_price': round(final_price, 2),
    })


# BOOKINGS

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_list(request):
    bookings = Booking.objects.filter(user=request.user)
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def booking_create(request):
    serializer = BookingCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    cottage = data['cottage']
    check_in = data['check_in']
    check_out = data['check_out']
    guests = data['guests']

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

    nights = (check_out - check_in).days
    total = float(cottage.price_per_night) * nights * guests

    promo_code = data.get('promo_code', '')
    discount = 0
    if promo_code.upper() == 'PIKNIK10':
        discount = total * 0.10
    elif promo_code.upper() == 'WELCOME':
        discount = total * 0.05

    booking = Booking.objects.create(
        user=request.user,
        cottage=cottage,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        total_price=round(total - discount, 2),
        promo_code=promo_code,
        notes=data.get('notes', ''),
        status='pending',
    )

    # Отправка email
    send_mail(
        subject=f'Подтверждение бронирования — {cottage.name}',
        message=f'''Здравствуйте, {request.user.first_name}!\n\nВаше бронирование подтверждено:\n\nКоттедж: {cottage.name} (Домик №{cottage.number})\nДаты: {check_in} — {check_out}\nГостей: {guests}\nНочей: {nights}\nИтого: {booking.total_price} Kč\n\nСтатус: Ожидает оплаты\n\nС уважением,\nКоманда Пикник Эко-парк''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[request.user.email],
        fail_silently=True,
    )

    return Response({
        'message': 'Бронирование создано',
        'booking': BookingSerializer(booking).data
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