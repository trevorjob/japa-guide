from django.urls import path
from .views import chat, compare_countries

urlpatterns = [
    path('chat/', chat, name='ai-chat'),
    path('compare/', compare_countries, name='ai-compare'),
]