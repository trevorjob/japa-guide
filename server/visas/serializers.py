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
    # Map backend field names to frontend expectations
    processing_time_min = serializers.IntegerField(source='processing_time_min_weeks', read_only=True)
    processing_time_max = serializers.IntegerField(source='processing_time_max_weeks', read_only=True)
    cost = serializers.DecimalField(source='cost_estimate_min', max_digits=10, decimal_places=2, read_only=True)
    cost_usd = serializers.SerializerMethodField()
    
    def get_cost_usd(self, obj):
        """Return cost as string for USD display."""
        if obj.cost_estimate_min:
            return str(obj.cost_estimate_min)
        return None
    
    class Meta:
        model = VisaType
        fields = [
            'id', 'name', 'slug', 'category', 'description', 'country', 'country_name', 'country_code',
            'processing_time_min', 'processing_time_max', 'processing_time_min_weeks', 'processing_time_max_weeks',
            'duration_months', 'cost', 'cost_usd', 'cost_estimate_min', 'cost_estimate_max',
            'success_rate', 'requirements', 'benefits', 'restrictions',
            'is_popular', 'is_renewable', 'steps', 'is_active', 'created_at', 'updated_at'
        ]