from django.urls import path
from . import views

urlpatterns = [
    path('', views.task_list, name='task-list'),
    path('submissions/', views.task_submission_list, name='task-submission-list'),
    path('submissions/create/', views.task_submission_create, name='task-submission-create'),
]
