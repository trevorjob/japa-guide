from rest_framework import serializers
from .models import Country


class CountryListSerializer(serializers.ModelSerializer):
    """Serializer for country list view."""
    class Meta:
        model = Country
        fields = [
            'id', 'code', 'name', 'region', 'currency', 'flag_image',
            'cost_of_living_index', 'difficulty_score', 'population'
        ]


class CountryDetailSerializer(serializers.ModelSerializer):
    """Serializer for country detail view with full cost data."""
    visa_types_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Country
        fields = [
            'id', 'code', 'name', 'region', 'currency', 'population',
            'flag_image', 'hero_image', 'summary', 'cost_of_living_index',
            'difficulty_score', 'avg_rent_monthly_usd', 'avg_meal_cost_usd',
            'healthcare_monthly_usd', 'metadata', 'visa_types_count',
            'created_at', 'updated_at'
        ]
    
    def get_visa_types_count(self, obj):
        return obj.visa_types.filter(is_active=True).count()