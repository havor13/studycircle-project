from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ThreadViewSet, MessageViewSet, MessageReadViewSet

router = DefaultRouter()
router.register(r'threads', ThreadViewSet, basename='thread')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'message_reads', MessageReadViewSet, basename='message_read')

urlpatterns = [
    path('', include(router.urls)),
]
