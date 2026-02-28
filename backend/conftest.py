import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.fixture
def api_client():
    """Provide API client"""
    return APIClient()


@pytest.fixture
def user(db):
    """Create a test user with profile"""
    user = User.objects.create_user(
        username='testuser',
        email='testuser@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )
    # Ensure profile is created
    from auth_app.models import UserProfile
    UserProfile.objects.get_or_create(user=user)
    return user


@pytest.fixture
def authenticated_client(api_client, user):
    """Provide authenticated API client"""
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def user2(db):
    """Create a second test user with profile"""
    user = User.objects.create_user(
        username='testuser2',
        email='testuser2@example.com',
        password='testpass123',
        first_name='Test2',
        last_name='User2'
    )
    # Ensure profile is created
    from auth_app.models import UserProfile
    UserProfile.objects.get_or_create(user=user)
    return user