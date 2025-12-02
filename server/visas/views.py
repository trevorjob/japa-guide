from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import VisaType
from .serializers import VisaTypeListSerializer, VisaTypeDetailSerializer


class VisaTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for visa types - read-only, no auth required.
    """
    queryset = VisaType.objects.filter(is_active=True).select_related('country').prefetch_related('steps')
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return VisaTypeDetailSerializer
        return VisaTypeListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        country_code = self.request.query_params.get('country')
        country_id = self.request.query_params.get('country_id')
        
        if country_code:
            queryset = queryset.filter(country__code=country_code.upper())
        elif country_id:
            queryset = queryset.filter(country__id=country_id)
        
        return queryset