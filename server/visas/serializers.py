from rest_framework import serializers
from .models import VisaType, VisaStep


class VisaStepSerializer(serializers.ModelSerializer):
    """Serializer for visa steps."""
    class Meta:
        model = VisaStep
        fields = [
            'id', 'order', 'title', 'description', 'estimated_time_days',
            'estimated_cost_usd', 'tips', 'common_pitfalls'
        ]


class VisaTypeListSerializer(serializers.ModelSerializer):
    """Serializer for visa type list."""
    country_name = serializers.CharField(source='country.name', read_only=True)
    country_code = serializers.CharField(source='country.code', read_only=True)
    
    class Meta:
        model = VisaType
        fields = [
            'id', 'name', 'slug', 'country_name', 'country_code',
            'processing_time_min_weeks', 'processing_time_max_weeks',
            'cost_estimate_min', 'cost_estimate_max', 'is_active'
        ]


class VisaTypeDetailSerializer(serializers.ModelSerializer):
    """Serializer for visa type detail with steps."""
    steps = VisaStepSerializer(many=True, read_only=True)
    country_name = serializers.CharField(source='country.name', read_only=True)
    country_code = serializers.CharField(source='country.code', read_only=True)
    
    class Meta:
        model = VisaType
        fields = [
            'id', 'name', 'slug', 'description', 'country_name', 'country_code',
            'processing_time_min_weeks', 'processing_time_max_weeks',
            'cost_estimate_min', 'cost_estimate_max', 'requirements',
            'steps', 'is_active', 'created_at', 'updated_at'
        ]