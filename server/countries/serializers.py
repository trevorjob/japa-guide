from rest_framework import serializers
from .models import Country, Source, CountryDocument


class CountryListSerializer(serializers.ModelSerializer):
    """Serializer for country list view."""
    class Meta:
        model = Country
        fields = [
            'id', 'code', 'code_alpha2', 'name', 'region', 'subregion',
            'currency', 'flag_image', 'flag_svg_url', 'flag_png_url',
            'cost_of_living_index', 'difficulty_score', 'population',
            'data_quality_score', 'is_featured'
        ]


class CountryDetailSerializer(serializers.ModelSerializer):
    """Serializer for country detail view with full cost data."""
    visa_types_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Country
        fields = [
            # Basic Info
            'id', 'code', 'code_alpha2', 'name', 'region', 'subregion',
            'currency', 'population', 'area_sq_km',
            'flag_image', 'flag_svg_url', 'flag_png_url', 'hero_image', 'summary',
            
            # Cost & Difficulty
            'cost_of_living_index', 'difficulty_score',
            'avg_rent_monthly_usd', 'avg_meal_cost_usd', 'healthcare_monthly_usd',
            'cpi_annual_change', 'ppp_conversion_factor',
            
            # Migration Metrics
            'refugees_in', 'refugees_out', 'asylum_seekers', 'net_migration', 'idp_count',
            
            # Economic Indicators
            'gdp_per_capita_usd', 'unemployment_rate', 'life_expectancy', 'literacy_rate',
            
            # Visa Info
            'visa_summary', 'visa_types_count', 'visa_last_reviewed', 'immigration_url',
            
            # Data Quality & Tracking
            'data_quality_score', 'data_confidence', 'needs_review', 'is_featured',
            'basic_data_source', 'basic_data_last_synced',
            'migration_data_source', 'migration_data_last_synced',
            'economic_data_source', 'economic_data_last_synced',
            
            # Metadata & Timestamps
            'metadata', 'created_at', 'updated_at'
        ]
    
    def get_visa_types_count(self, obj):
        return obj.visa_types.filter(is_active=True).count()


class SourceSerializer(serializers.ModelSerializer):
    """Serializer for data sources."""
    country_name = serializers.CharField(source='country.name', read_only=True)
    
    class Meta:
        model = Source
        fields = [
            'id', 'name', 'url', 'country', 'country_name',
            'source_type', 'reliability_level', 'description',
            'last_checked', 'is_active', 'created_at', 'updated_at'
        ]


class CountryDocumentSerializer(serializers.ModelSerializer):
    """Serializer for RAG documents."""
    country_name = serializers.CharField(source='country.name', read_only=True)
    country_code = serializers.CharField(source='country.code', read_only=True)
    source_name = serializers.CharField(source='source.name', read_only=True)
    doc_type_display = serializers.CharField(source='get_doc_type_display', read_only=True)
    
    class Meta:
        model = CountryDocument
        fields = [
            'id', 'country', 'country_name', 'country_code',
            'title', 'content', 'doc_type', 'doc_type_display',
            'source', 'source_name',
            'data_confidence', 'needs_review', 'word_count',
            'last_verified', 'created_at', 'updated_at'
        ]


class CountryDocumentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for document lists (no content)."""
    country_name = serializers.CharField(source='country.name', read_only=True)
    country_code = serializers.CharField(source='country.code', read_only=True)
    doc_type_display = serializers.CharField(source='get_doc_type_display', read_only=True)
    
    class Meta:
        model = CountryDocument
        fields = [
            'id', 'country', 'country_name', 'country_code',
            'title', 'doc_type', 'doc_type_display',
            'data_confidence', 'word_count', 'updated_at'
        ]