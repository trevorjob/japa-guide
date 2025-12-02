from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from jinja2 import Template
from .models import DocumentTemplate, GeneratedDocument
from .serializers import (
    DocumentTemplateSerializer, GeneratedDocumentSerializer,
    DocumentGenerateSerializer
)


class DocumentTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DocumentTemplate.objects.filter(is_active=True)
    serializer_class = DocumentTemplateSerializer
    permission_classes = [AllowAny]


class GeneratedDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = GeneratedDocumentSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return GeneratedDocument.objects.filter(user=self.request.user)
        else:
            session_key = self.request.session.session_key
            if not session_key:
                return GeneratedDocument.objects.none()
            return GeneratedDocument.objects.filter(session_id=session_key)


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_document(request):
    """Generate document from template."""
    serializer = DocumentGenerateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    data = serializer.validated_data
    template = get_object_or_404(DocumentTemplate, id=data['template_id'], is_active=True)
    
    # Render template with user inputs
    jinja_template = Template(template.content_template)
    rendered_content = jinja_template.render(**data['inputs'])
    
    # Determine user or session
    user = request.user if request.user.is_authenticated else None
    session_id = '' if user else (request.session.session_key or '')
    if not session_id and not user:
        request.session.create()
        session_id = request.session.session_key
    
    # Create document
    document = GeneratedDocument.objects.create(
        session_id=session_id,
        user=user,
        template=template,
        title=data['inputs'].get('title', template.name),
        content=rendered_content,
        format=data.get('format', 'pdf'),
        metadata=data['inputs']
    )
    
    # TODO: Queue Celery task for PDF/DOCX generation and Cloudinary upload
    # For now, just return the text content
    
    return Response(GeneratedDocumentSerializer(document).data, status=201)