from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import StudyGroupViewSet, GroupMemberViewSet, ResourceViewSet, EventViewSet

# Main router
router = DefaultRouter()
router.register(r'groups', StudyGroupViewSet, basename='group')
router.register(r'group-members', GroupMemberViewSet, basename='group-member')
router.register(r'resources', ResourceViewSet, basename='resource')

# Nested router for events under groups
groups_router = routers.NestedSimpleRouter(router, r'groups', lookup='group')
groups_router.register(r'events', EventViewSet, basename='group-events')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(groups_router.urls)),
]
