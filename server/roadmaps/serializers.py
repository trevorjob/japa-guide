from rest_framework import serializers
from .models import Roadmap, RoadmapStep, RoadmapStepStatus


class RoadmapStepStatusSerializer(serializers.ModelSerializer):
    """Serializer for step status."""
    class Meta:
        model = RoadmapStepStatus
        fields = ['completed', 'completed_at', 'notes', 'blocked', 'blocker_reason']


class RoadmapStepSerializer(serializers.ModelSerializer):
    """Serializer for roadmap steps."""
    status = RoadmapStepStatusSerializer(required=False, allow_null=True)
    
    class Meta:
        model = RoadmapStep
        fields = [
            'id', 'order', 'title', 'description', 'estimated_time_days',
            'estimated_cost_usd', 'tips', 'pitfalls', 'ai_enhanced',
            'ai_enhancement', 'status'
        ]


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
    
    class Meta:
        model = Roadmap
        fields = [
            'id', 'title', 'country', 'country_name', 'country_code',
            'visa_type', 'goal', 'profile_snapshot', 'ai_tone', 'status',
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