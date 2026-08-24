from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile,
    Conversation,
    ChatThread,
    ChatParticipant,
    ChatMessage,
    ChatMessageRead,
    ChatMessageReaction,
)

# 🔹 User serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


# 🔹 UserProfile serializer
class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ["id", "user", "photo_url", "study_interests"]


# 🔹 Conversation serializer
class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ["id", "participants", "created_at"]


# 🔹 Thread serializer
class ChatThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatThread
        fields = ["id", "conversation", "created_at"]


# 🔹 Thread create serializer (needed for POST)
class ChatThreadCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatThread
        fields = ["conversation"]   # only require conversation when creating


# 🔹 Participant serializer
class ChatParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ChatParticipant
        fields = ["id", "thread", "user"]


# 🔹 Reaction serializer
class ChatMessageReactionSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = ChatMessageReaction
        fields = ["id", "emoji", "user_username", "reacted_at"]


# 🔹 Read receipt serializer
class ChatMessageReadSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = ChatMessageRead
        fields = ["id", "user_username", "read_at"]


# 🔹 Message serializer
class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    attachment_url = serializers.ReadOnlyField()
    # 👇 Point to the new related_name "chat_reactions" but expose as "reactions"
    reactions = ChatMessageReactionSerializer(source="chat_reactions", many=True, read_only=True)
    reads = ChatMessageReadSerializer(many=True, read_only=True)

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "conversation",
            "thread",
            "sender",
            "sender_username",
            "content",
            "attachment_url",
            "created_at",
            "reactions",
            "reads",
        ]
