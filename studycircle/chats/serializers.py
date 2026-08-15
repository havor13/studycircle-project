from rest_framework import serializers
from .models import ChatThread, ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField()  # shows username instead of ID

    class Meta:
        model = ChatMessage
        fields = ['id', 'thread', 'sender', 'content', 'created_at', 'is_read']


class ChatThreadSerializer(serializers.ModelSerializer):
    participants = serializers.StringRelatedField(many=True)  # show usernames
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatThread
        fields = ['id', 'participants', 'chat_type', 'created_at', 'messages']
