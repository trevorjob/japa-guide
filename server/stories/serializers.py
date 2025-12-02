from rest_framework import serializers
from .models import Story


class StoryListSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)
    country_code = serializers.CharField(source='country.code', read_only=True)
    
    class Meta:
        model = Story
        fields = [
            'id', 'title', 'slug', 'excerpt', 'author_name',
            'country_name', 'country_code', 'cover_image', 'tags',
            'views_count', 'likes_count', 'featured', 'published_at'
        ]


class StoryDetailSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)
    
    class Meta:
        model = Story
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'author_name',
            'country', 'country_name', 'cover_image', 'tags',
            'views_count', 'likes_count', 'featured', 'created_at', 'published_at'
        ]


class StoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Story
        fields = ['title', 'content', 'country', 'author_name', 'tags', 'cover_image']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)