from django.contrib import admin
from .models import Roadmap, RoadmapStep, RoadmapStepStatus


class RoadmapStepInline(admin.TabularInline):
    model = RoadmapStep
    extra = 0
    fields = ['order', 'title', 'estimated_time_days', 'estimated_cost_usd', 'ai_enhanced']


@admin.register(Roadmap)
class RoadmapAdmin(admin.ModelAdmin):
    list_display = ['title', 'country', 'user', 'is_anonymous', 'status', 'created_at']
    list_filter = ['status', 'is_anonymous', 'country']
    search_fields = ['title', 'user__username']
    inlines = [RoadmapStepInline]


@admin.register(RoadmapStep)
class RoadmapStepAdmin(admin.ModelAdmin):
    list_display = ['roadmap', 'order', 'title', 'ai_enhanced']
    list_filter = ['ai_enhanced']