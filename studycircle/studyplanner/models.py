from django.db import models
from django.contrib.auth.models import User
from groups.models import StudyGroup   # ✅ import StudyGroup

class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField()
    completed = models.BooleanField(default=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, null=True, blank=True, related_name="tasks")  # ✅ link to StudyGroup

    def __str__(self):
        return self.title


class Event(models.Model):
    name = models.CharField(max_length=200)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    participants = models.ManyToManyField(User, related_name="events")
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, null=True, blank=True, related_name="planner_events")  # ✅ link to StudyGroup

    def __str__(self):
        return self.name
