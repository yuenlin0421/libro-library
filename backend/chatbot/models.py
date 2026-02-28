from django.db import models
from django.contrib.auth.models import User
from library.models import Book


class Conversation(models.Model):
    """Chat conversation between user and bot"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='conversations', null=True, blank=True)
    user_message = models.TextField()
    bot_response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'conversations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['book', '-created_at']),
        ]

    def __str__(self):
        return f"Conversation {self.id} - {self.user.username}"