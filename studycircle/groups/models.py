from django.db import models
from django.contrib.auth.models import User


class StudyGroup(models.Model):
    """
    Represents a study group created by a user.
    """
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="study_groups_created"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"StudyGroup: {self.name}"


class GroupMember(models.Model):
    """
    Represents membership of a user in a study group.
    """
    ROLE_CHOICES = (
        ("member", "Member"),
        ("admin", "Admin"),
    )

    group = models.ForeignKey(
        StudyGroup,
        on_delete=models.CASCADE,
        related_name="members"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="study_group_memberships"
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="member")
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role}) in {self.group.name}"


class Resource(models.Model):
    """
    Represents a resource (link, document, etc.) shared in a study group.
    """
    group = models.ForeignKey(
        StudyGroup,
        on_delete=models.CASCADE,
        related_name="resources"
    )
    title = models.CharField(max_length=200)
    url = models.URLField(blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.group.name})"
