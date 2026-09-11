from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Task, TaskSubmission
from .serializers import TaskSerializer, TaskSubmissionCreateSerializer, TaskSubmissionSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def task_list(request):
    tasks = Task.objects.filter(is_active=True)
    return Response(TaskSerializer(tasks, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def task_submission_create(request):
    serializer = TaskSubmissionCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    submission = serializer.save(user=request.user)
    return Response(TaskSubmissionSerializer(submission).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_submission_list(request):
    submissions = TaskSubmission.objects.filter(user=request.user)
    return Response(TaskSubmissionSerializer(submissions, many=True).data)
