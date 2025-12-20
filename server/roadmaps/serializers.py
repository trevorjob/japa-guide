from rest_framework import serializers
from .models import Roadmap, RoadmapStep, RoadmapStepStatus


class RoadmapStepStatusSerializer(serializers.ModelSerializer):
    """Serializer for step status."""
    is_complete = serializers.BooleanField(source='completed')
    is_blocked = serializers.BooleanField(source='blocked')
    block_reason = serializers.CharField(source='blocker_reason', allow_blank=True)
    
    class Meta:
        model = RoadmapStepStatus
        fields = ['is_complete', 'completed_at', 'notes', 'is_blocked', 'block_reason']


class RoadmapStepSerializer(serializers.ModelSerializer):
    """Serializer for roadmap steps."""
    status = RoadmapStepStatusSerializer(required=False, allow_null=True)
    estimated_time = serializers.SerializerMethodField()
    estimated_cost = serializers.DecimalField(source='estimated_cost_usd', max_digits=10, decimal_places=2, allow_null=True)
    ai_advice = serializers.CharField(source='ai_enhancement', allow_blank=True, allow_null=True)
    documents_needed = serializers.JSONField(default=list)
    
    class Meta:
        model = RoadmapStep
        fields = [
            'id', 'order', 'title', 'description', 'estimated_time',
            'estimated_cost', 'tips', 'pitfalls', 'ai_enhanced',
            'ai_advice', 'documents_needed', 'status'
        ]
    
    def get_estimated_time(self, obj):
        """Convert estimated_time_days to readable string."""
        if not obj.estimated_time_days:
            return None
        
        days = obj.estimated_time_days
        if days < 7:
            return f"{days} day{'s' if days != 1 else ''}"
        elif days < 30:
            weeks = days // 7
            return f"{weeks} week{'s' if weeks != 1 else ''}"
        else:
            months = days // 30
            return f"{months} month{'s' if months != 1 else ''}"


class RoadmapListSerializer(serializers.ModelSerializer):
    """Serializer for roadmap list."""
    country_name = serializers.CharField(source='country.name', read_only=True)
    country_code = serializers.CharField(source='country.code', read_only=True)
    visa_type_name = serializers.CharField(source='visa_type.name', read_only=True, allow_null=True)
    steps_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Roadmap
        fields = [
            'id', 'title', 'country_name', 'country_code', 'visa_type_name',
            'goal', 'ai_tone', 'status', 'is_anonymous', 'steps_count', 'created_at'
        ]
    
    def get_steps_count(self, obj):
        return obj.steps.count()


class RoadmapDetailSerializer(serializers.ModelSerializer):
    """Serializer for roadmap detail with all steps."""
    steps = RoadmapStepSerializer(many=True, read_only=True)
    country_name = serializers.CharField(source='country.name', read_only=True)
    country_code = serializers.CharField(source='country.code', read_only=True)
    ai_personality = serializers.CharField(source='ai_tone', read_only=True)
    
    class Meta:
        model = Roadmap
        fields = [
            'id', 'title', 'country', 'country_name', 'country_code',
            'visa_type', 'goal', 'profile_snapshot', 'ai_tone', 'ai_personality', 'status',
            'is_anonymous', 'steps', 'created_at', 'updated_at'
        ]


class RoadmapGenerateSerializer(serializers.Serializer):
    """Serializer for roadmap generation request."""
    country = serializers.CharField(required=True, help_text="Country code")
    goal = serializers.ChoiceField(
        choices=['study', 'work', 'business', 'family', 'other'],
        required=True
    )
    visa_type_id = serializers.IntegerField(required=False, allow_null=True)
    ai_tone = serializers.ChoiceField(
        choices=['helpful', 'uncle_japa', 'bestie', 'strict_officer', 'hype_man', 'therapist'],
        default='helpful'
    )
    profile = serializers.JSONField(required=False, default=dict)