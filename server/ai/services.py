"""
AI Service for OpenAI integration with personality system and caching.
"""
import hashlib
import json
import time
from decimal import Decimal
from jinja2 import Template
from django.conf import settings
from django.core.cache import cache
from openai import OpenAI  # DeepSeek uses OpenAI-compatible API
from .models import PromptTemplate, AIRequest
from .prompt_templates import get_system_prompt, SAFETY_RULES


# Personality definitions
PERSONALITY_INTROS = {
    'helpful': "Hi! I'm Japabot, your friendly migration guide.",
    'uncle_japa': "Ah ah! Uncle Japa here o! My guy/my sister, how far?",
    'bestie': "Heyyyy bestie! 💅 Your japa bestie is here to spill all the tea!",
    'strict_officer': "Good day. Immigration Officer speaking. Please pay attention.",
    'hype_man': "YOOOOO! LET'S GOOOO! 🔥🔥🔥 YOUR HYPE MAN IS HERE!",
    'therapist': "Hello, I'm here to support you through this journey. How are you feeling?"
}

TONE_INSTRUCTIONS = {
    'uncle_japa': "Use Nigerian pidgin phrases naturally. Be like an uncle who's been abroad and knows the struggles. Call them 'my guy' or 'my sister'. Use phrases like 'no be beans', 'e no easy', 'I go show you'. Be real and encouraging.",
    'bestie': "Use Gen-Z slang naturally: 'bestie', 'ngl', 'lowkey', 'iconic', 'slay'. Use emojis occasionally. Be excited and supportive. Keep it real but fun.",
    'hype_man': "USE CAPS FOR EMPHASIS! BE EXTREMELY ENTHUSIASTIC! HYPE THEM UP! USE FIRE EMOJIS! CELEBRATE EVERY STEP! MOTIVATION OVERLOAD!",
    'therapist': "Acknowledge their emotions. Use phrases like 'I hear you', 'It's normal to feel...', 'Let's take this one step at a time'. Be gentle and validating.",
    'helpful': "Be professional but warm. Provide clear explanations. Be encouraging and supportive.",
    'strict_officer': "Be formal and bureaucratic. Use official language. Be detail-oriented and procedural."
}


class AIService:
    """
    Service class for AI operations with caching and personality support.
    """
    
    def __init__(self):
        # DeepSeek uses OpenAI-compatible API
        self.client = OpenAI(
            api_key=settings.DEEPSEEK_API_KEY,
            base_url=settings.DEEPSEEK_BASE_URL
        ) if settings.DEEPSEEK_API_KEY else None
        self.model = settings.DEEPSEEK_MODEL
    
    def _render_prompt(self, template_text, context):
        """Render Jinja2 template with context."""
        template = Template(template_text)
        return template.render(**context)
    
    def _get_cache_key(self, prompt_text):
        """Generate cache key from prompt text."""
        prompt_hash = hashlib.md5(prompt_text.encode()).hexdigest()
        return f"ai:completion:{prompt_hash}"
    
    def _calculate_cost(self, tokens_used):
        """Calculate approximate cost based on tokens (DeepSeek pricing)."""
        # DeepSeek: ~$0.14 per 1M input tokens, ~$0.28 per 1M output tokens
        # Simplified: average ~$0.21 per 1M tokens (much cheaper than OpenAI!)
        return Decimal(tokens_used * 0.00000021)
    
    def complete(self, template_name=None, template_text=None, context=None, 
                 use_cache=True, session_id=None, user=None):
        """
        Generate AI completion with personality support.
        
        Args:
            template_name: Name of PromptTemplate to use
            template_text: Raw template text (if not using template_name)
            context: Dictionary of context variables
            use_cache: Whether to use cached responses
            session_id: Session ID for anonymous users
            user: User object for authenticated users
        
        Returns:
            dict with 'answer', 'tokens_used', 'cached', etc.
        """
        if not self.client:
            return {
                'error': 'DeepSeek API key not configured',
                'answer': 'AI service is currently unavailable.',
                'cached': False
            }
        
        context = context or {}
        
        # Get template if name provided
        prompt_template = None
        if template_name:
            try:
                prompt_template = PromptTemplate.objects.get(name=template_name, is_active=True)
                template_text = prompt_template.prompt_text
                temperature = prompt_template.temperature
                max_tokens = prompt_template.max_tokens
            except PromptTemplate.DoesNotExist:
                return {'error': f'Template {template_name} not found'}
        else:
            temperature = context.get('temperature', 0.7)
            max_tokens = context.get('max_tokens', 1000)
        
        # Add personality context
        tone = context.get('tone', 'helpful')
        context['personality_intro'] = PERSONALITY_INTROS.get(tone, PERSONALITY_INTROS['helpful'])
        context['tone_instructions'] = TONE_INSTRUCTIONS.get(tone, '')
        
        # Render prompt
        prompt_text = self._render_prompt(template_text, context)
        
        # Check cache
        cache_key = self._get_cache_key(prompt_text)
        if use_cache:
            cached_response = cache.get(cache_key)
            if cached_response:
                return {
                    **cached_response,
                    'cached': True
                }
        
        # Make API call
        start_time = time.time()
        try:
            # Build context-aware system prompt with safety rules
            system_prompt = get_system_prompt(
                context_type=context.get('context_type', 'base'),
                country_name=context.get('country_name', 'the destination country'),
                data_confidence=context.get('data_confidence', 'low')
            )
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt_text}
                ],
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            duration = time.time() - start_time
            answer = response.choices[0].message.content
            tokens_used = response.usage.total_tokens
            cost = self._calculate_cost(tokens_used)
            
            result = {
                'answer': answer,
                'tokens_used': tokens_used,
                'cost_usd': float(cost),
                'duration_seconds': duration,
                'cached': False
            }
            
            # Cache the response
            if use_cache:
                cache.set(cache_key, result, timeout=3600)  # 1 hour
            
            # Log the request
            AIRequest.objects.create(
                session_id=session_id or '',
                user=user,
                prompt_template=prompt_template,
                prompt_text=prompt_text,
                response_text=answer,
                model_used=self.model,
                tokens_used=tokens_used,
                cost_usd=cost,
                duration_seconds=duration,
                metadata=context
            )
            
            return result
            
        except Exception as e:
            return {
                'error': str(e),
                'answer': 'Sorry, I encountered an error processing your request.',
                'cached': False
            }
    
    def chat(self, message, tone='helpful', context=None, session_id=None, user=None):
        """
        Simple chat interface.
        """
        context = context or {}
        context['message'] = message
        context['tone'] = tone
        
        # Simple chat template
        template_text = """{{personality_intro}}

User asked: {{message}}

{{tone_instructions}}

Provide a helpful, conversational response:"""
        
        return self.complete(
            template_text=template_text,
            context=context,
            session_id=session_id,
            user=user
        )


# Singleton instance
ai_service = AIService()
