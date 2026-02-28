import os
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


def book_pdf_path(instance, filename):
    """Generate file path for book PDF uploads"""
    return os.path.join('pdfs', f'user_{instance.user.id}', filename)


class Book(models.Model):
    """Book model for library management"""
    
    OCR_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='books')
    title = models.CharField(max_length=500)
    author = models.CharField(max_length=300)
    isbn = models.CharField(max_length=20, blank=True, null=True)
    pdf = models.FileField(upload_to=book_pdf_path)
    image_url = models.URLField(
        max_length=500, 
        blank=True, 
        null=True,
        default='https://images.unsplash.com/photo-1501854140801-50d01698950b'
    )
    progress_percentage = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    personal_notes = models.TextField(blank=True, null=True)
    is_favorite = models.BooleanField(default=False)
    ocr_status = models.CharField(
        max_length=20,
        choices=OCR_STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'books'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', '-updated_at']),
            models.Index(fields=['user', 'is_favorite']),
        ]

    def __str__(self):
        return f"{self.title} by {self.author}"

    @property
    def vector_db_path(self):
        """Get the path for this book's vector database"""
        from django.conf import settings
        return os.path.join(
            settings.VECTOR_STORAGE_PATH, 
            f'user_{self.user.id}',
            f'book_{self.id}'
        )

    def delete(self, *args, **kwargs):
        """Override delete to remove PDF file and vector DB"""
        # Delete PDF file
        if self.pdf:
            if os.path.isfile(self.pdf.path):
                os.remove(self.pdf.path)
        
        # Delete vector database directory
        import shutil
        if os.path.exists(self.vector_db_path):
            shutil.rmtree(self.vector_db_path)
        
        super().delete(*args, **kwargs)