from django.contrib import admin
from django.utils import timezone

from apps.core.services.wallet import credit_balance

from .models import ReferralCommission, Transaction, Withdrawal


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'type', 'amount', 'status', 'created_at']
    list_filter = ['type', 'status']
    search_fields = ['user__email']
    ordering = ['-created_at']


@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'payout_amount', 'status', 'requested_at']
    list_filter = ['status', 'method']
    search_fields = ['user__email']
    ordering = ['-requested_at']

    def save_model(self, request, obj, form, change):
        previous_status = Withdrawal.objects.get(pk=obj.pk).status if change else None

        super().save_model(request, obj, form, change)

        if change and previous_status != obj.status and obj.status in ('paid', 'rejected'):
            obj.processed_at = timezone.now()
            Withdrawal.objects.filter(pk=obj.pk).update(processed_at=obj.processed_at)
            Transaction.objects.filter(
                related_object_type='withdrawal', related_object_id=obj.pk
            ).update(status='completed' if obj.status == 'paid' else 'rejected')
            if obj.status == 'rejected':
                credit_balance(
                    obj.user, obj.amount, 'admin_adjustment',
                    description='Возврат отклонённого вывода средств',
                    related_object_type='withdrawal', related_object_id=obj.pk,
                )


@admin.register(ReferralCommission)
class ReferralCommissionAdmin(admin.ModelAdmin):
    list_display = ['referrer', 'referred_user', 'source_type', 'commission_amount', 'created_at']
    list_filter = ['source_type']
    search_fields = ['referrer__email', 'referred_user__email']
    ordering = ['-created_at']
