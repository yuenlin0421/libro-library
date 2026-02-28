from django.contrib import admin
from .models import Book


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'author', 'user', 'progress_percentage', 
        'is_favorite', 'ocr_status', 'created_at'
    ]
    list_filter = ['is_favorite', 'ocr_status', 'created_at', 'user']
    search_fields = ['title', 'author', 'isbn', 'user__username']
    readonly_fields = ['created_at', 'updated_at', 'ocr_status']
    
    fieldsets = (
        ('Book Information', {
            'fields': ('user', 'title', 'author', 'isbn', 'pdf', 'image_url')
        }),
        ('Reading Progress', {
            'fields': ('progress_percentage', 'personal_notes', 'is_favorite')
        }),
        ('OCR Status', {
            'fields': ('ocr_status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )