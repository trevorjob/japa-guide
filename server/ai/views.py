from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import AIChatRequestSerializer, AICompareRequestSerializer
from .services import ai_service


@api_view(['POST'])
@permission_classes([AllowAny])
def chat(request):
    """
    AI chat endpoint with personality support, RAG, and conversation context.
    """
    serializer = AIChatRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    data = serializer.validated_data
    user = request.user if request.user.is_authenticated else None
    session_id = '' if user else request.session.session_key
    
    result = ai_service.chat(
        message=data['message'],
        tone=data.get('tone', 'helpful'),
        context=data.get('context', {}),
        session_id=session_id,
        user=user,
        country_code=data.get('country_code'),
        use_rag=data.get('use_rag', True),
        conversation_history=data.get('conversation_history', [])
    )
    
    # Transform response to match frontend ChatResponse interface
    response_data = {
        'response': result.get('answer', 'Sorry, I encountered an error.'),
        'conversation_id': data.get('conversation_id', 1),
        'tone': data.get('tone', 'helpful'),
        'sources': result.get('sources', []),
        'countries_detected': result.get('countries_detected', []),
        'focused_country': result.get('focused_country'),
    }
    
    return Response(response_data)


@api_view(['POST'])
@permission_classes([AllowAny])
def compare_countries(request):
    """
    Compare two countries with AI using RAG.
    """
    serializer = AICompareRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    data = serializer.validated_data
    user = request.user if request.user.is_authenticated else None
    session_id = '' if user else request.session.session_key
    
    left_code = data['left']
    right_code = data['right']
    
    # Retrieve documents for both countries
    left_docs = ai_service.retrieve_documents(
        message="general overview work study immigration",
        country_code=left_code,
        max_docs=3
    )
    right_docs = ai_service.retrieve_documents(
        message="general overview work study immigration",
        country_code=right_code,
        max_docs=3
    )
    
    # Format document context
    left_context = "\n\n".join([
        f"**{d['title']}** ({d['source']})\n{d['content'][:2000]}" 
        for d in left_docs
    ]) if left_docs else "No detailed information available."
    
    right_context = "\n\n".join([
        f"**{d['title']}** ({d['source']})\n{d['content'][:2000]}" 
        for d in right_docs
    ]) if right_docs else "No detailed information available."
    
    # Build comparison context
    context = {
        'left_country': left_code,
        'right_country': right_code,
        'left_context': left_context,
        'right_context': right_context,
        'metrics': data.get('metrics', []),
        'user_profile': data.get('user_profile', {}),
        'tone': 'helpful'
    }
    
    template_text = """You are comparing {{left_country}} vs {{right_country}} for immigration purposes.

**Information about {{left_country}}:**
{{left_context}}

**Information about {{right_country}}:**
{{right_context}}

---

Based on the information above, compare these two countries focusing on: {{metrics|join(', ')}}.

Provide a balanced, structured comparison with:
1. Key pros and cons for each country
2. Which is better for different scenarios (career, family, cost, lifestyle)
3. A summary recommendation

Be specific and cite information from the documents when available."""
    
    result = ai_service.complete(
        template_text=template_text,
        context=context,
        session_id=session_id,
        user=user
    )
    
    # Add sources
    all_sources = [
        {'country': d['country_name'], 'title': d['title'], 'source': d['source']}
        for d in left_docs + right_docs
    ]
    result['sources'] = all_sources
    
    return Response(result)