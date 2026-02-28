from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    books_read_this_year = serializers.IntegerField(read_only=True)
    goal_progress = serializers.FloatField(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['annual_goal', 'books_read_this_year', 'goal_progress', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data"""
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id']