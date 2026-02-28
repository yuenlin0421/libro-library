from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'annual_goal', 'books_read_this_year', 'goal_progress', 'created_at']
    search_fields = ['user__username', 'user__email']
    list_filter = ['created_at', 'annual_goal']
    readonly_fields = ['created_at', 'updated_at']

    def books_read_this_year(self, obj):
        return obj.books_read_this_year
    books_read_this_year.short_description = 'Books Read (This Year)'

    def goal_progress(self, obj):
        return f"{obj.goal_progress:.1f}%"
    goal_progress.short_description = 'Goal Progress'