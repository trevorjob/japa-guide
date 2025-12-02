from rest_framework import serializers
from .models import DocumentTemplate, GeneratedDocument


class DocumentTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentTemplate
        fields = ['id', 'name', 'template_type', 'description', 'example_fields', 'is_active']


class GeneratedDocumentSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)
    
    class Meta:
        model = GeneratedDocument
        fields = ['id', 'title', 'template', 'template_name', 'content', 'format', 
                  'cloudinary_url', 'metadata', 'created_at']
        read_only_fields = ['cloudinary_url']


class DocumentGenerateSerializer(serializers.Serializer):
    template_id = serializers.IntegerField(required=True)
    inputs = serializers.JSONField(required=True)
    format = serializers.ChoiceField(choices=['pdf', 'docx', 'txt'], default='pdf')