from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    PAYOUT_METHOD_CHOICES = [
        ('visa', 'Visa'),
        ('mastercard', 'Mastercard'),
    ]

    phone_number = models.CharField(max_length=20, blank=True, verbose_name='Номер телефона')
    email = models.EmailField(unique=True, verbose_name='Email')
    first_name = models.CharField(max_length=150, verbose_name='Имя')
    last_name = models.CharField(max_length=150, verbose_name='Фамилия')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name='Баланс')
    referral_code = models.CharField(max_length=20, blank=True, unique=True, null=True, verbose_name='Реферальный код')
    referred_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Пригласивший')
    payout_method = models.CharField(max_length=20, choices=PAYOUT_METHOD_CHOICES, blank=True, verbose_name='Способ вывода')
    payout_card_last4 = models.CharField(max_length=4, blank=True, verbose_name='Последние 4 цифры карты')
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'username']

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"


class PhoneVerificationCode(models.Model):
    phone_number = models.CharField(max_length=20, verbose_name='Номер телефона')
    code = models.CharField(max_length=4, verbose_name='Код')
    is_used = models.BooleanField(default=False, verbose_name='Использован')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(verbose_name='Истекает')

    class Meta:
        verbose_name = 'Код подтверждения телефона'
        verbose_name_plural = 'Коды подтверждения телефона'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.phone_number} — {self.code}'