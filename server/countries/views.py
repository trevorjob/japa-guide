from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as df_filters
from .models import Country
from .serializers import CountryListSerializer, CountryDetailSerializer


class CountryFilter(df_filters.FilterSet):
    """Custom filter for Country model with range support"""
    difficulty_score__gte = df_filters.NumberFilter(field_name='difficulty_score', lookup_expr='gte')
    difficulty_score__lte = df_filters.NumberFilter(field_name='difficulty_score', lookup_expr='lte')
    
    class Meta:
        model = Country
        fields = ['region', 'difficulty_score']


class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for countries - read-only, no auth required.
    """
    queryset = Country.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CountryFilter
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'difficulty_score', 'cost_of_living_index']
    lookup_field = 'code'
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CountryDetailSerializer
        return CountryListSerializer