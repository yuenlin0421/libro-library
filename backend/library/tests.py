import pytest
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from library.models import Book
from unittest.mock import patch, MagicMock


@pytest.fixture
def sample_book(user):
    """Create a sample book for testing"""
    pdf_file = SimpleUploadedFile(
        "test.pdf",
        b"fake pdf content",
        content_type="application/pdf"
    )
    return Book.objects.create(
        user=user,
        title="Test Book",
        author="Test Author",
        isbn="1234567890",
        pdf=pdf_file,
        progress_percentage=50,
        personal_notes="Test notes"
    )


@pytest.fixture
def sample_books(user):
    """Create multiple sample books for testing"""
    books = []
    for i in range(3):
        pdf_file = SimpleUploadedFile(
            f"test{i}.pdf",
            b"fake pdf content",
            content_type="application/pdf"
        )
        book = Book.objects.create(
            user=user,
            title=f"Book {i}",
            author=f"Author {i}",
            isbn=f"ISBN{i}",
            pdf=pdf_file,
            progress_percentage=i * 25,
            personal_notes=f"Notes for book {i}" if i % 2 == 0 else None,
            is_favorite=i == 1
        )
        books.append(book)
    return books


@pytest.mark.django_db
class TestBookModel:
    """Test Book model"""

    def test_book_creation(self, sample_book):
        """Test book creation"""
        assert sample_book.title == "Test Book"
        assert sample_book.author == "Test Author"
        assert sample_book.progress_percentage == 50
        assert sample_book.is_favorite is False

    def test_book_str(self, sample_book):
        """Test book string representation"""
        assert str(sample_book) == "Test Book by Test Author"

    def test_book_default_values(self, user):
        """Test book default values"""
        pdf_file = SimpleUploadedFile("test2.pdf", b"content", content_type="application/pdf")
        book = Book.objects.create(
            user=user,
            title="Book 2",
            author="Author 2",
            pdf=pdf_file
        )
        assert book.progress_percentage == 0
        assert book.is_favorite is False
        assert book.ocr_status == 'pending'
        assert book.image_url == 'https://images.unsplash.com/photo-1501854140801-50d01698950b'


