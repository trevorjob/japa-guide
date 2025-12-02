from django.contrib import admin
from .models import DocumentTemplate, GeneratedDocument


@admin.register(DocumentTemplate)
class DocumentTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'template_type', 'is_active']
    list_filter = ['template_type', 'is_active']
    search_fields = ['name', 'description']


@admin.register(GeneratedDocument)
class GeneratedDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'template', 'user', 'format', 'created_at']
    list_filter = ['format', 'created_at']
    search_fields = ['title', 'user__username']
    readonly_fields = ['created_at']