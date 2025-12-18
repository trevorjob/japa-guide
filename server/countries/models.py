from django.db import models
from cloudinary.models import CloudinaryField


class Source(models.Model):
    """
    Tracks data provenance - where information came from and how reliable it is.
    Used for audit trails and data transparency.
    """
    SOURCE_TYPE_CHOICES = [
        ('official', 'Official Government Source'),
        ('index', 'Research Index/Report'),
        ('aggregator', 'Data Aggregator'),
    ]
    
    RELIABILITY_CHOICES = [
        ('high', 'High - Official/Verified'),
        ('medium', 'Medium - Reputable Third-Party'),
        ('low', 'Low - Unverified/Estimated'),
    ]
    
    name = models.CharField(
        max_length=255,
        help_text="Name of the data source (e.g., 'World Bank Open Data')"
    )
    url = models.URLField(
        blank=True,
        help_text="URL to the source or API documentation"
    )
    country = models.ForeignKey(
        'Country',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sources',
        help_text="If source is country-specific (e.g., a government website)"
    )
    source_type = models.CharField(
        max_length=20,
        choices=SOURCE_TYPE_CHOICES,
        default='aggregator',
        db_index=True
    )
    reliability_level = models.CharField(
        max_length=10,
        choices=RELIABILITY_CHOICES,
        default='medium',
        db_index=True
    )
    description = models.TextField(
        blank=True,
        help_text="Description of what data this source provides"
    )
    last_checked = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When we last verified this source was active/accurate"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this source is still being used"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['source_type']),
            models.Index(fields=['reliability_level']),
        ]
    
    def __str__(self):
        country_str = f" ({self.country.code})" if self.country else ""
        return f"{self.name}{country_str} [{self.reliability_level}]"


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
    immigration_url = models.URLField(
        blank=True,
        help_text="Official government immigration website URL"
    )
    
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
    data_confidence = models.CharField(
        max_length=10,
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')],
        default='medium',
        db_index=True,
        help_text="Confidence level in the accuracy of this data"
    )
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


class EconomicIndicator(models.Model):
    """
    Stores economic indicators from external sources (World Bank, etc.).
    Allows tracking historical data and multiple sources per indicator.
    """
    country = models.ForeignKey(
        Country,
        on_delete=models.CASCADE,
        related_name='economic_indicators'
    )
    indicator_name = models.CharField(
        max_length=50,
        db_index=True,
        help_text="e.g., gdp_per_capita_usd, unemployment_rate, income_category"
    )
    value = models.DecimalField(
        max_digits=20,
        decimal_places=4,
        null=True,
        blank=True,
        help_text="Numeric value for the indicator"
    )
    value_text = models.CharField(
        max_length=100,
        blank=True,
        help_text="Text value for categorical indicators (e.g., income_category)"
    )
    year = models.IntegerField(db_index=True)
    source_name = models.CharField(
        max_length=50,
        default='World Bank',
        help_text="Data source name"
    )
    source_indicator_code = models.CharField(
        max_length=50,
        blank=True,
        help_text="Original indicator code from source API"
    )
    fetched_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-year', 'country', 'indicator_name']
        unique_together = ['country', 'indicator_name', 'year']
        indexes = [
            models.Index(fields=['country', 'indicator_name']),
            models.Index(fields=['year', 'indicator_name']),
        ]

    def __str__(self):
        val = self.value_text if self.value_text else self.value
        return f"{self.country.code} - {self.indicator_name} ({self.year}): {val}"


class CountryDocument(models.Model):
    """
    RAG-ready documents for country-specific immigration information.
    These are chunked, factual documents sourced from official sources.
    """
    DOC_TYPE_CHOICES = [
        ('overview', 'Country Overview'),
        ('visas', 'Visa Pathways'),
        ('work', 'Work Immigration'),
        ('study', 'Study Immigration'),
        ('family', 'Family Immigration'),
        ('asylum', 'Asylum & Refugee'),
        ('citizenship', 'Citizenship & Naturalization'),
    ]
    
    country = models.ForeignKey(
        Country,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    title = models.CharField(
        max_length=255,
        help_text="Document title for display and search"
    )
    content = models.TextField(
        help_text="Full document content - will be chunked for RAG"
    )
    doc_type = models.CharField(
        max_length=20,
        choices=DOC_TYPE_CHOICES,
        db_index=True
    )
    source = models.ForeignKey(
        Source,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents',
        help_text="Primary source for this document"
    )
    
    # Data quality tracking
    data_confidence = models.CharField(
        max_length=10,
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')],
        default='medium',
        db_index=True
    )
    needs_review = models.BooleanField(
        default=False,
        help_text="Flag for documents needing verification"
    )
    
    # Metadata
    word_count = models.IntegerField(default=0, editable=False)
    last_verified = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When content was last verified against source"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['country', 'doc_type', 'title']
        unique_together = ['country', 'doc_type', 'title']
        indexes = [
            models.Index(fields=['country', 'doc_type']),
            models.Index(fields=['doc_type']),
            models.Index(fields=['data_confidence']),
        ]
    
    def save(self, *args, **kwargs):
        # Auto-calculate word count
        self.word_count = len(self.content.split()) if self.content else 0
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.country.code} - {self.get_doc_type_display()}: {self.title}"