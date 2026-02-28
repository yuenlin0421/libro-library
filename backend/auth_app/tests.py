import pytest
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from auth_app.models import UserProfile


@pytest.mark.django_db
class TestUserProfile:
    """Test UserProfile model"""

    def test_user_profile_creation(self, user):
        """Test user profile is auto-created"""
        assert hasattr(user, 'profile')
        assert user.profile.annual_goal == 20

    def test_user_profile_str(self, user):
        """Test user profile string representation"""
        assert str(user.profile) == f"{user.username}'s Profile"

    def test_annual_goal_update(self, user):
        """Test updating annual goal"""
        profile = user.profile
        profile.annual_goal = 30
        profile.save()
        
        profile.refresh_from_db()
        assert profile.annual_goal == 30


@pytest.mark.django_db
class TestAuthenticationViews:
    """Test authentication views"""

    def test_check_auth_unauthenticated(self, api_client):
            """
            修改點：現在未登入應該回傳 200 而非 401
            """
            url = reverse('auth_app:check-auth')
            response = api_client.get(url)
            
            assert response.status_code == status.HTTP_200_OK
            assert response.data['authenticated'] is False
            assert response.data['user'] is None

    def test_check_auth_authenticated(self, authenticated_client):
        """Test check auth endpoint with authentication"""
        url = reverse('auth_app:check-auth')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['authenticated'] is True
        assert 'user' in response.data

    def test_logout_requires_authentication(self, api_client):
        """Test logout requires authentication"""
        url = reverse('auth_app:logout')
        response = api_client.post(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_user_profile_get(self, authenticated_client, user):
        """Test getting user profile"""
        url = reverse('auth_app:user-profile')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == user.email
        assert 'profile' in response.data

    def test_user_profile_update_annual_goal(self, authenticated_client, user):
        """Test updating annual goal via profile endpoint"""
        url = reverse('auth_app:user-profile')
        response = authenticated_client.patch(url, {'annual_goal': 50})
        
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.profile.annual_goal == 50

    def test_user_profile_invalid_annual_goal(self, authenticated_client):
        """Test updating with invalid annual goal"""
        url = reverse('auth_app:user-profile')
        response = authenticated_client.patch(url, {'annual_goal': -5})
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_user_profile_requires_authentication(self, api_client):
        """Test profile endpoint requires authentication"""
        url = reverse('auth_app:user-profile')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED