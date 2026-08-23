from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    """
    Extended user profile for personalization & discovery.
    Includes photo, study interests, skills, and contributions.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    photo_url = models.TextField(blank=True, null=True)
    study_interests = models.TextField(blank=True, null=True)
    skills = models.TextField(blank=True, null=True)          # e.g. "Python, Django, React"
    contributions = models.TextField(blank=True, null=True)   # e.g. "Shared 5 resources, hosted 2 events"
    bio = models.TextField(blank=True, null=True)             # optional personal description

    def __str__(self):
        return f"Profile of {self.user.username}"