"""
AI Service for OpenAI integration with RAG, personality system and caching.
"""
import hashlib
import json
import re
import time
from decimal import Decimal
from jinja2 import Template
from django.conf import settings
from django.core.cache import cache
from django.db.models import Q
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
    
    def _extract_countries_from_message(self, message: str) -> list:
        """
        Extract country names or codes from user message.
        Returns list of country codes.
        """
        from countries.models import Country
        
        message_lower = message.lower()
        found_countries = []
        
        # Check for explicit country codes (3-letter) - use word boundaries
        # Only match standalone codes, not codes within words
        code_pattern = r'\b([A-Z]{3})\b'
        codes = re.findall(code_pattern, message.upper())
        # Filter out common words that look like country codes
        excluded_codes = {'THE', 'AND', 'FOR', 'ARE', 'CAN', 'NOT', 'YOU', 'HAS', 'HIM', 'HER', 'ITS', 'OUR', 'WHO', 'ALL', 'ANY', 'GET', 'SET', 'USE', 'WAY', 'HOW', 'NOW', 'DAY', 'NEW', 'OLD', 'TRY', 'TWO', 'MAY', 'SAY', 'SEE', 'ASK', 'LET', 'PUT', 'END', 'TOO', 'OWN', 'RUN', 'OUT', 'OFF', 'GOT', 'DID', 'BIG', 'TOP', 'LOW', 'ADD', 'AGO', 'AIR'}
        for code in codes:
            if code not in excluded_codes and Country.objects.filter(code=code).exists():
                found_countries.append(code)
        
        # Check for country names using word boundaries
        countries = Country.objects.all()
        for country in countries:
            # Use word boundary to avoid matching "canada" in "canadian"
            pattern = r'\b' + re.escape(country.name.lower()) + r'\b'
            if re.search(pattern, message_lower):
                if country.code not in found_countries:
                    found_countries.append(country.code)
        
        # Common aliases with word boundary checks
        aliases = {
            r'\buk\b': 'GBR', 
            r'\bunited kingdom\b': 'GBR', 
            r'\bbritain\b': 'GBR', 
            r'\bengland\b': 'GBR',
            r'\busa\b': 'USA', 
            r'\bu\.s\.a?\b': 'USA',
            r'\bunited states\b': 'USA', 
            r'\bamerica\b': 'USA',
            r'\buae\b': 'ARE', 
            r'\bemirates\b': 'ARE', 
            r'\bdubai\b': 'ARE',
            r'\bnz\b': 'NZL', 
            r'\bnew zealand\b': 'NZL',
        }
        for pattern, code in aliases.items():
            if re.search(pattern, message_lower) and code not in found_countries:
                found_countries.append(code)
        
        return found_countries
    
    def _extract_doc_types_from_message(self, message: str) -> list:
        """
        Extract relevant document types from user message.
        """
        message_lower = message.lower()
        doc_types = []
        
        # Keywords to doc_type mapping - use word boundaries for precision
        keyword_map = {
            'overview': [r'\boverview\b', r'\babout\b', r'\bgeneral\b', r'\binfo\b', r'\binformation\b'],
            'work': [r'\bwork\b', r'\bjob\b', r'\bemployment\b', r'\bcareer\b', r'\bskilled\b', r'\bprofessional\b', r'\bh1b\b', r'\bblue card\b', r'\bworking\b'],
            'study': [r'\bstudy\b', r'\bstudent\b', r'\beducation\b', r'\buniversity\b', r'\bcollege\b', r'\bschool\b', r'\bdegree\b', r'\bstudying\b'],
            'family': [r'\bfamily\b', r'\bspouse\b', r'\bpartner\b', r'\bmarriage\b', r'\breunification\b', r'\bdependent\b'],
            'citizenship': [r'\bcitizen\b', r'\bcitizenship\b', r'\bnaturalization\b', r'\bpassport\b', r'\bpermanent resident\b', r'\b(?<!work )pr\b'],
            'visas': [r'\bvisa\b', r'\bvisas\b', r'\bpermit\b', r'\bentry\b'],
        }
        
        for doc_type, patterns in keyword_map.items():
            for pattern in patterns:
                if re.search(pattern, message_lower):
                    if doc_type not in doc_types:
                        doc_types.append(doc_type)
                    break
        
        # Default to overview if no specific type detected
        if not doc_types:
            doc_types = ['overview', 'work', 'study']
        
        return doc_types
    
    def retrieve_documents(self, message: str, country_code: str = None, max_docs: int = 5) -> list:
        """
        Retrieve relevant documents for RAG based on user message.
        
        Args:
            message: User's question/message
            country_code: Optional specific country code
            max_docs: Maximum documents to retrieve
            
        Returns:
            List of document dicts with content and metadata
        """
        from countries.models import CountryDocument
        
        # Extract countries and doc types from message
        country_codes = [country_code] if country_code else self._extract_countries_from_message(message)
        doc_types = self._extract_doc_types_from_message(message)
        
        # Build query - include all documents, prioritize reviewed ones
        query = Q()
        
        if country_codes:
            query &= Q(country__code__in=country_codes)
        
        if doc_types:
            query &= Q(doc_type__in=doc_types)
        
        # Retrieve documents - order by reviewed first, then by confidence
        documents = CountryDocument.objects.filter(query).select_related(
            'country', 'source'
        ).order_by('needs_review', '-data_confidence', '-updated_at')[:max_docs]
        
        # Format for context injection
        retrieved = []
        for doc in documents:
            retrieved.append({
                'country_code': doc.country.code,
                'country_name': doc.country.name,
                'doc_type': doc.doc_type,
                'title': doc.title,
                'content': doc.content[:3000],  # Limit content size
                'confidence': doc.data_confidence,
                'source': doc.source.name if doc.source else 'Unknown',
                'last_updated': doc.updated_at.isoformat() if doc.updated_at else None,
            })
        
        return retrieved
    
    def chat(self, message, tone='helpful', context=None, session_id=None, user=None, 
             country_code=None, use_rag=True, conversation_history=None):
        """
        Chat interface with RAG support and conversation context.
        
        Args:
            message: User's message
            tone: Personality tone
            context: Additional context
            session_id: Session ID for anonymous users
            user: User object
            country_code: Specific country to focus on
            use_rag: Whether to use RAG for context
            conversation_history: List of previous messages for context
        """
        context = context or {}
        context['message'] = message
        context['tone'] = tone
        conversation_history = conversation_history or []
        
        # Extract countries from conversation history to maintain context
        conversation_countries = set()
        if country_code:
            conversation_countries.add(country_code)
        
        # Look at recent conversation history to find discussed countries
        for msg in conversation_history[-6:]:  # Last 6 messages
            msg_content = msg.get('content', '')
            if msg_content:
                countries_in_msg = self._extract_countries_from_message(msg_content)
                conversation_countries.update(countries_in_msg)
        
        # Also check current message for countries
        current_msg_countries = self._extract_countries_from_message(message)
        conversation_countries.update(current_msg_countries)
        
        # Build conversation context summary
        conversation_context = ""
        if conversation_history:
            # Get last few exchanges to build context
            recent_msgs = conversation_history[-4:]  # Last 4 messages
            conv_parts = []
            for msg in recent_msgs:
                role = msg.get('role', 'user')
                content = msg.get('content', '')[:500]  # Limit each message
                if content:
                    conv_parts.append(f"{role.title()}: {content}")
            if conv_parts:
                conversation_context = "\n".join(conv_parts)
        
        # Determine which country to focus on for RAG
        # Priority: explicit country_code > countries in current message > countries from history
        rag_country = None
        if country_code:
            rag_country = country_code
        elif current_msg_countries:
            rag_country = current_msg_countries[0]  # Use first mentioned
        elif conversation_countries:
            rag_country = list(conversation_countries)[0]  # Use from history
        
        # Retrieve relevant documents for RAG
        retrieved_docs = []
        if use_rag:
            retrieved_docs = self.retrieve_documents(
                message=message,
                country_code=rag_country,
                max_docs=5
            )
        
        # Build context from retrieved documents
        if retrieved_docs:
            doc_context = "\n\n---\n\n".join([
                f"**{doc['country_name']} - {doc['title']}** (Source: {doc['source']}, Confidence: {doc['confidence']})\n\n{doc['content']}"
                for doc in retrieved_docs
            ])
            context['retrieved_documents'] = doc_context
            context['has_context'] = True
            context['sources_used'] = [
                {'country': d['country_name'], 'title': d['title'], 'source': d['source']}
                for d in retrieved_docs
            ]
        else:
            context['retrieved_documents'] = ''
            context['has_context'] = False
            context['sources_used'] = []
        
        # Add conversation context
        context['conversation_context'] = conversation_context
        context['has_conversation_context'] = bool(conversation_context)
        context['focused_country'] = rag_country
        
        # RAG-enhanced chat template with conversation context
        template_text = """{{personality_intro}}

{% if has_conversation_context %}
Previous conversation context:
{{conversation_context}}

---
{% endif %}

{% if focused_country %}
The user is asking about: {{focused_country}}
{% endif %}

{% if has_context %}
I have access to the following official immigration information to help answer your question:

{{retrieved_documents}}

---
{% endif %}

User's current question: {{message}}

{{tone_instructions}}

{% if has_context %}
Based on the official information above and our conversation, provide a helpful response. Be specific and focus on the country we've been discussing ({{focused_country}}). If the documents don't fully answer the question, acknowledge what's known and what requires further research.
{% else %}
Provide general guidance, but remind the user that for specific country information, they should specify which country they're interested in. Be helpful but acknowledge uncertainty without specific data.
{% endif %}

Response:"""
        
        result = self.complete(
            template_text=template_text,
            context=context,
            session_id=session_id,
            user=user
        )
        
        # Add sources and context to result
        result['sources'] = context.get('sources_used', [])
        result['countries_detected'] = list(conversation_countries) if conversation_countries else current_msg_countries
        result['focused_country'] = rag_country
        
        return result


# Singleton instance
ai_service = AIService()
