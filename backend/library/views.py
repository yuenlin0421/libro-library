from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q

from .models import Book
from .serializers import (
    BookSerializer, 
    BookCreateSerializer, 
    BookUpdateSerializer,
    BookListSerializer
)
from .services import process_book_ocr


class BookViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Book CRUD operations
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BookCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return BookUpdateSerializer
        elif self.action == 'list':
            return BookListSerializer
        return BookSerializer

    def get_queryset(self):
        """Filter books by authenticated user"""
        return Book.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Create book and trigger OCR processing"""
        book = serializer.save(user=self.request.user)
        # Trigger async OCR task
        process_book_ocr.delay(book.id)

    @action(detail=False, methods=['get'], url_path='current-month')
    def current_month_books(self, request):
        """Get books updated in current month"""
        now = timezone.now()
        books = self.get_queryset().filter(
            updated_at__year=now.year,
            updated_at__month=now.month
        )
        serializer = BookListSerializer(books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='favorites')
    def favorites(self, request):
        """Get favorite books"""
        books = self.get_queryset().filter(is_favorite=True)
        serializer = BookListSerializer(books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='with-notes')
    def with_notes(self, request):
        """Get books with notes"""
        books = self.get_queryset().exclude(
            Q(personal_notes__isnull=True) | Q(personal_notes='')
        )
        serializer = BookListSerializer(books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='annual-goal')
    def annual_goal(self, request):
        """Get user's annual reading goal progress"""
        from auth_app.models import UserProfile
        
        # Ensure profile exists
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        current_year = timezone.now().year
        books_read = self.get_queryset().filter(
            updated_at__year=current_year
        ).count()

        return Response({
            'annual_goal': profile.annual_goal,
            'books_read': books_read,
            'progress_percentage': (books_read / profile.annual_goal * 100) if profile.annual_goal > 0 else 0,
            'remaining': max(0, profile.annual_goal - books_read)
        })

    @action(detail=True, methods=['post'], url_path='reprocess-ocr')
    def reprocess_ocr(self, request, pk=None):
        """Manually trigger OCR reprocessing for a book"""
        book = self.get_object()
        process_book_ocr.delay(book.id)
        return Response({
            'message': 'OCR processing started',
            'book_id': book.id,
            'status': 'processing'
        })

    def destroy(self, request, *args, **kwargs):
        """Delete book and associated files"""
        instance = self.get_object()
        instance.delete()
        return Response(
            {'message': 'Book successfully deleted'},
            status=status.HTTP_204_NO_CONTENT
        )
        
    # 封裝一個通用的搜尋邏輯，供多個 Action 使用
    def _search_books(self, queryset, query):
        if not query:
            return queryset
        
        # 只要 Title, ISBN, Notes, Author 其中一個符合關鍵字即可 (不區分大小寫)
        return queryset.filter(
            Q(title__icontains=query) |
            Q(isbn__icontains=query) |
            Q(personal_notes__icontains=query) |
            Q(author__icontains=query)
        ).distinct()

    # 1. Search 該 user 所有持有的書
    @action(detail=False, methods=['get'], url_path='search')
    def search_all(self, request):
        query = request.query_params.get('q', '')
        books = self._search_books(self.get_queryset(), query)
        serializer = BookListSerializer(books, many=True)
        return Response(serializer.data)

    # 2. Search 該 user 所有「Favorites」中的書
    @action(detail=False, methods=['get'], url_path='search-favorites')
    def search_favorites(self, request):
        query = request.query_params.get('q', '')
        # 先過濾出 favorite
        favorites_qs = self.get_queryset().filter(is_favorite=True)
        # 再執行搜尋
        books = self._search_books(favorites_qs, query)
        serializer = BookListSerializer(books, many=True)
        return Response(serializer.data)

    # 3. Search 該 user 所有「有 Notes」中的書
    @action(detail=False, methods=['get'], url_path='search-with-notes')
    def search_with_notes(self, request):
        query = request.query_params.get('q', '')
        # 先過濾出有筆記的書
        notes_qs = self.get_queryset().exclude(
            Q(personal_notes__isnull=True) | Q(personal_notes='')
        )
        # 再執行搜尋
        books = self._search_books(notes_qs, query)
        serializer = BookListSerializer(books, many=True)
        return Response(serializer.data)