from django.contrib import admin
from .models import VisaType, VisaStep


class VisaStepInline(admin.TabularInline):
    model = VisaStep
    extra = 1
    fields = ['order', 'title', 'estimated_time_days', 'estimated_cost_usd']


@admin.register(VisaType)
class VisaTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'country', 'is_active', 'processing_time_min_weeks']
    list_filter = ['country', 'is_active']
    search_fields = ['name', 'country__name']
    inlines = [VisaStepInline]