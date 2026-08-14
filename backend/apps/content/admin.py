from django.contrib import admin

from .models import Tip, ContactMessage


@admin.register(Tip)
class TipAdmin(admin.ModelAdmin):
    list_display = ['title', 'tags', 'order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['title', 'tags']
    list_editable = ['order', 'is_active']


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['name', 'email', 'message']
    list_editable = ['is_read']
