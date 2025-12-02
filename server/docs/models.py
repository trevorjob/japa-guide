from django.db import models
from django.conf import settings
from cloudinary.models import CloudinaryField


DOCUMENT_TYPE_CHOICES = [
    ('cv', 'CV/Resume'),
    ('cover_letter', 'Cover Letter'),
    ('motivation_letter', 'Motivation Letter'),
    ('sop', 'Statement of Purpose'),
    ('reference', 'Reference Letter'),
    ('other', 'Other'),
]

FORMAT_CHOICES = [
    ('pdf', 'PDF'),
    ('docx', 'DOCX'),
    ('txt', 'TXT'),
]


class DocumentTemplate(models.Model):
    """Template for document generation."""
    name = models.CharField(max_length=255)
    template_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    description = models.TextField()
    content_template = models.TextField(
        help_text="Jinja2 template with placeholders for user data"
    )
    example_fields = models.JSONField(
        default=dict,
        help_text="Example fields and their descriptions"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['template_type', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"


class GeneratedDocument(models.Model):
    """User-generated document from a template."""
    # Session-aware for anonymous users
    session_id = models.CharField(
        max_length=255,
        blank=True,
        db_index=True,
        help_text="For anonymous users"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    template = models.ForeignKey(
        DocumentTemplate,
        on_delete=models.SET_NULL,
        null=True,
        related_name='generated_documents'
    )
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='pdf')
    cloudinary_url = models.URLField(blank=True, help_text="URL of generated file")
    
    metadata = models.JSONField(
        default=dict,
        help_text="User inputs used for generation"
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
        return f"{self.title} ({self.format})"