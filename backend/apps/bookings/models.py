from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Cottage(models.Model):
    COTTAGE_TYPES = [
        ('standard', _('Стандарт')),
        ('comfort', _('Комфорт')),
        ('luxury', _('Люкс')),
    ]

    name = models.CharField(max_length=100, verbose_name=_('Название'))
    number = models.PositiveIntegerField(unique=True, verbose_name=_('Номер домика'))
    description = models.TextField(blank=True, verbose_name=_('Описание'))
    cottage_type = models.CharField(max_length=20, choices=COTTAGE_TYPES, default='standard', verbose_name=_('Тип'))
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Цена за ночь'))
    max_guests = models.PositiveIntegerField(default=4, verbose_name=_('Макс. гостей'))
    bedrooms = models.PositiveIntegerField(default=1, verbose_name=_('Спальни'))
    bathrooms = models.PositiveIntegerField(default=1, verbose_name=_('Ванные'))
    has_wifi = models.BooleanField(default=True, verbose_name=_('Wi-Fi'))
    has_kitchen = models.BooleanField(default=True, verbose_name=_('Кухня'))
    has_bbq = models.BooleanField(default=False, verbose_name=_('Мангал'))
    image = models.ImageField(upload_to='cottages/', blank=True, verbose_name=_('Фото'))
    is_active = models.BooleanField(default=True, verbose_name=_('Активен'))
    latitude = models.FloatField(default=55.7558, verbose_name=_('Широта'))
    longitude = models.FloatField(default=37.6173, verbose_name=_('Долгота'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Коттедж')
        verbose_name_plural = _('Коттеджи')
        ordering = ['number']

    def __str__(self):
        return f'Домик №{self.number} — {self.name}'


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', _('Ожидает подтверждения')),
        ('confirmed', _('Подтверждено')),
        ('paid', _('Оплачено')),
        ('cancelled', _('Отменено')),
        ('completed', _('Завершено')),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings', verbose_name=_('Пользователь'))
    cottage = models.ForeignKey(Cottage, on_delete=models.CASCADE, related_name='bookings', verbose_name=_('Коттедж'))
    check_in = models.DateField(verbose_name=_('Заезд'))
    check_out = models.DateField(verbose_name=_('Выезд'))
    guests = models.PositiveIntegerField(default=1, verbose_name=_('Гостей'))
    total_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name=_('Итоговая цена'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name=_('Статус'))
    promo_code = models.CharField(max_length=50, blank=True, verbose_name=_('Промокод'))
    notes = models.TextField(blank=True, verbose_name=_('Примечания'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Бронирование')
        verbose_name_plural = _('Бронирования')
        ordering = ['-created_at']

    def __str__(self):
        return f'Бронь #{self.id} — {self.cottage.name} ({self.check_in} - {self.check_out})'


class Review(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='review', verbose_name=_('Бронирование'))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews', verbose_name=_('Пользователь'))
    rating = models.PositiveSmallIntegerField(default=5, verbose_name=_('Оценка'))
    comment = models.TextField(blank=True, verbose_name=_('Комментарий'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Отзыв')
        verbose_name_plural = _('Отзывы')

    def __str__(self):
        return f'Отзыв {self.rating}★ — {self.user.first_name}'