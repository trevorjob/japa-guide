from django.contrib import admin
from .models import Country, Source, EconomicIndicator, CountryDocument


@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ['name', 'source_type', 'reliability_level', 'country', 'last_checked', 'is_active']
    list_filter = ['source_type', 'reliability_level', 'is_active']
    search_fields = ['name', 'description', 'url']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        (None, {
            'fields': ('name', 'url', 'description')
        }),
        ('Classification', {
            'fields': ('source_type', 'reliability_level', 'country')
        }),
        ('Status', {
            'fields': ('is_active', 'last_checked')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'region', 'difficulty_score', 'cost_of_living_index', 'data_confidence', 'needs_review']
    list_filter = ['region', 'data_confidence', 'needs_review', 'is_featured']
    search_fields = ['name', 'code']
    ordering = ['name']
    list_editable = ['data_confidence', 'needs_review']
    readonly_fields = ['data_quality_score', 'created_at', 'updated_at']
    fieldsets = (
        ('Basic Info', {
            'fields': ('code', 'code_alpha2', 'name', 'region', 'subregion', 'currency', 'population', 'area_sq_km')
        }),
        ('Images', {
            'fields': ('flag_image', 'flag_svg_url', 'flag_png_url', 'hero_image'),
            'classes': ('collapse',)
        }),
        ('Cost of Living', {
            'fields': ('cost_of_living_index', 'cpi_annual_change', 'ppp_conversion_factor', 
                      'avg_rent_monthly_usd', 'avg_meal_cost_usd', 'healthcare_monthly_usd')
        }),
        ('Migration Metrics', {
            'fields': ('difficulty_score', 'refugees_in', 'refugees_out', 'asylum_seekers', 
                      'net_migration', 'idp_count')
        }),
        ('Economic Indicators', {
            'fields': ('gdp_per_capita_usd', 'unemployment_rate', 'life_expectancy', 'literacy_rate')
        }),
        ('Visa Info', {
            'fields': ('visa_summary', 'visa_types_count', 'visa_last_reviewed')
        }),
        ('Data Quality & Provenance', {
            'fields': ('data_quality_score', 'data_confidence', 'needs_review', 'is_featured')
        }),
        ('Data Sources', {
            'fields': ('basic_data_source', 'basic_data_last_synced',
                      'migration_data_source', 'migration_data_last_synced',
                      'economic_data_source', 'economic_data_last_synced'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EconomicIndicator)
class EconomicIndicatorAdmin(admin.ModelAdmin):
    list_display = ['country', 'indicator_name', 'value', 'value_text', 'year', 'source_name']
    list_filter = ['indicator_name', 'year', 'source_name']
    search_fields = ['country__name', 'country__code', 'indicator_name']
    ordering = ['-year', 'country__name', 'indicator_name']
    raw_id_fields = ['country']


@admin.register(CountryDocument)
class CountryDocumentAdmin(admin.ModelAdmin):
    list_display = ['country', 'doc_type', 'title', 'word_count', 'data_confidence', 'needs_review', 'updated_at']
    list_filter = ['doc_type', 'data_confidence', 'needs_review', 'country__region']
    search_fields = ['title', 'content', 'country__name', 'country__code']
    ordering = ['country__name', 'doc_type', 'title']
    list_editable = ['data_confidence', 'needs_review']
    readonly_fields = ['word_count', 'created_at', 'updated_at']
    raw_id_fields = ['country', 'source']
    fieldsets = (
        ('Document Info', {
            'fields': ('country', 'title', 'doc_type')
        }),
        ('Content', {
            'fields': ('content',)
        }),
        ('Source & Quality', {
            'fields': ('source', 'data_confidence', 'needs_review', 'last_verified')
        }),
        ('Metadata', {
            'fields': ('word_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )