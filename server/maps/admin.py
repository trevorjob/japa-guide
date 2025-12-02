from django.contrib import admin
from .models import GeoPoint


@admin.register(GeoPoint)
class GeoPointAdmin(admin.ModelAdmin):
    list_display = ['name', 'city_name', 'country', 'point_type', 'is_active']
    list_filter = ['point_type', 'country', 'is_active']
    search_fields = ['name', 'city_name', 'country__name']
    ordering = ['country', 'city_name', 'name']