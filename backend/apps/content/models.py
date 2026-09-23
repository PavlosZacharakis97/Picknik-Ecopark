from django.db import models
from django.utils.translation import gettext_lazy as _


class ContactMessage(models.Model):
    name = models.CharField(max_length=100, verbose_name=_('Имя'))
    email = models.EmailField(verbose_name=_('Email'))
    message = models.TextField(verbose_name=_('Сообщение'))
    is_read = models.BooleanField(default=False, verbose_name=_('Прочитано'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Сообщение с сайта')
        verbose_name_plural = _('Сообщения с сайта')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} <{self.email}>'
