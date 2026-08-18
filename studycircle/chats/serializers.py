from rest_framework import serializers
from .models import ChatThread, ChatMessage

class ChatThreadSerializer(serializers.ModelSerializer):
    # Show usernames instead of just IDs
    participants = serializers.StringRelatedField(many=True)  # show usernames

    class Meta:
        model = ChatThread
        fields = [
            'id',
            'chat_type',     # "general" or "private"
            'participants',  # list of usernames
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
            'type',            # ✅ new field
            'name',            # ✅ new field
            'created_at',
            'is_read',
        ]
