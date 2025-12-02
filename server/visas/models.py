from django.db import models
from countries.models import Country


class VisaType(models.Model):
    """
    Visa type model representing different visa programs for countries.
    """
    country = models.ForeignKey(
        Country, 
        on_delete=models.CASCADE, 
        related_name='visa_types'
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    description = models.TextField()
    processing_time_min_weeks = models.IntegerField(null=True, blank=True)
    processing_time_max_weeks = models.IntegerField(null=True, blank=True)
    cost_estimate_min = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    cost_estimate_max = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    requirements = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['country', 'name']
        unique_together = ['country', 'slug']
    
    def __str__(self):
        return f"{self.name} - {self.country.name}"


class VisaStep(models.Model):
    """
    Individual step in a visa application process.
    """
    visa_type = models.ForeignKey(
        VisaType, 
        on_delete=models.CASCADE, 
        related_name='steps'
    )
    order = models.IntegerField(help_text="Step order in the process")
    title = models.CharField(max_length=255)
    description = models.TextField()
    estimated_time_days = models.IntegerField(null=True, blank=True)
    estimated_cost_usd = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Cost for this specific step"
    )
    tips = models.JSONField(default=list, blank=True)
    common_pitfalls = models.JSONField(default=list, blank=True)
    
    class Meta:
        ordering = ['visa_type', 'order']
        unique_together = ['visa_type', 'order']
    
    def __str__(self):
        return f"{self.visa_type.name} - Step {self.order}: {self.title}"