from django.db import models
from django.conf import settings
from django.utils.text import slugify
from cloudinary.models import CloudinaryField
from countries.models import Country


class Story(models.Model):
    """User-generated migration story (japa journal)."""
    # Author info
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='stories'
    )
    author_name = models.CharField(
        max_length=255,
        help_text="Display name (can be different from username)"
    )
    
    # Story content
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    content = models.TextField()
    excerpt = models.TextField(
        blank=True,
        help_text="Short summary (auto-generated if empty)"
    )
    
    # Related country
    country = models.ForeignKey(
        Country,
        on_delete=models.CASCADE,
        related_name='stories'
    )
    
    # Categorization
    tags = models.JSONField(
        default=list,
        help_text="Tags like 'student', 'work', 'family', etc."
    )
    
    # Media
    cover_image = CloudinaryField('story_covers', blank=True, null=True)
    
    # Moderation
    approved = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)
    
    # Stats
    views_count = models.IntegerField(default=0)
    likes_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Stories'
        indexes = [
            models.Index(fields=['approved', '-created_at']),
            models.Index(fields=['country']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        if not self.excerpt and self.content:
            self.excerpt = self.content[:200] + '...'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.title} by {self.author_name}"