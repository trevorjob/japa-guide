from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoadmapViewSet, generate_roadmap, calculate_cost

router = DefaultRouter()
router.register(r'', RoadmapViewSet, basename='roadmap')

urlpatterns = [
    path('generate/', generate_roadmap, name='generate-roadmap'),
    path('calc/estimate/', calculate_cost, name='calculate-cost'),
    path('', include(router.urls)),
]