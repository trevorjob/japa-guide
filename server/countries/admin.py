from django.contrib import admin
from .models import Country


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'region', 'difficulty_score', 'cost_of_living_index']
    list_filter = ['region']
    search_fields = ['name', 'code']
    ordering = ['name']