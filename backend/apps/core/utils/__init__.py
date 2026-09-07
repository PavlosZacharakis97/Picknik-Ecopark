from rest_framework import status
from rest_framework.response import Response


def too_many_requests():
    return Response(
        {'error': 'Слишком много попыток. Попробуйте позже.'},
        status=status.HTTP_429_TOO_MANY_REQUESTS,
    )
