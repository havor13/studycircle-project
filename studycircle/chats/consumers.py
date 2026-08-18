import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from django.contrib.auth.models import User
from jwt import decode as jwt_decode, InvalidTokenError
from django.db import close_old_connections

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """
        Connect user to either the general room or a private thread room.
        Validate JWT token from query string (?token=...).
        """
        # Extract token from query string
        query_string = self.scope["query_string"].decode()
        token = None
        if "token=" in query_string:
            token = query_string.split("token=")[-1]

        if not token:
            await self.close()
            return

        try:
            # Decode JWT
            decoded = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = decoded.get("user_id")

            if not user_id:
                await self.close()
                return

            # Attach authenticated user to scope
            self.scope["user"] = await User.objects.aget(pk=user_id)
            close_old_connections()

        except InvalidTokenError:
            await self.close()
            return

        # Room selection
        self.thread_id = self.scope['url_route']['kwargs'].get('thread_id', None)
        if self.thread_id:
            self.room_group_name = f"chat_{self.thread_id}"
        else:
            self.room_group_name = "general_room"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        """Remove user from the group when they disconnect."""
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """
        Receive message from WebSocket and broadcast to group.
        Expected payload: { "message": "...", "thread": <id or null> }
        Sender is always taken from authenticated scope["user"].
        """
        data = json.loads(text_data)
        message = data.get("message")
        thread = data.get("thread", self.thread_id)

        sender = self.scope["user"].username if self.scope["user"].is_authenticated else "Anonymous"

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "sender": sender,
                "thread": thread,
            }
        )

    async def chat_message(self, event):
        """Send message back to WebSocket client."""
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "sender": event["sender"],
            "thread": event["thread"],
        }))
