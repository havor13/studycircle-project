import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from django.contrib.auth.models import User
from jwt import decode as jwt_decode, InvalidTokenError
from django.db import close_old_connections
from django.utils import timezone
from chats.models import ChatMessage, ChatThread, ChatMessageReaction
from chats.serializers import ChatMessageReactionSerializer  # ✅ import serializer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # ✅ Authenticate via JWT
        query_string = self.scope["query_string"].decode()
        token = None
        if "token=" in query_string:
            token = query_string.split("token=")[-1]

        if not token:
            await self.close()
            return

        try:
            decoded = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = decoded.get("user_id")
            if not user_id:
                await self.close()
                return

            self.scope["user"] = await User.objects.aget(pk=user_id)
            close_old_connections()
        except InvalidTokenError:
            await self.close()
            return

        # ✅ Room selection
        self.thread_id = self.scope['url_route']['kwargs'].get('thread_id', None)
        if self.thread_id:
            self.room_group_name = f"chat_{self.thread_id}"
        else:
            self.room_group_name = "general_room"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        sender = self.scope["user"]

        # 🔹 Handle reactions
        if data.get("type") == "reaction":
            message_id = data.get("message_id")
            emoji = data.get("emoji")

            try:
                message = await ChatMessage.objects.aget(pk=message_id)
            except ChatMessage.DoesNotExist:
                return

            reaction, created = await ChatMessageReaction.objects.aget_or_create(
                message=message,
                user=sender,
                emoji=emoji
            )

            serializer = ChatMessageReactionSerializer(reaction)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_reaction",
                    "reaction": serializer.data
                }
            )
            return

        # 🔹 Handle normal messages
        content = data.get("message")
        thread_id = data.get("thread", self.thread_id)

        thread = None
        if thread_id:
            try:
                thread = await ChatThread.objects.aget(pk=thread_id)
            except ChatThread.DoesNotExist:
                thread = None

        msg_obj = None
        if thread:
            msg_obj = await ChatMessage.objects.acreate(
                thread=thread,
                sender=sender,
                content=content
            )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "id": msg_obj.id if msg_obj else None,
                "sender": sender.id,
                "sender_username": sender.username,
                "content": content,
                "thread": thread_id,
                "created_at": timezone.now().isoformat(),
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "id": event.get("id"),
            "sender": event.get("sender"),
            "sender_username": event.get("sender_username"),
            "content": event.get("content"),
            "thread": event.get("thread"),
            "created_at": event.get("created_at"),
        }))

    async def chat_reaction(self, event):
        await self.send(text_data=json.dumps({
            "type": "reaction",
            "reaction": event.get("reaction")
        }))
