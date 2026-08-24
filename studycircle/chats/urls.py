from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConversationViewSet, ThreadViewSet, MessageViewSet, MessageReadViewSet

# ✅ Register viewsets with DRF router
router = DefaultRouter()
router.register(r"conversations", ConversationViewSet, basename="conversation")
router.register(r"threads", ThreadViewSet, basename="thread")
router.register(r"messages", MessageViewSet, basename="message")
router.register(r"message_reads", MessageReadViewSet, basename="message_read")

urlpatterns = [
    # 🔹 All standard CRUD endpoints from the router
    path("", include(router.urls)),

    # 🔹 Explicit route for file uploads (maps to MessageViewSet.upload action)
    path(
        "messages/upload/",
        MessageViewSet.as_view({"post": "upload"}),
        name="message-upload"
    ),

    # 🔹 Explicit route for message reactions (maps to MessageViewSet.react action)
    path(
        "messages/<int:pk>/react/",
        MessageViewSet.as_view({"post": "react"}),
        name="message-react"
    ),

    # 🔹 Explicit route for marking a message as read (maps to MessageReadViewSet.mark_read action)
    path(
        "messages/<int:pk>/mark_read/",
        MessageReadViewSet.as_view({"post": "mark_read"}),
        name="message-mark-read"
    ),
]
