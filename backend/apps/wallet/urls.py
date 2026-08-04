from django.urls import path
from . import views

urlpatterns = [
    path('referral/', views.referral_info, name='referral-info'),
    path('transactions/', views.transaction_list, name='transaction-list'),
    path('transactions/export/', views.transaction_export_csv, name='transaction-export'),
    path('withdrawals/', views.withdrawal_list, name='withdrawal-list'),
    path('withdrawals/create/', views.withdrawal_create, name='withdrawal-create'),
]
