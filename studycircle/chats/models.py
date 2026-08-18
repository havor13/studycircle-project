from django.db import models
from django.contrib.auth.models import User

class ChatThread(models.Model):
    THREAD_TYPES = (
        ('general', 'General'),
        ('private', 'Private'),
    )
    participants = models.ManyToManyField(User, related_name="chat_threads")
    chat_type = models.CharField(max_length=10, choices=THREAD_TYPES, default='general')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.chat_type.title()} Thread {self.id}"

    @classmethod
    def get_or_create_private(cls, user1, user2):
        """
        Find existing private thread between two users or create one.
        """
        thread = cls.objects.filter(
            chat_type='private',
            participants=user1
        ).filter(participants=user2).first()
        if not thread:
            thread = cls.objects.create(chat_type='private')
            thread.participants.add(user1, user2)
        return thread


class ChatMessage(models.Model):
    thread = models.ForeignKey(
        ChatThread,
        on_delete=models.CASCADE,
        related_name="messages"
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )
    content = models.TextField()

    # ✅ New fields for attachments
    type = models.CharField(
        max_length=20,
        default='text',
        help_text="Message type: text, photo, document, file"
    )
    name = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Original filename for attachments"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username}: {self.content[:30]} ({self.type})"
