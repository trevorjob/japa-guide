from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from .models import Story
from .serializers import StoryListSerializer, StoryDetailSerializer, StoryCreateSerializer


class StoryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Story.objects.filter(approved=True)
        
        # Filters
        country = self.request.query_params.get('country')
        featured = self.request.query_params.get('featured')
        tag = self.request.query_params.get('tag')
        
        if country:
            queryset = queryset.filter(country__code=country)
        if featured:
            queryset = queryset.filter(featured=True)
        if tag:
            queryset = queryset.filter(tags__contains=[tag])
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StoryCreateSerializer
        elif self.action == 'retrieve':
            return StoryDetailSerializer
        return StoryListSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        story = self.get_object()
        story.likes_count += 1
        story.save(update_fields=['likes_count'])
        return Response({'likes_count': story.likes_count})