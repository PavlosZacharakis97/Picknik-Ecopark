from django.db import models
from django.utils.translation import gettext_lazy as _


class Tip(models.Model):
    title = models.CharField(max_length=200, verbose_name=_('Заголовок'))
    body = models.TextField(verbose_name=_('Текст'))
    tags = models.CharField(max_length=255, blank=True, verbose_name=_('Теги через запятую'))
    order = models.PositiveIntegerField(default=0, verbose_name=_('Порядок'))
    is_active = models.BooleanField(default=True, verbose_name=_('Активен'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Совет')
        verbose_name_plural = _('Советы')
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title
