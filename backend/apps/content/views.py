from django_ratelimit.decorators import ratelimit
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
from django.core.mail import EmailMessage

from apps.core.utils import too_many_requests

from .models import Tip, ContactMessage
from .serializers import TipSerializer, ContactMessageSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def tip_list(request):
    tips = Tip.objects.filter(is_active=True)
    return Response(TipSerializer(tips, many=True).data)


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='5/m', method='POST', block=False)
def contact_create(request):
    if getattr(request, 'limited', False):
        return too_many_requests()

    serializer = ContactMessageSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    contact_message = serializer.save()

    email = EmailMessage(
        subject=f'Пикник Эко-парк — сообщение от {contact_message.name}',
        body=(
            f'Имя: {contact_message.name}\n'
            f'Email: {contact_message.email}\n\n'
            f'{contact_message.message}'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[settings.CONTACT_EMAIL],
        reply_to=[contact_message.email],
    )
    email.send(fail_silently=True)

    return Response({'message': 'Сообщение отправлено'}, status=status.HTTP_201_CREATED)
