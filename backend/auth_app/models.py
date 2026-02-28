from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """User profile with reading goals"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    annual_goal = models.IntegerField(default=20, help_text="Annual reading goal (number of books)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profile'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username}'s Profile"

    @property
    def books_read_this_year(self):
        """Calculate books read this year based on updated_at"""
        from django.utils import timezone
        current_year = timezone.now().year
        return self.user.books.filter(
            updated_at__year=current_year
        ).count()

    @property
    def goal_progress(self):
        """Calculate progress towards annual goal as percentage"""
        if self.annual_goal == 0:
            return 0
        return (self.books_read_this_year / self.annual_goal) * 100