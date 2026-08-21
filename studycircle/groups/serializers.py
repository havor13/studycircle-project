from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StudyGroup, GroupMember, Resource, Event


class UserSerializer(serializers.ModelSerializer):
    """
    Basic user serializer for nested references.
    """
    class Meta:
        model = User
        fields = ["id", "username"]


class StudyGroupSerializer(serializers.ModelSerializer):
    """
    Serializer for StudyGroup model.
    Includes creator details and members list.
    """
    created_by = UserSerializer(read_only=True)
    members = serializers.SerializerMethodField()

    class Meta:
        model = StudyGroup
        fields = ["id", "name", "description", "created_by", "created_at", "members"]

    def get_members(self, obj):
        return [
            {
                "id": member.user.id,
                "username": member.user.username,
                "role": member.role,
            }
            for member in obj.members.all()
        ]


class GroupMemberSerializer(serializers.ModelSerializer):
    """
    Serializer for GroupMember model.
    Includes user details.
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = GroupMember
        fields = ["id", "group", "user", "role", "joined_at"]


class ResourceSerializer(serializers.ModelSerializer):
    """
    Serializer for Resource model.
    """
    class Meta:
        model = Resource
        fields = ["id", "group", "title", "url", "description", "created_at"]


class EventSerializer(serializers.ModelSerializer):
    """
    Serializer for Event model.
    Includes creator details and makes group read-only.
    """
    created_by = UserSerializer(read_only=True)
    group = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "group",
            "title",
            "description",
            "start_at",
            "end_at",
            "location",
            "created_by",
            "created_at",
        ]
