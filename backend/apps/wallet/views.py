import csv

from django.contrib.auth import get_user_model
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import ReferralCommission, Transaction, Withdrawal
from .serializers import TransactionSerializer, WithdrawalCreateSerializer, WithdrawalSerializer
from .services import request_withdrawal

User = get_user_model()


def _filtered_transactions(request):
    qs = Transaction.objects.filter(user=request.user)
    tx_type = request.GET.get('type')
    if tx_type:
        qs = qs.filter(type=tx_type)
    ordering = request.GET.get('ordering', '-created_at')
    if ordering not in ('created_at', '-created_at'):
        ordering = '-created_at'
    return qs.order_by(ordering)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def referral_info(request):
    user = request.user
    referrals_count = User.objects.filter(referred_by=user).count()
    total_earned = sum(ReferralCommission.objects.filter(referrer=user).values_list('commission_amount', flat=True))
    return Response({
        'referral_code': user.referral_code,
        'referral_link': f'/register?ref={user.referral_code}',
        'referrals_count': referrals_count,
        'total_earned': total_earned,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_list(request):
    qs = _filtered_transactions(request)
    paginator = PageNumberPagination()
    paginator.page_size = 10
    page = paginator.paginate_queryset(qs, request)
    serializer = TransactionSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_export_csv(request):
    qs = _filtered_transactions(request)
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="transactions.csv"'
    writer = csv.writer(response)
    writer.writerow(['Дата', 'Тип', 'Сумма', 'Статус', 'Описание'])
    for tx in qs:
        writer.writerow([tx.created_at, tx.get_type_display(), tx.amount, tx.get_status_display(), tx.description])
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdrawal_create(request):
    serializer = WithdrawalCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    try:
        withdrawal = request_withdrawal(request.user, **serializer.validated_data)
    except ValueError as err:
        return Response({'error': str(err)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(WithdrawalSerializer(withdrawal).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def withdrawal_list(request):
    qs = Withdrawal.objects.filter(user=request.user)
    return Response(WithdrawalSerializer(qs, many=True).data)
