from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
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
    
    @action(detail=True, methods=['post'], url_path='calculate-cost')
    def calculate_cost(self, request, code=None):
        """
        Calculate estimated costs for migrating to this country.
        POST /api/v1/countries/{code}/calculate-cost/
        
        Request body:
        {
            "lifestyle": "budget|moderate|comfortable|luxury",
            "accommodation": "shared|studio|one_bed|two_bed",
            "dining": "cook_home|mix|eat_out",
            "transportation": "public|mix|car",
            "duration_months": 12,
            "dependents": 0
        }
        """
        country = self.get_object()
        
        # Get request data
        lifestyle = request.data.get('lifestyle', 'moderate')
        accommodation = request.data.get('accommodation', 'studio')
        dining = request.data.get('dining', 'mix')
        transportation = request.data.get('transportation', 'public')
        duration_months = int(request.data.get('duration_months', 12))
        dependents = int(request.data.get('dependents', 0))
        
        # Get base costs from country data
        base_rent = float(country.avg_rent_monthly_usd or 1000)
        base_meal = float(country.avg_meal_cost_usd or 15)
        base_healthcare = float(country.healthcare_monthly_usd or 100)
        
        # Apply multipliers
        lifestyle_multipliers = {
            'budget': 0.7,
            'moderate': 1.0,
            'comfortable': 1.4,
            'luxury': 2.0
        }
        accommodation_multipliers = {
            'shared': 0.5,
            'studio': 1.0,
            'one_bed': 1.3,
            'two_bed': 1.7
        }
        dining_multipliers = {
            'cook_home': 0.6,
            'mix': 1.0,
            'eat_out': 1.8
        }
        transport_multipliers = {
            'public': 0.3,
            'mix': 0.6,
            'car': 1.2
        }
        
        lifestyle_factor = lifestyle_multipliers.get(lifestyle, 1.0)
        
        # Calculate costs
        housing = round(base_rent * accommodation_multipliers.get(accommodation, 1.0) * lifestyle_factor, 2)
        food = round(base_meal * 30 * dining_multipliers.get(dining, 1.0) * lifestyle_factor * (1 + dependents * 0.5), 2)
        transportation_cost = round(100 * transport_multipliers.get(transportation, 0.3) * lifestyle_factor, 2)
        utilities = round(150 * lifestyle_factor, 2)
        healthcare = round(base_healthcare * (1 + dependents), 2)
        entertainment = round(200 * lifestyle_factor, 2)
        visa_fees = 500  # Average estimate
        
        total_monthly = housing + food + transportation_cost + utilities + healthcare + entertainment
        total_cost = (total_monthly * duration_months) + visa_fees
        
        return Response({
            'country': {
                'code': country.code,
                'name': country.name,
                'currency': country.currency,
            },
            'input': {
                'lifestyle': lifestyle,
                'accommodation': accommodation,
                'dining': dining,
                'transportation': transportation,
                'duration_months': duration_months,
                'dependents': dependents,
            },
            'breakdown': {
                'housing': housing,
                'food': food,
                'transportation': transportation_cost,
                'utilities': utilities,
                'healthcare': healthcare,
                'entertainment': entertainment,
                'visa_fees': visa_fees,
            },
            'totals': {
                'monthly': round(total_monthly, 2),
                'total': round(total_cost, 2),
                'currency': country.currency,
            },
            'savings_plan': {
                'monthly_savings_needed': round(total_cost / 12, 2),
                'description': f'Save ${round(total_cost / 12, 2)}/month for 12 months to reach your goal'
            }
        })