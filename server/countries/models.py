from django.db import models
from cloudinary.models import CloudinaryField


class Country(models.Model):
    """
    Country model with migration-related metadata and cost data.
    """
    code = models.CharField(max_length=8, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    region = models.CharField(max_length=100)
    currency = models.CharField(max_length=10)
    population = models.IntegerField(null=True, blank=True)
    flag_image = CloudinaryField('flags', blank=True, null=True)
    hero_image = CloudinaryField('country_heroes', blank=True, null=True)
    summary = models.TextField()
    
    # Cost of living data
    cost_of_living_index = models.FloatField(null=True, blank=True)
    difficulty_score = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Migration difficulty score from 1-10"
    )
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
    
    # Flexible metadata for future expansion
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Countries'
    
    def __str__(self):
        return f"{self.name} ({self.code})"