@pytest.mark.django_db
class TestBookViewSet:
    """Test Book ViewSet"""

    def test_list_books_unauthenticated(self, api_client):
        """Test listing books without authentication"""
        url = reverse('library:book-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_books(self, authenticated_client, sample_book):
        """Test listing books"""
        url = reverse('library:book-list')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        # BookListSerializer 包含 personal_notes
        assert 'personal_notes' in response.data['results'][0]

    def test_list_books_filters_by_user(self, authenticated_client, sample_book, user2):
        """Test books are filtered by user"""
        # Create book for different user
        pdf_file = SimpleUploadedFile("test2.pdf", b"content", content_type="application/pdf")
        Book.objects.create(
            user=user2,
            title="User2 Book",
            author="Author 2",
            pdf=pdf_file
        )
        
        url = reverse('library:book-list')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['title'] == "Test Book"

    @patch('library.views.process_book_ocr.delay')
    def test_create_book(self, mock_ocr, authenticated_client):
        """Test creating a book"""
        url = reverse('library:book-list')
        pdf_file = SimpleUploadedFile("new.pdf", b"content", content_type="application/pdf")
        
        data = {
            'title': 'New Book',
            'author': 'New Author',
            'isbn': '9876543210',
            'pdf': pdf_file
        }
        
        response = authenticated_client.post(url, data, format='multipart')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Book.objects.filter(title='New Book').exists()
        mock_ocr.assert_called_once()

    def test_retrieve_book(self, authenticated_client, sample_book):
        """Test retrieving a specific book"""
        url = reverse('library:book-detail', kwargs={'pk': sample_book.id})
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == sample_book.title

    def test_update_book(self, authenticated_client, sample_book):
        """Test updating a book"""
        url = reverse('library:book-detail', kwargs={'pk': sample_book.id})
        data = {
            'progress_percentage': 75,
            'personal_notes': 'Updated notes',
            'is_favorite': True
        }
        
        response = authenticated_client.patch(url, data)
        
        assert response.status_code == status.HTTP_200_OK
        sample_book.refresh_from_db()
        assert sample_book.progress_percentage == 75
        assert sample_book.is_favorite is True

    def test_delete_book(self, authenticated_client, sample_book):
        """Test deleting a book"""
        url = reverse('library:book-detail', kwargs={'pk': sample_book.id})
        response = authenticated_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Book.objects.filter(id=sample_book.id).exists()

    def test_get_favorites(self, authenticated_client, user):
        """Test getting favorite books"""
        # Create favorite book
        pdf_file = SimpleUploadedFile("fav.pdf", b"content", content_type="application/pdf")
        Book.objects.create(
            user=user,
            title="Favorite Book",
            author="Author",
            pdf=pdf_file,
            is_favorite=True
        )
        
        url = reverse('library:book-favorites')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_get_books_with_notes(self, authenticated_client, sample_book):
        """Test getting books with notes"""
        url = reverse('library:book-with-notes')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_annual_goal_endpoint(self, authenticated_client, user):
        """Test annual goal endpoint"""
        url = reverse('library:book-annual-goal')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'annual_goal' in response.data
        assert 'books_read' in response.data
        assert 'progress_percentage' in response.data

    def test_cannot_access_other_users_book(self, authenticated_client, user2):
        """Test user cannot access another user's book"""
        pdf_file = SimpleUploadedFile("other.pdf", b"content", content_type="application/pdf")
        other_book = Book.objects.create(
            user=user2,
            title="Other Book",
            author="Other Author",
            pdf=pdf_file
        )
        
        url = reverse('library:book-detail', kwargs={'pk': other_book.id})
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestBookSearch:
    """Test book search functionality"""

    def test_search_all_books(self, authenticated_client, sample_books):
        """Test searching all books"""
        url = reverse('library:book-search-all')
        response = authenticated_client.get(url, {'q': 'Book 1'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['title'] == 'Book 1'

    def test_search_by_author(self, authenticated_client, sample_books):
        """Test searching by author"""
        url = reverse('library:book-search-all')
        response = authenticated_client.get(url, {'q': 'Author 0'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['author'] == 'Author 0'

    def test_search_by_isbn(self, authenticated_client, sample_books):
        """Test searching by ISBN"""
        url = reverse('library:book-search-all')
        response = authenticated_client.get(url, {'q': 'ISBN1'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_search_by_notes(self, authenticated_client, sample_books):
        """Test searching by personal notes"""
        url = reverse('library:book-search-all')
        response = authenticated_client.get(url, {'q': 'Notes for book 0'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_search_empty_query(self, authenticated_client, sample_books):
        """Test search with empty query returns all books"""
        url = reverse('library:book-search-all')
        response = authenticated_client.get(url, {'q': ''})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3

    def test_search_no_results(self, authenticated_client, sample_books):
        """Test search with no matching results"""
        url = reverse('library:book-search-all')
        response = authenticated_client.get(url, {'q': 'nonexistent'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0

    def test_search_favorites(self, authenticated_client, sample_books):
        """Test searching within favorites"""
        url = reverse('library:book-search-favorites')
        response = authenticated_client.get(url, {'q': 'Book'})
        
        assert response.status_code == status.HTTP_200_OK
        # Only Book 1 is favorite
        assert len(response.data) == 1
        assert response.data[0]['is_favorite'] is True

    def test_search_with_notes(self, authenticated_client, sample_books):
        """Test searching within books with notes"""
        url = reverse('library:book-search-with-notes')
        response = authenticated_client.get(url, {'q': 'Book'})
        
        assert response.status_code == status.HTTP_200_OK
        # Books 0 and 2 have notes
        assert len(response.data) == 2

    def test_search_case_insensitive(self, authenticated_client, sample_books):
        """Test search is case insensitive"""
        url = reverse('library:book-search-all')
        response = authenticated_client.get(url, {'q': 'book 1'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1


@pytest.mark.django_db
class TestBookSerializers:
    """Test book serializers"""

    def test_book_list_serializer_fields(self, authenticated_client, sample_book):
        """Test BookListSerializer includes personal_notes"""
        url = reverse('library:book-list')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        book_data = response.data['results'][0]
        assert 'personal_notes' in book_data
        assert 'id' in book_data
        assert 'title' in book_data
        assert 'author' in book_data
        assert 'image_url' in book_data
        assert 'progress_percentage' in book_data
        assert 'is_favorite' in book_data
        assert 'updated_at' in book_data

    def test_progress_percentage_validation(self, authenticated_client, sample_book):
        """Test progress percentage validation"""
        url = reverse('library:book-detail', kwargs={'pk': sample_book.id})
        
        # Test invalid value > 100
        response = authenticated_client.patch(url, {'progress_percentage': 150})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        # Test invalid value < 0
        response = authenticated_client.patch(url, {'progress_percentage': -10})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        # Test valid value
        response = authenticated_client.patch(url, {'progress_percentage': 100})
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestOCRReprocessing:
    """Test OCR reprocessing functionality"""

    @patch('library.views.process_book_ocr.delay')
    def test_reprocess_ocr(self, mock_ocr, authenticated_client, sample_book):
        """Test manually triggering OCR reprocessing"""
        url = reverse('library:book-reprocess-ocr', kwargs={'pk': sample_book.id})
        response = authenticated_client.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['message'] == 'OCR processing started'
        assert response.data['book_id'] == sample_book.id
        assert response.data['status'] == 'processing'
        mock_ocr.assert_called_once_with(sample_book.id)