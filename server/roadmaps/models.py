from django.db import models
from django.conf import settings
from countries.models import Country
from visas.models import VisaType


GOAL_CHOICES = [
    ('study', 'Study'),
    ('work', 'Work'),
    ('business', 'Business'),
    ('family', 'Family'),
    ('other', 'Other'),
]

STATUS_CHOICES = [
    ('draft', 'Draft'),
    ('active', 'Active'),
    ('completed', 'Completed'),
    ('archived', 'Archived'),
]

TONE_CHOICES = [
    ('helpful', 'Helpful'),
    ('uncle_japa', 'Uncle Japa'),
    ('bestie', 'Bestie'),
    ('strict_officer', 'Strict Officer'),
    ('hype_man', 'Hype Man'),
    ('therapist', 'Therapist'),
]


class Roadmap(models.Model):
    """
    Generated migration roadmap for a user or anonymous session.
    """
    # Session-aware fields
    session_id = models.CharField(
        max_length=255, 
        blank=True, 
        db_index=True,
        help_text="For anonymous users - Redis session key"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, 
        blank=True, 
        on_delete=models.CASCADE,
        related_name='roadmaps'
    )
    is_anonymous = models.BooleanField(
        default=False,
        help_text="Track if created without login"
    )
    
    # Roadmap details
    title = models.CharField(max_length=255)
    country = models.ForeignKey(
        Country, 
        on_delete=models.CASCADE,
        related_name='roadmaps'
    )
    visa_type = models.ForeignKey(
        VisaType, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL
    )
    goal = models.CharField(max_length=20, choices=GOAL_CHOICES)
    profile_snapshot = models.JSONField(
        default=dict,
        help_text="Snapshot of profile at generation time"
    )
    ai_tone = models.CharField(
        max_length=20, 
        choices=TONE_CHOICES, 
        default='helpful'
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='draft'
    )
    
    # Future features
    is_premium = models.BooleanField(
        default=False,
        help_text="For future premium features"
    )
    export_count = models.IntegerField(
        default=0,
        help_text="Track PDF exports"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['session_id']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.country.name}"


class RoadmapStep(models.Model):
    """
    Individual step in a roadmap (normalized, not JSON).
    """
    roadmap = models.ForeignKey(
        Roadmap, 
        on_delete=models.CASCADE, 
        related_name='steps'
    )
    order = models.IntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField()
    estimated_time_days = models.IntegerField(null=True, blank=True)
    estimated_cost_usd = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    tips = models.JSONField(default=list, blank=True)
    pitfalls = models.JSONField(default=list, blank=True)
    documents_needed = models.JSONField(default=list, blank=True)
    
    # AI enhancement
    ai_enhanced = models.BooleanField(
        default=False,
        help_text="Was this enhanced by AI?"
    )
    ai_enhancement = models.TextField(
        blank=True,
        help_text="Additional AI advice"
    )
    
    class Meta:
        ordering = ['roadmap', 'order']
        unique_together = ['roadmap', 'order']
    
    def __str__(self):
        return f"{self.roadmap.title} - Step {self.order}: {self.title}"


class RoadmapStepStatus(models.Model):
    """
    Track completion status and notes for roadmap steps.
    """
    step = models.OneToOneField(
        RoadmapStep, 
        on_delete=models.CASCADE, 
        related_name='status'
    )
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    blocked = models.BooleanField(default=False)
    blocker_reason = models.TextField(blank=True)
    
    def __str__(self):
        status = "Completed" if self.completed else ("Blocked" if self.blocked else "Pending")
        return f"{self.step.title} - {status}"