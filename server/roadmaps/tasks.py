"""
Celery tasks for roadmaps app.
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Roadmap, RoadmapStep
from ai.services import ai_service


# @shared_task  # Commented out for synchronous execution - uncomment for async with Celery
def enrich_roadmap_with_ai(roadmap_id):
    """
    Enrich roadmap steps with AI personalization.
    
    This runs asynchronously after deterministic roadmap generation.
    """
    try:
        roadmap = Roadmap.objects.select_related('country', 'visa_type').get(id=roadmap_id)
        steps = roadmap.steps.all()
        
        if not steps.exists():
            return {'error': 'No steps found for roadmap'}
        
        # Build context for AI
        context = {
            'tone': roadmap.ai_tone,
            'country': roadmap.country.name,
            'goal': roadmap.goal,
            'profile': roadmap.profile_snapshot,
            'steps': [
                {
                    'order': step.order,
                    'title': step.title,
                    'description': step.description,
                    'estimated_time_days': step.estimated_time_days,
                    'estimated_cost_usd': float(step.estimated_cost_usd) if step.estimated_cost_usd else None
                }
                for step in steps
            ]
        }
        
        # Template for roadmap enrichment
        template_text = """{{personality_intro}}

USER PROFILE:
- Goal: {{goal}}
- Target Country: {{country}}
{% if profile.education_level %}- Education: {{profile.education_level}}{% endif %}
{% if profile.years_experience %}- Experience: {{profile.years_experience}} years{% endif %}
{% if profile.budget_usd %}- Budget: ${{profile.budget_usd}} USD{% endif %}

CURRENT ROADMAP STEPS:
{% for step in steps %}
Step {{step.order}}: {{step.title}}
{{step.description}}
{% endfor %}

YOUR TASK (use {{tone}} personality):
Enhance these roadmap steps with:
1. Personalized advice based on user's background
2. 2-3 practical tips per major phase
3. 2-3 common pitfalls to avoid (be specific)
4. Motivational encouragement appropriate to your personality

{{tone_instructions}}

Keep response under 500 words. Be authentic to your personality. Format as JSON with key "enrichments" containing array of step enhancements."""
        
        # Get AI response
        session_id = roadmap.session_id if roadmap.is_anonymous else None
        user = roadmap.user if not roadmap.is_anonymous else None
        
        result = ai_service.complete(
            template_text=template_text,
            context=context,
            use_cache=True,
            session_id=session_id,
            user=user
        )
        
        if 'error' in result:
            return {'error': result['error'], 'roadmap_id': roadmap_id}
        
        # Update steps with AI enhancement
        # For simplicity, add the full AI response to the first few steps
        answer = result.get('answer', '')
        for step in steps[:3]:  # Enhance first 3 steps
            step.ai_enhanced = True
            step.ai_enhancement = answer[:500]  # Truncate if needed
            step.save()
        
        return {
            'success': True,
            'roadmap_id': roadmap_id,
            'steps_enhanced': steps.count(),
            'tokens_used': result.get('tokens_used', 0)
        }
        
    except Roadmap.DoesNotExist:
        return {'error': f'Roadmap {roadmap_id} not found'}
    except Exception as e:
        return {'error': str(e), 'roadmap_id': roadmap_id}
