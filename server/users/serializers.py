from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    class Meta:
        model = UserProfile
        fields = [
            'education_level', 'field_of_study', 'years_experience',
            'current_job_title', 'budget_usd', 'monthly_savings_usd',
            'target_move_date', 'skills', 'languages', 'has_dependents',
            'num_dependents', 'preferred_climate'
        ]


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data."""
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'full_name', 'bio',
            'country_of_origin', 'current_country', 'avatar',
            'plan_type', 'ai_credits_remaining', 'profile', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'plan_type', 'ai_credits_remaining']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'full_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user


class ClaimSessionSerializer(serializers.Serializer):
    """Serializer for claiming anonymous session data."""
    session_key = serializers.CharField(required=True)