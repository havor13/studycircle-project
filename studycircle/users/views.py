from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import Profile
from .serializers import UserSerializer, ProfileSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    Handles CRUD operations for Users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class ProfileViewSet(viewsets.ModelViewSet):
    """
    Handles CRUD operations for User Profiles.
    """
    queryset = Profile.objects.all()   # ✅ Added back so DRF router can infer basename
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return the logged-in user's profile
        return Profile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Ensure profile is linked to the logged-in user
        serializer.save(user=self.request.user)


# ✅ Signup endpoint
class SignupView(generics.CreateAPIView):
    """
    Custom signup endpoint that creates a User and Profile,
    then returns both along with JWT tokens.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Ensure profile exists (auto-created in serializer, but double-check)
        profile, created = Profile.objects.get_or_create(user=user)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return Response({
            "user": UserSerializer(user).data,
            "profile": ProfileSerializer(profile).data,
            "refresh": str(refresh),
            "access": str(access),
        }, status=status.HTTP_201_CREATED)
