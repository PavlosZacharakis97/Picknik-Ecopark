from django.contrib import admin

from .models import Tip


@admin.register(Tip)
class TipAdmin(admin.ModelAdmin):
    list_display = ['title', 'tags', 'order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['title', 'tags']
    list_editable = ['order', 'is_active']
