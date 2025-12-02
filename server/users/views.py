from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import (
    UserSerializer, UserRegistrationSerializer, 
    ClaimSessionSerializer
)
from core.utils import claim_session_data


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_me(self, request):
        """Update current user profile."""
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user (optional - anonymous usage allowed).
    """
    serializer = UserRegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_session(request):
    """
    Claim anonymous session data and migrate to user account.
    """
    serializer = ClaimSessionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    session_key = serializer.validated_data['session_key']
    result = claim_session_data(request.user, session_key)
    
    return Response({
        'success': True,
        **result
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def session_status(request):
    """
    Check session status and expiry for anonymous users.
    """
    if request.user.is_authenticated:
        return Response({
            'authenticated': True,
            'user_id': request.user.id,
            'username': request.user.username
        })
    
    session_key = request.session.session_key
    if not session_key:
        request.session.create()
        session_key = request.session.session_key
    
    return Response({
        'authenticated': False,
        'session_key': session_key,
        'expires_in_days': 30
    })