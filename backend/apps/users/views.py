from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.hashers import check_password
from .serializers import UserRegisterSerializer, UserProfileSerializer, UserLoginSerializer

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
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
def login_view(request):
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)