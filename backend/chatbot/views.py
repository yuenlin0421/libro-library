from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Conversation
from .serializers import (
    ConversationSerializer,
    ChatRequestSerializer,
    ChatResponseSerializer
)
from .services import get_chatbot_response


class ConversationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing conversation history
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        """Filter conversations by authenticated user"""
        queryset = Conversation.objects.filter(user=self.request.user)
        
        # Optional filter by book
        book_id = self.request.query_params.get('book_id')
        if book_id:
            queryset = queryset.filter(book_id=book_id)
        
        return queryset

    @action(detail=False, methods=['post'], url_path='chat')
    def chat(self, request):
        """
        Send a message to the chatbot and get a response
        """
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        message = serializer.validated_data['message']
        response_text, conversation = get_chatbot_response(
            user=request.user,
            message=message
        )
        
        response_serializer = ChatResponseSerializer({
            'response': response_text,
            'conversation_id': conversation.id
        })
        
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['delete'], url_path='clear-history')
    def clear_history(self, request):
        """Clear all conversation history for the user"""
        book_id = request.query_params.get('book_id')
        
        queryset = Conversation.objects.filter(user=request.user)
        if book_id:
            queryset = queryset.filter(book_id=book_id)
        
        count = queryset.count()
        queryset.delete()
        
        return Response(
            {'message': f'Deleted {count} conversation(s)'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Get conversation statistics"""
        total_conversations = Conversation.objects.filter(user=request.user).count()
        
        books_with_conversations = Conversation.objects.filter(
            user=request.user,
            book__isnull=False
        ).values('book').distinct().count()
        
        return Response({
            'total_conversations': total_conversations,
            'books_with_conversations': books_with_conversations
        })