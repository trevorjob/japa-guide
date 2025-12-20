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
    import json
    import re
    
    try:
        roadmap = Roadmap.objects.select_related('country', 'visa_type').get(id=roadmap_id)
        steps = roadmap.steps.all().order_by('order')
        
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
                    'id': step.id,
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
Step {{step.order}} (ID: {{step.id}}): {{step.title}}
{{step.description}}
{% endfor %}

YOUR TASK (use {{tone}} personality):
Enhance these roadmap steps with:
1. Personalized advice
2. 2-3 practical tips
3. 2-3 common pitfalls

{{tone_instructions}}

CRITICAL INSTRUCTION:
You MUST respond with VALID JSON only.
The JSON must follow this structure:
{
    "enrichments": [
        {
            "step_id": <id_from_input>,
            "advice": "Personalized advice paragraph...",
            "tips": ["Tip 1", "Tip 2"],
            "pitfalls": ["Pitfall 1", "Pitfall 2"]
        }
    ]
}
Provide an enrichment for EVERY step listed above."""
        
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
        
        answer = result.get('answer', '')
        
        # Parse JSON from answer (handle potential markdown wrapping)
        try:
            # Strip markdown code blocks if present
            clean_answer = re.sub(r'```json\s*|\s*```', '', answer).strip()
            # Find the first { and last }
            start = clean_answer.find('{')
            end = clean_answer.rfind('}') + 1
            if start != -1 and end != -1:
                json_str = clean_answer[start:end]
                data = json.loads(json_str)
                enrichments = data.get('enrichments', [])
                
                # Apply enrichments to steps
                enrichment_map = {item['step_id']: item for item in enrichments if 'step_id' in item}
                
                updated_count = 0
                for step in steps:
                    if step.id in enrichment_map:
                        data = enrichment_map[step.id]
                        step.ai_enhanced = True
                        step.ai_enhancement = data.get('advice', '')
                        step.tips = data.get('tips', [])
                        step.pitfalls = data.get('pitfalls', [])
                        step.save()
                        updated_count += 1
                        
                return {
                    'success': True, 
                    'roadmap_id': roadmap_id, 
                    'steps_enhanced': updated_count,
                    'tokens_used': result.get('tokens_used', 0)
                }
            else:
                print(f"Failed to find JSON in AI response: {answer[:100]}...")
                return {'error': 'Invalid AI response format', 'roadmap_id': roadmap_id}
                
        except json.JSONDecodeError as e:
            print(f"JSON Parse Error: {e}. content: {answer[:100]}...")
            return {'error': 'Failed to parse AI response', 'roadmap_id': roadmap_id}
        
    except Roadmap.DoesNotExist:
        return {'error': f'Roadmap {roadmap_id} not found'}
    except Exception as e:
        print(f"Enrichment Error: {str(e)}")
        return {'error': str(e), 'roadmap_id': roadmap_id}
