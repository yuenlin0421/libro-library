from rest_framework import serializers
from .models import Book


class BookSerializer(serializers.ModelSerializer):
    """Serializer for Book model"""
    
    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'isbn', 'pdf', 'image_url',
            'progress_percentage', 'personal_notes', 'is_favorite',
            'ocr_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'ocr_status', 'created_at', 'updated_at']

    def validate_progress_percentage(self, value):
        """Validate progress percentage is between 0 and 100"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("Progress percentage must be between 0 and 100")
        return value


class BookCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating books"""
    
    class Meta:
        model = Book
        fields = ['title', 'author', 'isbn', 'pdf', 'image_url']

    def create(self, validated_data):
        # Set user from request context
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class BookUpdateSerializer(serializers.ModelSerializer):
    """Serializer for partial book updates"""
    
    class Meta:
        model = Book
        fields = [
            'title', 'author', 'isbn', 'image_url',
            'progress_percentage', 'personal_notes', 'is_favorite'
        ]
        extra_kwargs = {
            'title': {'required': False},
            'author': {'required': False},
        }

    def validate_progress_percentage(self, value):
        """Validate progress percentage is between 0 and 100"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("Progress percentage must be between 0 and 100")
        return value


class BookListSerializer(serializers.ModelSerializer):
    """Minimal serializer for book lists"""
    
    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'image_url', 
            'progress_percentage', 'is_favorite', 'updated_at', 'personal_notes'
        ]