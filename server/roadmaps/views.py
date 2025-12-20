from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from countries.models import Country
from visas.models import VisaType
from .models import Roadmap, RoadmapStep, RoadmapStepStatus
from .serializers import (
    RoadmapListSerializer, RoadmapDetailSerializer,
    RoadmapGenerateSerializer
)
from .tasks import enrich_roadmap_with_ai
from core.utils import calculate_migration_costs


class RoadmapViewSet(viewsets.ModelViewSet):
    """
    ViewSet for roadmaps - works for anonymous and authenticated users.
    """
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RoadmapDetailSerializer
        return RoadmapListSerializer
    
    def get_queryset(self):
        """Get roadmaps for current user or session."""
        if self.request.user.is_authenticated:
            return Roadmap.objects.filter(user=self.request.user).prefetch_related('steps')
        else:
            session_key = self.request.session.session_key
            if not session_key:
                return Roadmap.objects.none()
            return Roadmap.objects.filter(session_id=session_key).prefetch_related('steps')
    
    @action(detail=True, methods=['post'])
    def complete_step(self, request, pk=None):
        """Mark a roadmap step as completed."""
        roadmap = self.get_object()
        step_id = request.data.get('step_id')
        
        step = get_object_or_404(RoadmapStep, id=step_id, roadmap=roadmap)
        status_obj, created = RoadmapStepStatus.objects.get_or_create(step=step)
        status_obj.completed = True  # Model field name remains 'completed'
        status_obj.notes = request.data.get('notes', '')
        status_obj.save()
        
        return Response({'success': True, 'step_id': step_id})
    
    @action(detail=True, methods=['post'])
    def block_step(self, request, pk=None):
        """Mark a roadmap step as blocked."""
        roadmap = self.get_object()
        step_id = request.data.get('step_id')
        
        step = get_object_or_404(RoadmapStep, id=step_id, roadmap=roadmap)
        status_obj, created = RoadmapStepStatus.objects.get_or_create(step=step)
        status_obj.blocked = True  # Model field name remains 'blocked'
        status_obj.blocker_reason = request.data.get('blocker_reason', '')  # Model field name
        status_obj.save()
        
        return Response({'success': True, 'step_id': step_id})


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_roadmap(request):
    """
    Generate a migration roadmap (deterministic + async AI enrichment).
    """
    serializer = RoadmapGenerateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    data = serializer.validated_data
    country = get_object_or_404(Country, code=data['country'])
    visa_type = VisaType.objects.filter(id=data.get('visa_type_id')).first() if data.get('visa_type_id') else None
    
    user = request.user if request.user.is_authenticated else None
    session_id = '' if user else (request.session.session_key or '')
    if not session_id and not user:
        request.session.create()
        session_id = request.session.session_key
    
    roadmap = Roadmap.objects.create(
        session_id=session_id, user=user, is_anonymous=(user is None),
        title=f"Migration to {country.name} for {data['goal']}",
        country=country, visa_type=visa_type, goal=data['goal'],
        profile_snapshot=data.get('profile', {}), ai_tone=data.get('ai_tone', 'helpful')
    )
    
    # Create steps (generic or from visa_type)
    if visa_type:
        for vs in visa_type.steps.all():
            RoadmapStep.objects.create(
                roadmap=roadmap, order=vs.order, title=vs.title,
                description=vs.description, estimated_time_days=vs.estimated_time_days,
                estimated_cost_usd=vs.estimated_cost_usd, tips=vs.tips, pitfalls=vs.common_pitfalls
            )
    else:
        for i, s in enumerate([{'title': 'Research', 'desc': 'Plan your move'}, 
                                 {'title': 'Documents', 'desc': 'Gather paperwork'},
                                 {'title': 'Application', 'desc': 'Submit forms'}], 1):
            RoadmapStep.objects.create(roadmap=roadmap, order=i, title=s['title'], description=s['desc'])
    
    # Enrich roadmap with AI synchronously (can be changed back to .delay() for async)
    try:
        enrich_roadmap_with_ai(roadmap.id)
    except Exception as e:
        # Log error but still return roadmap
        print(f"AI enrichment failed for roadmap {roadmap.id}: {str(e)}")
    
    # Refresh roadmap to get AI-enriched data
    roadmap.refresh_from_db()
    return Response(RoadmapDetailSerializer(roadmap).data, status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_cost(request):
    """Cost calculator."""
    country = get_object_or_404(Country, code=request.data.get('country'))
    result = calculate_migration_costs(
        country, request.data.get('city', ''), request.data.get('visa_type', ''),
        request.data.get('duration_months', 12), request.data.get('inputs', {}),
        request.data.get('num_dependents', 0)
    )
    return Response(result)