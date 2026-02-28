# auth_app/urls.py
from django.urls import path
from .views import (
    GoogleLoginView, 
    RefreshTokenView,
    CheckAuthView, 
    LogoutView, 
    UserProfileView
)

app_name = 'auth_app'

urlpatterns = [
    path('google/login/', GoogleLoginView.as_view(), name='google-login'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh-token'),
    path('check/', CheckAuthView.as_view(), name='check-auth'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]