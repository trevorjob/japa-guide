from rest_framework import serializers
from .models import PromptTemplate, AIRequest


class PromptTemplateSerializer(serializers.ModelSerializer):
    """Serializer for prompt templates."""
    class Meta:
        model = PromptTemplate
        fields = [
            'id', 'name', 'description', 'mode', 'tone',
            'temperature', 'max_tokens', 'is_active'
        ]


class AIChatRequestSerializer(serializers.Serializer):
    """Serializer for AI chat requests."""
    message = serializers.CharField(required=True)
    tone = serializers.ChoiceField(
        choices=['helpful', 'uncle_japa', 'bestie', 'strict_officer', 'hype_man', 'therapist'],
        default='helpful'
    )
    context = serializers.JSONField(required=False, default=dict)


class AICompareRequestSerializer(serializers.Serializer):
    """Serializer for country comparison requests."""
    left = serializers.CharField(required=True, help_text="Country code")
    right = serializers.CharField(required=True, help_text="Country code")
    metrics = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=['cost', 'pr_time', 'job_market', 'quality_of_life']
    )
    user_profile = serializers.JSONField(required=False, default=dict)