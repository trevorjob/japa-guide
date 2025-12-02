"""
Celery tasks for users app.
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from roadmaps.models import Roadmap
from ai.models import AIRequest


@shared_task
def cleanup_expired_sessions():
    """
    Delete roadmaps and AI requests from expired anonymous sessions.
    
    Runs daily via Celery beat. Sessions older than 30 days are cleaned up.
    """
    cutoff_date = timezone.now() - timedelta(days=30)
    
    # Delete old anonymous roadmaps
    old_roadmaps = Roadmap.objects.filter(
        is_anonymous=True,
        created_at__lt=cutoff_date
    )
    roadmap_count = old_roadmaps.count()
    old_roadmaps.delete()
    
    # Delete old anonymous AI requests
    old_ai_requests = AIRequest.objects.filter(
        user__isnull=True,
        created_at__lt=cutoff_date
    )
    ai_request_count = old_ai_requests.count()
    old_ai_requests.delete()
    
    return {
        'success': True,
        'roadmaps_deleted': roadmap_count,
        'ai_requests_deleted': ai_request_count,
        'cutoff_date': cutoff_date.isoformat()
    }
