from django.urls import path
from . import views

urlpatterns = [
    # Cottages
    path('cottages/', views.cottage_list, name='cottage-list'),
    path('cottages/<int:pk>/', views.cottage_detail, name='cottage-detail'),
    
    # Price calculator
    path('bookings/calculate-price/', views.calculate_price, name='calculate-price'),
    
    # Bookings
    path('bookings/', views.booking_list, name='booking-list'),
    path('bookings/create/', views.booking_create, name='booking-create'),
    path('bookings/<int:pk>/', views.booking_detail, name='booking-detail'),
    path('bookings/<int:pk>/cancel/', views.booking_cancel, name='booking-cancel'),
    
    # Reviews
    path('cottages/<int:cottage_id>/reviews/', views.review_list, name='review-list'),
    path('reviews/create/', views.review_create, name='review-create'),
    
    # Weather
    path('weather/', views.weather, name='weather'),
]