from rest_framework import viewsets, permissions
from .models import StudyGroup, GroupMember, Resource, Event
from .serializers import (
    StudyGroupSerializer,
    GroupMemberSerializer,
    ResourceSerializer,
    EventSerializer,
)


class StudyGroupViewSet(viewsets.ModelViewSet):
    """
    Handles CRUD operations for Study Groups.
    """
    queryset = StudyGroup.objects.all().order_by("created_at")
    serializer_class = StudyGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically set the creator to the logged-in user
        serializer.save(created_by=self.request.user)


class GroupMemberViewSet(viewsets.ModelViewSet):
    """
    Handles CRUD operations for Group Members.
    """
    queryset = GroupMember.objects.all().order_by("joined_at")
    serializer_class = GroupMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Allow filtering members by group ID via ?group=<id>
        group_id = self.request.query_params.get("group")
        if group_id:
            return GroupMember.objects.filter(group_id=group_id).order_by("joined_at")
        return super().get_queryset()

    def perform_create(self, serializer):
        # Automatically set the user to the logged-in user
        serializer.save(user=self.request.user)


class ResourceViewSet(viewsets.ModelViewSet):
    """
    Handles CRUD operations for Resources linked to Study Groups.
    """
    queryset = Resource.objects.all().order_by("created_at")
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Allow filtering resources by group ID via ?group=<id>
        group_id = self.request.query_params.get("group")
        if group_id:
            return Resource.objects.filter(group_id=group_id).order_by("created_at")
        return super().get_queryset()

    def perform_create(self, serializer):
        # Automatically attach resource to the logged-in user if needed
        serializer.save()


class EventViewSet(viewsets.ModelViewSet):
    """
    Handles CRUD operations for Events linked to Study Groups.
    """
    queryset = Event.objects.all().order_by("start_at")
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Allow filtering events by group ID via ?group=<id>
        group_id = self.request.query_params.get("group")
        if group_id:
            return Event.objects.filter(group_id=group_id).order_by("start_at")
        return super().get_queryset()

    def perform_create(self, serializer):
        # Automatically set the creator to the logged-in user
        serializer.save(created_by=self.request.user)
