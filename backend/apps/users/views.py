import random
from datetime import timedelta

from django_ratelimit.decorators import ratelimit
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout, get_user_model, update_session_auth_hash
from django.contrib.auth.hashers import check_password
from django.utils import timezone

from apps.core.services.sms import send_sms
from apps.core.utils import too_many_requests

from .models import PhoneVerificationCode
from .serializers import (
    UserRegisterSerializer, UserProfileSerializer, UserLoginSerializer,
    PhoneSendCodeSerializer, PhoneVerifyCodeSerializer, ChangePasswordSerializer,
)

User = get_user_model()
CODE_VALIDITY_MINUTES = 5


def phone_number_key(group, request):
    return request.data.get('phone_number', '')


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='20/h', method='POST', block=False)
def register(request):
    if getattr(request, 'limited', False):
        return too_many_requests()

    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        # Отправка приветственного письма (console backend)
        from django.core.mail import send_mail
        from django.conf import settings
        send_mail(
            subject='Добро пожаловать в Пикник Эко-парк!',
            message=f'Здравствуйте, {user.first_name}!\n\nСпасибо за регистрацию в сервисе бронирования коттеджей "Пикник Эко-парк".\n\nТеперь вы можете:\n- Бронировать уютные домики в экопарке\n- Участвовать в партнерской программе\n- Получать бонусы за активность\n\nС уважением,\nКоманда Пикник Эко-парк',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
        return Response({
            'message': 'Регистрация успешна',
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='10/m', method='POST', block=False)
def login_view(request):
    if getattr(request, 'limited', False):
        return too_many_requests()

    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Неверный email или пароль'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if check_password(password, user.password):
            login(request, user)
            return Response({
                'message': 'Вход выполнен',
                'user': UserProfileSerializer(user).data
            })
        return Response({'error': 'Неверный email или пароль'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Выход выполнен'})


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == 'PATCH':
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='5/m', method='POST', block=False)
def change_password(request):
    if getattr(request, 'limited', False):
        return too_many_requests()

    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if not check_password(serializer.validated_data['old_password'], request.user.password):
        return Response({'error': 'Неверный текущий пароль'}, status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(serializer.validated_data['new_password'])
    request.user.save(update_fields=['password'])
    update_session_auth_hash(request, request.user)
    return Response({'message': 'Пароль изменён'})


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='10/m', method='POST', block=False)
@ratelimit(key=phone_number_key, rate='3/m', method='POST', block=False)
def phone_send_code(request):
    if getattr(request, 'limited', False):
        return too_many_requests()

    serializer = PhoneSendCodeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    phone_number = serializer.validated_data['phone_number']
    code = f'{random.randint(0, 9999):04d}'
    PhoneVerificationCode.objects.create(
        phone_number=phone_number,
        code=code,
        expires_at=timezone.now() + timedelta(minutes=CODE_VALIDITY_MINUTES),
    )
    send_sms(phone_number, f'Ваш код подтверждения: {code}')
    return Response({'message': 'Код отправлен'})


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='15/m', method='POST', block=False)
@ratelimit(key=phone_number_key, rate='8/m', method='POST', block=False)
def phone_verify_code(request):
    if getattr(request, 'limited', False):
        return too_many_requests()

    serializer = PhoneVerifyCodeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    phone_number = serializer.validated_data['phone_number']
    code = serializer.validated_data['code']
    verification = PhoneVerificationCode.objects.filter(
        phone_number=phone_number, code=code, is_used=False, expires_at__gt=timezone.now(),
    ).first()
    if not verification:
        return Response({'error': 'Неверный или истёкший код'}, status=status.HTTP_400_BAD_REQUEST)
    verification.is_used = True
    verification.save(update_fields=['is_used'])
    return Response({'verified': True})