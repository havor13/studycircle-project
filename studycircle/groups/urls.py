from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudyGroupViewSet, GroupMemberViewSet, ResourceViewSet   # ✅ match views.py

# Router for groups app
router = DefaultRouter()
router.register(r'groups', StudyGroupViewSet, basename='group')
router.register(r'group-members', GroupMemberViewSet, basename='group-member')
router.register(r'resources', ResourceViewSet, basename='resource')

urlpatterns = [
    path('', include(router.urls)),
]
