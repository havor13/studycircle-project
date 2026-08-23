from django.db import models
from django.contrib.auth.models import User

# ✅ Users table (extra fields beyond Django auth)
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
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
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("thread", "user")

    def __str__(self):
        return f"{self.user.username} in Thread {self.thread.id}"


# ✅ Chat Messages (supports text + file attachments)
class ChatMessage(models.Model):
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    content = models.TextField(blank=True)  # text is optional if file is attached
    attachment = models.FileField(
        upload_to="chat_attachments/",  # ✅ stored under MEDIA_ROOT/chat_attachments/
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.attachment:
            return f"{self.sender.username} sent file: {self.attachment.name}"
        return f"{self.sender.username}: {self.content[:30]}"

    # ✅ Helper property to always return full download URL
    @property
    def attachment_url(self):
        if self.attachment and hasattr(self.attachment, "url"):
            return self.attachment.url  # resolves to /media/chat_attachments/<filename>
        return None


# ✅ Read Receipts
class ChatMessageRead(models.Model):
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name="reads")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("message", "user")

    def __str__(self):
        return f"{self.user.username} read {self.message.id}"


# ✅ Message Reactions (new feature)
class ChatMessageReaction(models.Model):
    message = models.ForeignKey(
        ChatMessage,
        on_delete=models.CASCADE,
        related_name="chat_reactions"   # 👈 unique related_name to avoid clash
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    emoji = models.CharField(max_length=10)  # store emoji string like 👍 ❤️ 😂
    reacted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("message", "user", "emoji")  # prevent duplicate same reaction by same user

    def __str__(self):
        return f"{self.user.username} reacted {self.emoji} to Message {self.message.id}"