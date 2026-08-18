from rest_framework import serializers
from .models import ChatThread, ChatMessage, ChatParticipant, ChatMessageRead

class ChatParticipantSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = ChatParticipant
        fields = ["id", "thread", "user", "username"]


class ChatThreadSerializer(serializers.ModelSerializer):
    participants = ChatParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = ChatThread
        fields = ["id", "created_at", "participants"]


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "thread",          # FK to ChatThread
            "sender",          # FK to User
            "sender_username", # convenience field
            "content",
            "created_at",
        ]


class ChatMessageReadSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = ChatMessageRead
        fields = ["id", "message", "user", "user_username", "read_at"]
