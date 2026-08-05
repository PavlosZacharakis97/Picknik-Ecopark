from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Tip
from .serializers import TipSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def tip_list(request):
    tips = Tip.objects.filter(is_active=True)
    return Response(TipSerializer(tips, many=True).data)
