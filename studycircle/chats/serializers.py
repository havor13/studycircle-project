from rest_framework import serializers
from .models import ChatThread, ChatMessage

class ChatThreadSerializer(serializers.ModelSerializer):
    # Show usernames instead of just IDs
    user1_username = serializers.CharField(source='user1.username', read_only=True)
    user2_username = serializers.CharField(source='user2.username', read_only=True)

    class Meta:
        model = ChatThread
        fields = [
            'id',
            'chat_type',       # e.g. "general" or "private"
            'user1',           # FK to User
            'user2',           # FK to User
            'user1_username',  # convenience field
            'user2_username',  # convenience field
            'created_at',
        ]


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = ChatMessage
        fields = [
            'id',
            'thread',          # FK to ChatThread
            'sender',          # FK to User
            'sender_username', # convenience field
            'content',
            'created_at',
        ]
