from django.db import models

# ✅ Users table (extra fields beyond Django auth)
class UserProfile(models.Model):
    user = models.OneToOneField("auth.User", on_delete=models.CASCADE)
    photo_url = models.TextField(null=True, blank=True)
    study_interests = models.JSONField(null=True, blank=True)  # maps to TEXT[] in SQL

    def __str__(self):
        return self.user.username


# ✅ Chat Threads
class ChatThread(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Thread {self.id}"


# ✅ Chat Participants
class ChatParticipant(models.Model):
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name="participants")
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)

    class Meta:
        unique_together = ("thread", "user")

    def __str__(self):
        return f"{self.user.username} in Thread {self.thread.id}"


# ✅ Chat Messages
class ChatMessage(models.Model):
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey("auth.User", on_delete=models.CASCADE, related_name="sent_messages")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username}: {self.content[:30]}"


# ✅ Read Receipts
class ChatMessageRead(models.Model):
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name="reads")
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("message", "user")

    def __str__(self):
        return f"{self.user.username} read {self.message.id}"
