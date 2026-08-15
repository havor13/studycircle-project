from django.db import models
from django.contrib.auth.models import User
from groups.models import StudyGroup

class Post(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name="posts")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # newest first

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
