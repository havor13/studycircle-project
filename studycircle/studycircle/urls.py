from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet, ProfileViewSet, SignupView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from django.conf import settings
from django.conf.urls.static import static

def home(request):
    return HttpResponse("Welcome to StudyCircle API. Available endpoints start with /api/")

# Router for users + profiles
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', ProfileViewSet, basename='profile')  # ✅ basename added

urlpatterns = [
    # Root homepage
    path('', home, name='home'),

    # Django admin
    path('admin/', admin.site.urls),

    # API schema/docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    re_path(r'^api/docs/$', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Modular API endpoints
    path('api/', include(router.urls)),         # users + profiles
    path('api/', include('groups.urls')),       # groups + group-members + resources
    path('api/', include('posts.urls')),        # posts + comments + likes
    path('api/', include('chats.urls')),        # threads + messages
    path('api/', include('search.urls')),       # search endpoint
    path('planner/', include('studyplanner.urls')),

    # Auth endpoints
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/signup/', SignupView.as_view(), name='signup'),
]

# ✅ Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
