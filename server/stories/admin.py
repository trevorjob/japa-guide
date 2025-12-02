from django.contrib import admin
from .models import Story


@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'author_name', 'country', 'approved', 'featured', 'views_count', 'created_at']
    list_filter = ['approved', 'featured', 'country', 'created_at']
    search_fields = ['title', 'author_name', 'content']
    prepopulated_fields = {'slug': ('title',)}
    actions = ['approve_stories', 'feature_stories']
    
    def approve_stories(self, request, queryset):
        queryset.update(approved=True)
    approve_stories.short_description = "Approve selected stories"
    
    def feature_stories(self, request, queryset):
        queryset.update(featured=True)
    feature_stories.short_description = "Feature selected stories"