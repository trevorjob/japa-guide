from django.contrib.auth.models import AbstractUser
from django.db import models
from cloudinary.models import CloudinaryField


class User(AbstractUser):
    """
    Custom user model extending AbstractUser.
    Registration is optional - many features work without authentication.
    """
    full_name = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    country_of_origin = models.CharField(max_length=100, blank=True)
    current_country = models.CharField(max_length=100, blank=True)
    avatar = CloudinaryField('avatars', blank=True, null=True)
    is_anonymous_converted = models.BooleanField(
        default=False,
        help_text="Track if user started as anonymous and later registered"
    )
    
    # Future monetization fields
    plan_type = models.CharField(
        max_length=20,
        choices=[('free', 'Free'), ('pro', 'Pro'), ('enterprise', 'Enterprise')],
        default='free'
    )
    plan_expiry = models.DateField(null=True, blank=True)
    ai_credits_remaining = models.IntegerField(
        default=10,
        help_text="Free tier gets 10 AI generations"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.username or self.email or f"User {self.id}"


EDUCATION_CHOICES = [
    ('high_school', 'High School'),
    ('associate', 'Associate Degree'),
    ('bachelor', 'Bachelor Degree'),
    ('master', 'Master Degree'),
    ('phd', 'PhD'),
    ('other', 'Other'),
]


class UserProfile(models.Model):
    """
    Structured user profile data used for personalization.
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='profile'
    )
    education_level = models.CharField(
        max_length=20, 
        choices=EDUCATION_CHOICES, 
        blank=True
    )
    field_of_study = models.CharField(max_length=255, blank=True)
    years_experience = models.IntegerField(default=0)
    current_job_title = models.CharField(max_length=255, blank=True)
    
    budget_usd = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    monthly_savings_usd = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    target_move_date = models.DateField(null=True, blank=True)
    
    skills = models.JSONField(default=list, blank=True)
    languages = models.JSONField(default=list, blank=True)
    
    has_dependents = models.BooleanField(default=False)
    num_dependents = models.IntegerField(default=0)
    preferred_climate = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Profile for {self.user.username}"