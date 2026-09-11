from django.contrib import admin
from django.utils import timezone

from apps.core.services.wallet import credit_balance
from apps.wallet.models import ReferralCommission

from .models import Task, TaskSubmission

REFERRAL_TASK_COMMISSION_RATE = 0.25


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'platform', 'reward_min', 'reward_max', 'is_active']
    list_filter = ['platform', 'is_active']
    search_fields = ['title']
    list_editable = ['is_active']


@admin.register(TaskSubmission)
class TaskSubmissionAdmin(admin.ModelAdmin):
    list_display = ['user', 'task', 'platform', 'status', 'reward_amount', 'created_at']
    list_filter = ['status', 'platform']
    search_fields = ['user__email', 'submitted_link']
    ordering = ['-created_at']

    def save_model(self, request, obj, form, change):
        previous_status = TaskSubmission.objects.get(pk=obj.pk).status if change else None

        super().save_model(request, obj, form, change)

        if change and previous_status != 'approved' and obj.status == 'approved':
            obj.reviewed_at = timezone.now()
            TaskSubmission.objects.filter(pk=obj.pk).update(reviewed_at=obj.reviewed_at)

            reward = obj.reward_amount or obj.task.reward_min
            credit_balance(
                obj.user, reward, 'task_reward',
                description=f'Награда за задание «{obj.task.title}»',
                related_object_type='task_submission', related_object_id=obj.pk,
            )

            if obj.user.referred_by:
                commission_amount = reward * REFERRAL_TASK_COMMISSION_RATE
                ReferralCommission.objects.create(
                    referrer=obj.user.referred_by,
                    referred_user=obj.user,
                    source_type='task_reward',
                    source_object_id=obj.pk,
                    base_amount=reward,
                    commission_rate=REFERRAL_TASK_COMMISSION_RATE,
                    commission_amount=commission_amount,
                )
                credit_balance(
                    obj.user.referred_by, commission_amount, 'referral_task_bonus',
                    description=f'Реферальный бонус за задание {obj.user}',
                    related_object_type='task_submission', related_object_id=obj.pk,
                )
