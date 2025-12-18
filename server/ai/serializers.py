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
        default='uncle_japa'
    )
    context = serializers.JSONField(required=False, default=dict)
    country_code = serializers.CharField(required=False, allow_null=True, help_text="Specific country code to focus on")
    use_rag = serializers.BooleanField(required=False, default=True, help_text="Whether to use RAG for context")
    conversation_history = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list,
        help_text="Previous messages in the conversation for context"
    )
    conversation_id = serializers.IntegerField(required=False, allow_null=True)


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