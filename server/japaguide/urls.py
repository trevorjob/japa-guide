"""
URL configuration for japaguide project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('users.urls')),
    path('api/v1/countries/', include('countries.urls')),
    path('api/v1/visas/', include('visas.urls')),
    path('api/v1/roadmaps/', include('roadmaps.urls')),
    path('api/v1/ai/', include('ai.urls')),
    # Phase 2 endpoints
    path('api/v1/docs/', include('docs.urls')),
    path('api/v1/maps/', include('maps.urls')),
    path('api/v1/stories/', include('stories.urls')),
]
