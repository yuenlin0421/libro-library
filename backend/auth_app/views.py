import requests
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from .models import UserProfile
from .serializers import UserSerializer


class GoogleLoginView(APIView):
    """Google OAuth2.0 login endpoint"""
    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response(
                {"error": "No code provided"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Exchange code for access token
        token_url = "https://oauth2.googleapis.com/token"
        
        # 使用前端的 redirect_uri
        redirect_uri = "http://localhost:3000/login"
        
        data = {
            "code": code,
            "client_id": settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id'],
            "client_secret": settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['secret'],
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }
        
        try:
            token_res = requests.post(token_url, data=data).json()
            access_token = token_res.get('access_token')

            if not access_token:
                return Response(
                    {"error": "Failed to exchange code", "details": token_res}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get user info from Google
            user_info_res = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            ).json()

            email = user_info_res.get('email')
            first_name = user_info_res.get('given_name', '')
            last_name = user_info_res.get('family_name', '')

            if not email:
                return Response(
                    {"error": "Failed to get user email from Google"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create or get user in Django database
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email, 
                    'first_name': first_name, 
                    'last_name': last_name
                }
            )

            # Update user info if exists
            if not created:
                user.first_name = first_name
                user.last_name = last_name
                user.save()

            # Create user profile if doesn't exist
            UserProfile.objects.get_or_create(user=user)

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Build response
            response = Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),  # 也回傳給前端（前端不會儲存）
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)
            
            # Store Refresh Token in HttpOnly Cookie
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
                domain=None,
                path='/', # 👈 強烈建議加上這行
            )
            
            return response
            
        except Exception as e:
            return Response(
                {"error": "Authentication failed", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RefreshTokenView(APIView):
    permission_classes = [AllowAny] # Fix 
    # permission_classes = [IsAuthenticated]
    
    
    def post(self, request):
        # 從 HttpOnly Cookie 讀取
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response(
                {"authenticated": False, "error": "No refresh token"},
                status=status.HTTP_200_OK # 這裡回傳 200 讓前端靜默處理
            )
        
        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                "access": str(refresh.access_token)
            }, status=status.HTTP_200_OK)
            
        except Exception:
            # Token 過期或無效
            response = Response(
                {"authenticated": False, "error": "Invalid token"},
                status=status.HTTP_200_OK
            )
            # 清除壞掉的 Cookie
            response.delete_cookie('refresh_token', path='/', samesite='Lax')
            return response



class CheckAuthView(APIView):
    """Check if user is authenticated"""
    permission_classes = [AllowAny] # 必須是 AllowAny，否則沒 Token 連進都進不來
    # permission_classes = [IsAuthenticated] # 改回需要認證

    def get(self, request):
        # 檢查 user 是否已經透過 JWT 或 Session 認證
        if request.user and request.user.is_authenticated:
            return Response({
                "authenticated": True,
                "user": UserSerializer(request.user).data
            }, status=status.HTTP_200_OK)
        
        # 如果未登入，回傳 False 但維持 200 狀態碼
        return Response({
            "authenticated": False,
            "user": None
        }, status=status.HTTP_200_OK)



class LogoutView(APIView):
    """Logout user by blacklisting refresh token and clearing cookie"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            response = Response(
                {"message": "Successfully logged out"}, 
                status=status.HTTP_200_OK
            )
            
            response.delete_cookie(
                key='refresh_token',
                samesite='Lax',
            )
            
            return response
            
        except Exception as e:
            response = Response(
                {"message": "Logged out (with errors)", "error": str(e)}, 
                status=status.HTTP_200_OK
            )
            response.delete_cookie('refresh_token', samesite='Lax')
            return response


class UserProfileView(APIView):
    """Get or update user profile"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        UserProfile.objects.get_or_create(user=request.user)
        return Response(
            UserSerializer(request.user).data,
            status=status.HTTP_200_OK
        )

    def patch(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        annual_goal = request.data.get('annual_goal')
        
        if annual_goal is not None:
            try:
                annual_goal = int(annual_goal)
                if annual_goal < 0:
                    return Response(
                        {"error": "Annual goal must be positive"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                profile.annual_goal = annual_goal
                profile.save()
            except ValueError:
                return Response(
                    {"error": "Invalid annual goal value"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(
            UserSerializer(request.user).data,
            status=status.HTTP_200_OK
        )