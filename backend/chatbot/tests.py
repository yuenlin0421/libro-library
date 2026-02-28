import pytest
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from chatbot.models import Conversation
from library.models import Book
from unittest.mock import patch, MagicMock, Mock


@pytest.fixture
def sample_conversation(user):
    """Create a sample conversation"""
    return Conversation.objects.create(
        user=user,
        user_message="What is this book about?",
        bot_response="This is a test response."
    )


@pytest.fixture
def sample_book_for_chat(user):
    """Create a sample book for chat testing"""
    pdf_file = SimpleUploadedFile("chat_test.pdf", b"content", content_type="application/pdf")
    return Book.objects.create(
        user=user,
        title="Chat Test Book",
        author="Chat Author",
        pdf=pdf_file,
        ocr_status='completed'
    )


@pytest.mark.django_db
class TestConversationModel:
    """Test Conversation model"""

    def test_conversation_creation(self, sample_conversation):
        """Test conversation creation"""
        assert sample_conversation.user_message == "What is this book about?"
        assert sample_conversation.bot_response == "This is a test response."

    def test_conversation_str(self, sample_conversation):
        """Test conversation string representation"""
        expected = f"Conversation {sample_conversation.id} - {sample_conversation.user.username}"
        assert str(sample_conversation) == expected

    def test_conversation_without_book(self, user):
        """Test conversation without associated book"""
        conv = Conversation.objects.create(
            user=user,
            user_message="General question",
            bot_response="General answer"
        )
        assert conv.book is None


@pytest.mark.django_db
class TestConversationViewSet:
    """Test Conversation ViewSet"""

    def test_list_conversations_unauthenticated(self, api_client):
        """Test listing conversations without authentication"""
        url = reverse('chatbot:conversation-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_conversations(self, authenticated_client, sample_conversation):
        """Test listing conversations"""
        url = reverse('chatbot:conversation-list')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_list_conversations_filters_by_user(self, authenticated_client, sample_conversation, user2):
        """Test conversations are filtered by user"""
        # Create conversation for different user
        Conversation.objects.create(
            user=user2,
            user_message="User2 message",
            bot_response="User2 response"
        )
        
        url = reverse('chatbot:conversation-list')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_filter_conversations_by_book(self, authenticated_client, user, sample_book_for_chat):
        """Test filtering conversations by book"""
        # Create conversations
        Conversation.objects.create(
            user=user,
            book=sample_book_for_chat,
            user_message="Question about book",
            bot_response="Answer about book"
        )
        Conversation.objects.create(
            user=user,
            user_message="General question",
            bot_response="General answer"
        )
        
        url = reverse('chatbot:conversation-list')
        response = authenticated_client.get(url, {'book_id': sample_book_for_chat.id})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    @patch('chatbot.views.get_chatbot_response')
    def test_chat_endpoint(self, mock_get_response, authenticated_client):
        """Test chat endpoint"""
        mock_conversation = MagicMock()
        mock_conversation.id = 1
        mock_get_response.return_value = ("Test response", mock_conversation)
        
        url = reverse('chatbot:conversation-chat')
        data = {'message': 'Hello, chatbot!'}
        
        response = authenticated_client.post(url, data)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'response' in response.data
        assert 'conversation_id' in response.data
        mock_get_response.assert_called_once()

    def test_chat_empty_message(self, authenticated_client):
        """Test chat with empty message"""
        url = reverse('chatbot:conversation-chat')
        data = {'message': '   '}
        
        response = authenticated_client.post(url, data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_chat_requires_authentication(self, api_client):
        """Test chat requires authentication"""
        url = reverse('chatbot:conversation-chat')
        data = {'message': 'Hello'}
        
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_clear_history(self, authenticated_client, sample_conversation):
        """Test clearing conversation history"""
        url = reverse('chatbot:conversation-clear-history')
        response = authenticated_client.delete(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert not Conversation.objects.filter(user=sample_conversation.user).exists()

    def test_clear_history_by_book(self, authenticated_client, user, sample_book_for_chat):
        """Test clearing conversation history for specific book"""
        # Create conversations
        Conversation.objects.create(
            user=user,
            book=sample_book_for_chat,
            user_message="Book question",
            bot_response="Book answer"
        )
        general_conv = Conversation.objects.create(
            user=user,
            user_message="General question",
            bot_response="General answer"
        )
        
        url = reverse('chatbot:conversation-clear-history')
        # Use query params in GET request, not DELETE body
        response = authenticated_client.delete(f'{url}?book_id={sample_book_for_chat.id}')
        
        assert response.status_code == status.HTTP_200_OK
        # General conversation should still exist (no book_id)
        assert Conversation.objects.filter(id=general_conv.id).exists()
        # Book-specific conversation should be deleted
        assert not Conversation.objects.filter(book=sample_book_for_chat).exists()

    def test_conversation_stats(self, authenticated_client, user, sample_conversation, sample_book_for_chat):
        """Test conversation statistics endpoint"""
        # Create book-specific conversation
        Conversation.objects.create(
            user=user,
            book=sample_book_for_chat,
            user_message="Book question",
            bot_response="Book answer"
        )
        
        url = reverse('chatbot:conversation-stats')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['total_conversations'] == 2
        assert response.data['books_with_conversations'] == 1


@pytest.mark.django_db
class TestChatbotServices:
    """Test chatbot service functions"""

    @patch('chatbot.services.BookChatbot')
    def test_get_chatbot_response(self, mock_chatbot_class, user):
        """Test get_chatbot_response function"""
        from chatbot.services import get_chatbot_response
        
        # Setup mock
        mock_chatbot = Mock()
        # mock_chatbot.get_response.return_value = "Mocked response"
        mock_chatbot.get_response.return_value = ("Mocked response", None)
        mock_chatbot_class.return_value = mock_chatbot
        
        # Call function
        response, conversation = get_chatbot_response(user, "Test message")
        
        # Verify
        assert response == "Mocked response"
        assert conversation.user == user
        assert conversation.user_message == "Test message"
        assert conversation.bot_response == "Mocked response"
        assert conversation.book is None

    def test_conversation_created_in_database(self, user):
        """Test that conversation is saved to database"""
        from chatbot.services import get_chatbot_response
        
        with patch('chatbot.services.BookChatbot') as mock_chatbot_class:
            mock_chatbot = Mock()
            # 🔥 修正點：回傳 Tuple (字串, None)
            # mock_chatbot.get_response.return_value = "Test response"
            mock_chatbot.get_response.return_value = ("Test response", None)
            mock_chatbot_class.return_value = mock_chatbot
            
            initial_count = Conversation.objects.count()
            response, conversation = get_chatbot_response(user, "Question")
            
            assert Conversation.objects.count() == initial_count + 1
            assert Conversation.objects.filter(user=user).exists()


@pytest.mark.django_db
class TestChatRequestValidation:
    """Test chat request validation"""

    def test_missing_message(self, authenticated_client):
        """Test chat request without message"""
        url = reverse('chatbot:conversation-chat')
        response = authenticated_client.post(url, {})
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'message' in response.data

    def test_whitespace_only_message(self, authenticated_client):
        """Test chat request with whitespace only message"""
        url = reverse('chatbot:conversation-chat')
        response = authenticated_client.post(url, {'message': '   '})
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @patch('chatbot.views.get_chatbot_response')
    def test_valid_message(self, mock_response, authenticated_client):
        """Test chat request with valid message"""
        mock_conversation = Mock()
        mock_conversation.id = 1
        mock_response.return_value = ("Valid response", mock_conversation)
        
        url = reverse('chatbot:conversation-chat')
        response = authenticated_client.post(url, {'message': 'Valid message'})
        
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestConversationOrdering:
    """Test conversation ordering"""

    def test_conversations_ordered_by_created_at(self, authenticated_client, user):
        """Test conversations are ordered by creation time (newest first)"""
        # Create multiple conversations
        for i in range(3):
            Conversation.objects.create(
                user=user,
                user_message=f"Message {i}",
                bot_response=f"Response {i}"
            )
        
        url = reverse('chatbot:conversation-list')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        results = response.data['results']
        
        # Should be ordered newest first
        assert results[0]['user_message'] == 'Message 2'
        assert results[1]['user_message'] == 'Message 1'
        assert results[2]['user_message'] == 'Message 0'


@pytest.mark.django_db
class TestChatResponseCleaning:
    """Test response cleaning functionality"""

    def test_clean_response_removes_noise(self):
        """Test _clean_response removes common noise patterns"""
        from chatbot.services import BookChatbot
        
        # Test removing "Sure, I'd be happy to help!"
        dirty = "Sure, I'd be happy to help! Here is the answer."
        clean = BookChatbot._clean_response(dirty)
        assert "Sure, I'd be happy to help!" not in clean
        
        # Test removing multiple newlines
        dirty = "Line 1\n\n\n\nLine 2"
        clean = BookChatbot._clean_response(dirty)
        assert "\n\n\n\n" not in clean
        
        # Test removing leading numbers
        dirty = "\n\n1 This is content"
        clean = BookChatbot._clean_response(dirty)
        assert not clean.startswith("1")

    def test_clean_response_handles_empty(self):
        """Test _clean_response handles empty or None input"""
        from chatbot.services import BookChatbot
        
        assert BookChatbot._clean_response("") == ""
        assert BookChatbot._clean_response(None) == ""