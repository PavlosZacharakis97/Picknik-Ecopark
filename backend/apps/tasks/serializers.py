from rest_framework import serializers

from .models import Task, TaskSubmission


class TaskSerializer(serializers.ModelSerializer):
    platform_display = serializers.CharField(source='get_platform_display', read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'platform', 'platform_display', 'reward_min', 'reward_max']


class TaskSubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskSubmission
        fields = ['task', 'platform', 'submitted_link']


class TaskSubmissionSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = TaskSubmission
        fields = [
            'id', 'task', 'task_title', 'platform', 'submitted_link',
            'status', 'status_display', 'reward_amount', 'admin_comment', 'created_at',
        ]
        read_only_fields = ['status', 'reward_amount', 'admin_comment']
