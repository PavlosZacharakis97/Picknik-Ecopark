from django.contrib import admin
from .models import Cottage, Booking, Review


@admin.register(Cottage)
class CottageAdmin(admin.ModelAdmin):
    list_display = ['number', 'name', 'cottage_type', 'price_per_night', 'max_guests', 'is_active']
    list_filter = ['cottage_type', 'is_active', 'has_wifi', 'has_kitchen']
    search_fields = ['name', 'number', 'description']
    list_editable = ['price_per_night', 'is_active']



@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'cottage', 'check_in', 'check_out', 'guests', 'total_price', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__email', 'cottage__name', 'promo_code']
    date_hierarchy = 'check_in'


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['booking', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']