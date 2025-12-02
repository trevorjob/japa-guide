from django.contrib import admin
from .models import PromptTemplate, AIRequest


@admin.register(PromptTemplate)
class PromptTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'mode', 'tone', 'is_active']
    list_filter = ['mode', 'tone', 'is_active']
    search_fields = ['name', 'description']


@admin.register(AIRequest)
class AIRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'session_id', 'model_used', 'tokens_used', 'created_at']
    list_filter = ['model_used', 'created_at']
    search_fields = ['user__username', 'session_id']
    readonly_fields = ['user', 'session_id', 'prompt_text', 'response_text', 'created_at']