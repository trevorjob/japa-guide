from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentTemplateViewSet, GeneratedDocumentViewSet, generate_document

router = DefaultRouter()
router.register(r'templates', DocumentTemplateViewSet, basename='document-template')
router.register(r'', GeneratedDocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
    path('generate/', generate_document, name='generate-document'),
]