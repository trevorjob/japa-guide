from django.db import models
from django.conf import settings


MODE_CHOICES = [
    ('roadmap_enrich', 'Roadmap Enrichment'),
    ('doc_builder', 'Document Builder'),
    ('compare', 'Country Comparison'),
    ('interview_prep', 'Interview Preparation'),
    ('general', 'General'),
]

TONE_CHOICES = [
    ('helpful', 'Helpful'),
    ('uncle_japa', 'Uncle Japa'),
    ('bestie', 'Bestie'),
    ('strict_officer', 'Strict Officer'),
    ('hype_man', 'Hype Man'),
    ('therapist', 'Therapist'),
]


class PromptTemplate(models.Model):
    """
    Reusable prompt templates for AI with personality support.
    """
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    prompt_text = models.TextField(
        help_text="Jinja2 template with {{variables}}"
    )
    temperature = models.FloatField(default=0.7)
    max_tokens = models.IntegerField(default=1000)
    mode = models.CharField(max_length=20, choices=MODE_CHOICES)
    tone = models.CharField(max_length=20, choices=TONE_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['mode', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.mode})"


class AIRequest(models.Model):
    """
    Log all AI requests for debugging and analytics.
    """
    # Session-aware for anonymous users
    session_id = models.CharField(
        max_length=255, 
        blank=True, 
        db_index=True,
        help_text="Track anonymous usage"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='ai_requests'
    )
    prompt_template = models.ForeignKey(
        PromptTemplate,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    prompt_text = models.TextField()
    response_text = models.TextField()
    model_used = models.CharField(max_length=50, default='gpt-4o-mini')
    tokens_used = models.IntegerField(null=True, blank=True)
    cost_usd = models.DecimalField(
        max_digits=10, 
        decimal_places=6, 
        null=True, 
        blank=True
    )
    duration_seconds = models.FloatField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['session_id']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        user_id = self.user.username if self.user else self.session_id[:8]
        return f"AI Request by {user_id} at {self.created_at}"