from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import AIChatRequestSerializer, AICompareRequestSerializer
from .services import ai_service


@api_view(['POST'])
@permission_classes([AllowAny])
def chat(request):
    """
    AI chat endpoint with personality support.
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
        user=user
    )
    
    # Transform response to match frontend ChatResponse interface
    response_data = {
        'response': result.get('answer', 'Sorry, I encountered an error.'),
        'conversation_id': data.get('conversation_id', 1),
        'tone': data.get('tone', 'helpful')
    }
    
    return Response(response_data)


@api_view(['POST'])
@permission_classes([AllowAny])
def compare_countries(request):
    """
    Compare two countries with AI.
    """
    serializer = AICompareRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    data = serializer.validated_data
    user = request.user if request.user.is_authenticated else None
    session_id = '' if user else request.session.session_key
    
    # Build comparison context
    context = {
        'left_country': data['left'],
        'right_country': data['right'],
        'metrics': data.get('metrics', []),
        'user_profile': data.get('user_profile', {}),
        'tone': 'helpful'
    }
    
    template_text = """Compare {{left_country}} vs {{right_country}} for migration based on: {{metrics|join(', ')}}.
    
Provide a structured comparison with pros/cons for each."""
    
    result = ai_service.complete(
        template_text=template_text,
        context=context,
        session_id=session_id,
        user=user
    )
    
    return Response(result)