from rest_framework import serializers

from .models import Transaction, Withdrawal


class TransactionSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'type', 'type_display', 'amount', 'status', 'status_display', 'description', 'created_at']


class WithdrawalCreateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    method = serializers.ChoiceField(choices=Withdrawal.METHOD_CHOICES)
    card_last4 = serializers.CharField(max_length=4, required=False, allow_blank=True)


class WithdrawalSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    method_display = serializers.CharField(source='get_method_display', read_only=True)

    class Meta:
        model = Withdrawal
        fields = [
            'id', 'amount', 'commission_amount', 'payout_amount',
            'method', 'method_display', 'card_last4',
            'status', 'status_display', 'admin_comment',
            'requested_at', 'processed_at',
        ]
