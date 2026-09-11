from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Task(models.Model):
    PLATFORM_CHOICES = [
        ('vk', 'VK'),
        ('instagram', 'Instagram'),
        ('tiktok', 'TikTok'),
    ]

    title = models.CharField(max_length=200, verbose_name=_('Название'))
    description = models.TextField(verbose_name=_('Описание'))
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, verbose_name=_('Платформа'))
    reward_min = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Награда от'))
    reward_max = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Награда до'))
    is_active = models.BooleanField(default=True, verbose_name=_('Активно'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Задание')
        verbose_name_plural = _('Задания')
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class TaskSubmission(models.Model):
    STATUS_CHOICES = [
        ('pending', _('На модерации')),
        ('approved', _('Одобрено')),
        ('rejected', _('Отклонено')),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='task_submissions', verbose_name=_('Пользователь'))
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='submissions', verbose_name=_('Задание'))
    platform = models.CharField(max_length=20, choices=Task.PLATFORM_CHOICES, verbose_name=_('Платформа'))
    submitted_link = models.URLField(verbose_name=_('Ссылка на публикацию'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name=_('Статус'))
    reward_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name=_('Сумма начисления'))
    admin_comment = models.CharField(max_length=255, blank=True, verbose_name=_('Комментарий администратора'))
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('Заявка на задание')
        verbose_name_plural = _('Заявки на задания')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.task} — {self.user} ({self.get_status_display()})'
