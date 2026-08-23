from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import ChatThread, ChatMessage, ChatParticipant, ChatMessageRead, ChatMessageReaction
from .serializers import (
    ChatThreadSerializer,
    ChatThreadCreateSerializer,
    ChatMessageSerializer,
    ChatParticipantSerializer,
    ChatMessageReadSerializer,
    ChatMessageReactionSerializer,
)

# 🔹 Threads
class ThreadViewSet(viewsets.ModelViewSet):
    queryset = ChatThread.objects.all().order_by("-created_at")
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return ChatThreadCreateSerializer
        return ChatThreadSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        thread = serializer.save()
        return Response(
            ChatThreadSerializer(thread, context={"request": request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=["post"])
    def private(self, request):
        """
        Create or return a private thread between two users.
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

        # Check if thread already exists
        existing = ChatThread.objects.filter(
            participants__user_id=user1_id
        ).filter(participants__user_id=user2_id).first()
        if existing:
            serializer = ChatThreadSerializer(existing, context={"request": request})
            return Response(serializer.data)

        thread = ChatThread.objects.create()
        ChatParticipant.objects.create(thread=thread, user=user1)
        ChatParticipant.objects.create(thread=thread, user=user2)

        serializer = ChatThreadSerializer(thread, context={"request": request})
        return Response(serializer.data)


# 🔹 Messages
class MessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all().order_by("created_at")
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        thread_id = self.request.query_params.get("thread")
        if thread_id:
            queryset = queryset.filter(thread_id=thread_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def upload(self, request):
        thread_id = request.data.get("thread")
        file = request.FILES.get("file")

        if not thread_id or not file:
            return Response({"error": "Missing thread or file"}, status=status.HTTP_400_BAD_REQUEST)

        thread = get_object_or_404(ChatThread, id=thread_id)

        message = ChatMessage.objects.create(
            thread=thread,
            sender=request.user,
            content=file.name,
            attachment=file
        )

        serializer = self.get_serializer(message, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # ✅ New: React to a message
    @action(detail=True, methods=["post"])
    def react(self, request, pk=None):
        """
        React to a message with an emoji.
        Expects JSON: { "emoji": "👍" }
        """
        message = get_object_or_404(ChatMessage, id=pk)
        emoji = request.data.get("emoji")

        if not emoji:
            return Response({"error": "Emoji is required"}, status=status.HTTP_400_BAD_REQUEST)

        reaction, created = ChatMessageReaction.objects.get_or_create(
            message=message,
            user=request.user,
            emoji=emoji
        )

        serializer = ChatMessageReactionSerializer(reaction, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


# 🔹 Read Receipts
class MessageReadViewSet(viewsets.ModelViewSet):
    queryset = ChatMessageRead.objects.all().order_by("read_at")
    serializer_class = ChatMessageReadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        message_id = self.request.query_params.get("message")
        if message_id:
            queryset = queryset.filter(message_id=message_id)
        return queryset