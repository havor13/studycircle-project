from django.db import models
from django.contrib.auth.models import User

class SearchQuery(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    query = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    result_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username if self.user else 'Anonymous'} searched '{self.query}'"


class Recommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=[("post", "Post"), ("group", "Group"), ("user", "User")])
    score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recommendation for {self.user.username}: {self.title} ({self.type})"
