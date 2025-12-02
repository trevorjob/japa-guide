from django.db import models
from cloudinary.models import CloudinaryField


class Country(models.Model):
    """
    Country model with migration-related metadata and cost data.
    Data sources: REST Countries API, UNHCR, World Bank, OECD
    """
    # Basic Info (from REST Countries API)
    code = models.CharField(max_length=3, unique=True, db_index=True, help_text="ISO 3166-1 alpha-3 code")
    code_alpha2 = models.CharField(max_length=2, blank=True, help_text="ISO 3166-1 alpha-2 code")
    name = models.CharField(max_length=255)
    region = models.CharField(max_length=100)
    subregion = models.CharField(max_length=100, blank=True)
    currency = models.CharField(max_length=10)
    population = models.BigIntegerField(null=True, blank=True)
    area_sq_km = models.FloatField(null=True, blank=True)
    
    # Images
    flag_image = CloudinaryField('flags', blank=True, null=True)
    flag_svg_url = models.URLField(blank=True, help_text="Flag SVG from REST Countries")
    flag_png_url = models.URLField(blank=True, help_text="Flag PNG from REST Countries")
    hero_image = CloudinaryField('country_heroes', blank=True, null=True)
    
    summary = models.TextField(blank=True)
    
    # Cost of living data (from OECD/World Bank approximations)
    cost_of_living_index = models.FloatField(
        null=True, 
        blank=True,
        help_text="Estimated from CPI and PPP data"
    )
    cpi_annual_change = models.FloatField(null=True, blank=True, help_text="Consumer Price Index % change")
    ppp_conversion_factor = models.FloatField(null=True, blank=True, help_text="Purchasing Power Parity")
    
    # Migration difficulty score (computed)
    difficulty_score = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Migration difficulty score 1-10 (computed from multiple factors)"
    )
    
    # Cost estimates (manual/computed)
    avg_rent_monthly_usd = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Average monthly rent in major cities (USD)"
    )
    avg_meal_cost_usd = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Average meal cost (USD)"
    )
    healthcare_monthly_usd = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Average monthly healthcare/insurance cost (USD)"
    )
    
    # Migration Metrics (from UNHCR + World Bank)
    refugees_in = models.IntegerField(null=True, blank=True, help_text="Refugees hosted")
    refugees_out = models.IntegerField(null=True, blank=True, help_text="Refugees from this country")
    asylum_seekers = models.IntegerField(null=True, blank=True, help_text="Pending asylum applications")
    net_migration = models.IntegerField(null=True, blank=True, help_text="Net migration (in - out)")
    idp_count = models.IntegerField(null=True, blank=True, help_text="Internally Displaced Persons")
    
    # Economic Indicators (from World Bank)
    gdp_per_capita_usd = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    unemployment_rate = models.FloatField(null=True, blank=True)
    life_expectancy = models.FloatField(null=True, blank=True)
    literacy_rate = models.FloatField(null=True, blank=True)
    
    # Visa Info (Manual for now)
    visa_summary = models.TextField(blank=True, help_text="Manual summary of visa options")
    visa_types_count = models.IntegerField(default=0, help_text="Number of visa types available")
    visa_last_reviewed = models.DateField(null=True, blank=True)
    
    # Data Source Tracking
    basic_data_source = models.CharField(max_length=50, default='rest_countries')
    basic_data_last_synced = models.DateTimeField(null=True, blank=True)
    
    migration_data_source = models.CharField(max_length=50, default='unhcr')
    migration_data_last_synced = models.DateTimeField(null=True, blank=True)
    
    economic_data_source = models.CharField(max_length=50, default='world_bank')
    economic_data_last_synced = models.DateTimeField(null=True, blank=True)
    
    # Quality Flags
    data_quality_score = models.IntegerField(default=0, help_text="0-100 completeness score")
    needs_review = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False, help_text="Featured on homepage")
    
    # Flexible metadata for future expansion
    metadata = models.JSONField(
        default=dict, 
        blank=True,
        help_text="Languages, timezones, borders, etc. from REST Countries"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Countries'
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['region']),
            models.Index(fields=['difficulty_score']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    def calculate_data_quality_score(self):
        """Calculate completeness score 0-100"""
        fields_to_check = [
            'population', 'region', 'currency', 'cost_of_living_index',
            'difficulty_score', 'refugees_in', 'refugees_out', 'gdp_per_capita_usd',
            'avg_rent_monthly_usd', 'visa_summary'
        ]
        filled = sum(1 for field in fields_to_check if getattr(self, field, None) is not None)
        return int((filled / len(fields_to_check)) * 100)
    
    def save(self, *args, **kwargs):
        """Auto-update data quality score on save"""
        self.data_quality_score = self.calculate_data_quality_score()
        super().save(*args, **kwargs)