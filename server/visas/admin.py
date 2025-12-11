from django.contrib import admin
from .models import VisaType, VisaStep


class VisaStepInline(admin.TabularInline):
    model = VisaStep
    extra = 1
    fields = ['order', 'title', 'estimated_time_days', 'estimated_cost_usd']


@admin.register(VisaType)
class VisaTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'country', 'category', 'is_active', 'data_confidence', 'needs_review', 'processing_time_min_weeks']
    list_filter = ['country', 'is_active', 'data_confidence', 'needs_review', 'category']
    search_fields = ['name', 'country__name', 'description']
    list_editable = ['data_confidence', 'needs_review']
    inlines = [VisaStepInline]
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Info', {
            'fields': ('country', 'name', 'slug', 'category', 'description')
        }),
        ('Processing Details', {
            'fields': ('processing_time_min_weeks', 'processing_time_max_weeks', 
                      'duration_months', 'cost_estimate_min', 'cost_estimate_max')
        }),
        ('Requirements & Benefits', {
            'fields': ('requirements', 'benefits', 'restrictions'),
            'classes': ('collapse',)
        }),
        ('Status & Flags', {
            'fields': ('is_active', 'is_popular', 'is_renewable', 'success_rate')
        }),
        ('Data Quality', {
            'fields': ('data_confidence', 'needs_review')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )