from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import StudyGroupViewSet, GroupMemberViewSet, ResourceViewSet, EventViewSet

# Main router for top-level resources
router = DefaultRouter()
router.register(r'groups', StudyGroupViewSet, basename='group')

# Nested router for group-related resources
groups_router = routers.NestedSimpleRouter(router, r'groups', lookup='group')
groups_router.register(r'members', GroupMemberViewSet, basename='group-members')
groups_router.register(r'resources', ResourceViewSet, basename='group-resources')
groups_router.register(r'events', EventViewSet, basename='group-events')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(groups_router.urls)),
]
