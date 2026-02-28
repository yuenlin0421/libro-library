from django.contrib import admin
from .models import Conversation


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'book', 'short_message', 'created_at']
    list_filter = ['created_at', 'user', 'book']
    search_fields = ['user__username', 'user_message', 'bot_response']
    readonly_fields = ['created_at', 'updated_at']
    
    def short_message(self, obj):
        return obj.user_message[:50] + '...' if len(obj.user_message) > 50 else obj.user_message
    short_message.short_description = 'Message'

    fieldsets = (
        ('Conversation Details', {
            'fields': ('user', 'book')
        }),
        ('Messages', {
            'fields': ('user_message', 'bot_response')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )