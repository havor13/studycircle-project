# chats/admin.py
from django.contrib import admin
from .models import UserProfile, ChatThread, ChatParticipant, ChatMessage, ChatMessageRead

# Inline participants inside a thread
class ChatParticipantInline(admin.TabularInline):
    model = ChatParticipant
    extra = 0

# Inline messages inside a thread
class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "photo_url")
    search_fields = ("user__username",)

@admin.register(ChatThread)
class ChatThreadAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at")
    inlines = [ChatParticipantInline, ChatMessageInline]

@admin.register(ChatParticipant)
class ChatParticipantAdmin(admin.ModelAdmin):
    list_display = ("id", "thread", "user")
    search_fields = ("user__username",)

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "thread", "sender", "content", "created_at")
    search_fields = ("sender__username", "content")
    list_filter = ("thread", "sender")

@admin.register(ChatMessageRead)
class ChatMessageReadAdmin(admin.ModelAdmin):
    list_display = ("id", "message", "user", "read_at")
    search_fields = ("user__username", "message__id")
