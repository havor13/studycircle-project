from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import ChatThread, ChatMessage, ChatParticipant, ChatMessageRead
from .serializers import (
    ChatThreadSerializer,
    ChatMessageSerializer,
    ChatParticipantSerializer,
    ChatMessageReadSerializer,
)

# 🔹 Threads
class ThreadViewSet(viewsets.ModelViewSet):
    queryset = ChatThread.objects.all().order_by("-created_at")
    serializer_class = ChatThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["post"])
    def private(self, request):
        """
        Create or return an existing private thread between two users.
        Expects JSON: { "user1": <id>, "user2": <id> }
        """
        user1_id = request.data.get("user1")
        user2_id = request.data.get("user2")

        if not user1_id or not user2_id:
            return Response({"error": "Both user1 and user2 IDs are required."}, status=400)

        try:
            user1 = User.objects.get(id=user1_id)
            user2 = User.objects.get(id=user2_id)
        except User.DoesNotExist:
            return Response({"error": "One or both users not found."}, status=404)

        # ✅ Create thread + participants
        thread = ChatThread.objects.create()
        ChatParticipant.objects.create(thread=thread, user=user1)
        ChatParticipant.objects.create(thread=thread, user=user2)

        serializer = self.get_serializer(thread)
        return Response(serializer.data)


# 🔹 Messages
class MessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all().order_by("created_at")
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Optionally filter messages by thread ID using ?thread=<id>
        """
        queryset = super().get_queryset()
        thread_id = self.request.query_params.get("thread")
        if thread_id:
            queryset = queryset.filter(thread_id=thread_id)
        return queryset


# 🔹 Read Receipts
class MessageReadViewSet(viewsets.ModelViewSet):
    queryset = ChatMessageRead.objects.all().order_by("read_at")
    serializer_class = ChatMessageReadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Optionally filter reads by message ID using ?message=<id>
        """
        queryset = super().get_queryset()
        message_id = self.request.query_params.get("message")
        if message_id:
            queryset = queryset.filter(message_id=message_id)
        return queryset
