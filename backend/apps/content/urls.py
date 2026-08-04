from django.urls import path
from . import views

urlpatterns = [
    path('tips/', views.tip_list, name='tip-list'),
]
