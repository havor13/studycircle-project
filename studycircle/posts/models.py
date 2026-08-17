from django.db import models
from django.contrib.auth.models import User
from groups.models import StudyGroup
from chats.models import ChatMessage   # allow reactions on chat messages too


class Post(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name="posts")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.TextField()
    pinned = models.BooleanField(default=False)   # NEW FIELD
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-pinned', '-created_at']  # pinned first, then newest

    def __str__(self):
        return f"{self.author.username} in {self.group.name}: {self.content[:30]}"


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']  # oldest first in threads

    def __str__(self):
        return f"Comment by {self.author.username} on Post {self.post.id}"


class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")

    class Meta:
        unique_together = ('post', 'user')

    def __str__(self):
        return f"Like by {self.user.username} on Post {self.post.id}"


class Reaction(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True, related_name="reactions")
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, null=True, blank=True, related_name="reactions")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reactions")
    emoji = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [
            ("user", "post", "emoji"),
            ("user", "message", "emoji"),
        ]

    def __str__(self):
        target = f"Post {self.post.id}" if self.post else f"Message {self.message.id}"
        return f"{self.user.username} reacted {self.emoji} on {target}"
