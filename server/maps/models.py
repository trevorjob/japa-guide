from django.db import models
from countries.models import Country


POINT_TYPE_CHOICES = [
    ('embassy', 'Embassy/Consulate'),
    ('university', 'University'),
    ('hospital', 'Hospital'),
    ('attraction', 'Tourist Attraction'),
    ('housing', 'Housing Area'),
    ('office', 'Government Office'),
    ('service', 'Service Center'),
    ('other', 'Other'),
]


class GeoPoint(models.Model):
    """Geographic point of interest for migration planning."""
    country = models.ForeignKey(
        Country,
        on_delete=models.CASCADE,
        related_name='geo_points'
    )
    city_name = models.CharField(max_length=255)
    
    # Geographic coordinates
    lat = models.FloatField(help_text="Latitude")
    lng = models.FloatField(help_text="Longitude")
    
    # Point details
    point_type = models.CharField(max_length=50, choices=POINT_TYPE_CHOICES)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    address = models.TextField(blank=True)
    
    # Additional info
    website = models.URLField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    
    metadata = models.JSONField(
        default=dict,
        help_text="Additional data like opening hours, requirements, etc."
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['country', 'city_name', 'name']
        indexes = [
            models.Index(fields=['country', 'city_name']),
            models.Index(fields=['point_type']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.city_name}, {self.country.name}"