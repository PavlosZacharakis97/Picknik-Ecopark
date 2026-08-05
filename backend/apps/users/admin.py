from django.contrib import admin
from .models import CustomUser, PhoneVerificationCode


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'last_name', 'phone_number', 'balance', 'is_staff']
    list_filter = ['is_staff', 'is_superuser', 'created_at']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Персональная информация', {'fields': ('first_name', 'last_name', 'phone_number')}),
        ('Финансы', {'fields': ('balance', 'referral_code', 'referred_by', 'payout_method', 'payout_card_last4')}),
        ('Права доступа', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Важные даты', {'fields': ('last_login', 'date_joined')}),
    )


@admin.register(PhoneVerificationCode)
class PhoneVerificationCodeAdmin(admin.ModelAdmin):
    list_display = ['phone_number', 'code', 'is_used', 'created_at', 'expires_at']
    list_filter = ['is_used']
    search_fields = ['phone_number']
    ordering = ['-created_at']