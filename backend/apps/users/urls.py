from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('phone/send-code/', views.phone_send_code, name='phone-send-code'),
    path('phone/verify-code/', views.phone_verify_code, name='phone-verify-code'),
]