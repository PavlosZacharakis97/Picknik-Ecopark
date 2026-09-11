from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Transaction(models.Model):
    TYPE_CHOICES = [
        ('referral_booking_bonus', _('Бонус за бронь реферала')),
        ('referral_task_bonus', _('Бонус за задание реферала')),
        ('task_reward', _('Награда за задание')),
        ('withdrawal', _('Вывод средств')),
        ('booking_payment_from_balance', _('Оплата брони с баланса')),
        ('admin_adjustment', _('Корректировка администратором')),
    ]

    STATUS_CHOICES = [
        ('pending', _('В ожидании')),
        ('completed', _('Выполнено')),
        ('rejected', _('Отклонено')),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions', verbose_name=_('Пользователь'))
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, verbose_name=_('Тип'))
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Сумма'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed', verbose_name=_('Статус'))
    description = models.CharField(max_length=255, blank=True, verbose_name=_('Описание'))
    related_object_type = models.CharField(max_length=30, blank=True, verbose_name=_('Тип связанного объекта'))
    related_object_id = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('ID связанного объекта'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Операция')
        verbose_name_plural = _('Операции')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_type_display()} — {self.amount} ({self.user})'


class Withdrawal(models.Model):
    METHOD_CHOICES = [
        ('visa', 'Visa'),
        ('mastercard', 'Mastercard'),
    ]

    STATUS_CHOICES = [
        ('pending', _('В ожидании')),
        ('approved', _('Одобрено')),
        ('rejected', _('Отклонено')),
        ('paid', _('Оплачено')),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='withdrawals', verbose_name=_('Пользователь'))
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Сумма к списанию'))
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Комиссия'))
    payout_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Сумма к выплате'))
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, verbose_name=_('Способ вывода'))
    card_last4 = models.CharField(max_length=4, blank=True, verbose_name=_('Последние 4 цифры карты'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name=_('Статус'))
    admin_comment = models.CharField(max_length=255, blank=True, verbose_name=_('Комментарий администратора'))
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('Заявка на вывод средств')
        verbose_name_plural = _('Заявки на вывод средств')
        ordering = ['-requested_at']

    def __str__(self):
        return f'Вывод {self.amount} — {self.user} ({self.get_status_display()})'


class ReferralCommission(models.Model):
    SOURCE_CHOICES = [
        ('booking_payment', _('Оплата брони')),
        ('task_reward', _('Награда за задание')),
    ]

    referrer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='commissions_earned', verbose_name=_('Реферер'))
    referred_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='commissions_generated', verbose_name=_('Реферал'))
    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES, verbose_name=_('Источник'))
    source_object_id = models.PositiveIntegerField(verbose_name=_('ID источника'))
    base_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Сумма основания'))
    commission_rate = models.DecimalField(max_digits=4, decimal_places=2, verbose_name=_('Ставка'))
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Сумма комиссии'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Реферальная комиссия')
        verbose_name_plural = _('Реферальные комиссии')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.commission_amount} — {self.referrer} ← {self.referred_user}'
