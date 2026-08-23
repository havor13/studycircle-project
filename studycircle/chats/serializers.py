from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ChatThread, ChatMessage, ChatParticipant, ChatMessageRead, ChatMessageReaction


# 🔹 Participant Serializer
class ChatParticipantSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = ChatParticipant
        fields = ["id", "thread", "user", "username"]


# 🔹 Thread Serializer (read-only with participants)
class ChatThreadSerializer(serializers.ModelSerializer):
    participants = ChatParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = ChatThread
        fields = ["id", "created_at", "participants"]


# 🔹 Thread Creation Serializer (write-only participants list)
class ChatThreadCreateSerializer(serializers.ModelSerializer):
    participants = serializers.ListField(
        child=serializers.IntegerField(), write_only=True
    )

    class Meta:
        model = ChatThread
        fields = ["id", "created_at", "participants"]

    def validate_participants(self, value):
        # Ensure all participant IDs exist
        invalid_ids = [uid for uid in value if not User.objects.filter(id=uid).exists()]
        if invalid_ids:
            raise serializers.ValidationError(
                f"Invalid user IDs: {', '.join(map(str, invalid_ids))}"
            )
        return value

    def create(self, validated_data):
        participant_ids = validated_data.pop("participants", [])
        thread = ChatThread.objects.create(**validated_data)
        for user_id in participant_ids:
            ChatParticipant.objects.create(thread=thread, user_id=user_id)
        return thread


# 🔹 Reaction Serializer
class ChatMessageReactionSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = ChatMessageReaction
        fields = ["id", "message", "user", "user_username", "emoji", "reacted_at"]
        read_only_fields = ["id", "reacted_at", "user"]


# 🔹 Message Serializer (includes reactions)
class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    attachment_url = serializers.SerializerMethodField()
    reactions = ChatMessageReactionSerializer(
        many=True,
        read_only=True,
        source="chat_reactions"   # ✅ updated to match model related_name
    )

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "thread",
            "sender",
            "sender_username",
            "content",
            "attachment",       # raw file field
            "attachment_url",   # full URL for frontend
            "created_at",
            "reactions",        # ✅ reactions list
        ]
        read_only_fields = ["sender", "created_at"]

    def get_attachment_url(self, obj):
        if obj.attachment and hasattr(obj.attachment, "url"):
            request = self.context.get("request")
            return request.build_absolute_uri(obj.attachment.url) if request else obj.attachment.url
        return None


# 🔹 Read Receipt Serializer
class ChatMessageReadSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = ChatMessageRead
        fields = ["id", "message", "user", "user_username", "read_at"]