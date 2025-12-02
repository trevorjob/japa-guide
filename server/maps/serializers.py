from rest_framework import serializers
from .models import GeoPoint


class GeoPointSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)
    country_code = serializers.CharField(source='country.code', read_only=True)
    
    class Meta:
        model = GeoPoint
        fields = [
            'id', 'country', 'country_name', 'country_code', 'city_name',
            'lat', 'lng', 'point_type', 'name', 'description', 'address',
            'website', 'phone', 'email', 'metadata', 'is_active'
        ]