from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import (
    Conversation,
    ChatThread,
    ChatMessage,
    ChatParticipant,
    ChatMessageRead,
    ChatMessageReaction,
)
from .serializers import (
    ConversationSerializer,
    ChatThreadSerializer,
    ChatThreadCreateSerializer,
    ChatMessageSerializer,
    ChatParticipantSerializer,
    ChatMessageReadSerializer,
    ChatMessageReactionSerializer,
)

# 🔹 Conversations
class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all().order_by("-created_at")
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return conversations the logged-in user participates in
        return Conversation.objects.filter(participants=self.request.user)

    @action(detail=False, methods=["post"])
    def private(self, request):
        """
        Create or return a private conversation between two users.
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

        # Check if conversation already exists
        existing = Conversation.objects.filter(participants=user1).filter(participants=user2).first()
        if existing:
            serializer = ConversationSerializer(existing, context={"request": request})
            return Response(serializer.data)

        conversation = Conversation.objects.create()
        conversation.participants.add(user1, user2)

        serializer = ConversationSerializer(conversation, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# 🔹 Threads (optional inside conversations)
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


# 🔹 Messages
class MessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all().order_by("created_at")
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        conversation_id = self.request.query_params.get("conversation")
        thread_id = self.request.query_params.get("thread")

        if conversation_id:
            queryset = queryset.filter(conversation_id=conversation_id)
        if thread_id:
            queryset = queryset.filter(thread_id=thread_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    def perform_update(self, serializer):
        # ✅ Only allow sender to edit their own message
        if serializer.instance.sender != self.request.user:
            raise PermissionDenied("You can only edit your own messages.")
        serializer.save()

    @action(detail=False, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def upload(self, request):
        conversation_id = request.data.get("conversation")
        file = request.FILES.get("file")

        if not conversation_id or not file:
            return Response({"error": "Missing conversation or file"}, status=status.HTTP_400_BAD_REQUEST)

        conversation = get_object_or_404(Conversation, id=conversation_id)

        message = ChatMessage.objects.create(
            conversation=conversation,
            sender=request.user,
            content=file.name,
            attachment=file
        )

        serializer = self.get_serializer(message, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # ✅ React to a message
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

        # Toggle off if already exists
        if not created:
            reaction.delete()
            return Response({"status": "reaction removed"}, status=status.HTTP_200_OK)

        serializer = ChatMessageReactionSerializer(reaction, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


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

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        """
        Mark a message as read by the current user.
        """
        message = get_object_or_404(ChatMessage, id=pk)
        receipt, created = ChatMessageRead.objects.get_or_create(
            message=message,
            user=request.user
        )
        serializer = ChatMessageReadSerializer(receipt, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
