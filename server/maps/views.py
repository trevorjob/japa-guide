from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import GeoPoint
from .serializers import GeoPointSerializer


class GeoPointViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GeoPoint.objects.filter(is_active=True)
    serializer_class = GeoPointSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        country = self.request.query_params.get('country')
        city = self.request.query_params.get('city')
        point_type = self.request.query_params.get('type')
        
        if country:
            queryset = queryset.filter(country__code=country)
        if city:
            queryset = queryset.filter(city_name__icontains=city)
        if point_type:
            queryset = queryset.filter(point_type=point_type)
        
        return queryset