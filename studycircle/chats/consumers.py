import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """
        Connect user to either the general room or a private thread room.
        Expect URL route kwargs: thread_id (optional).
        """
        self.thread_id = self.scope['url_route']['kwargs'].get('thread_id', None)

        if self.thread_id:
            # Private chat group based on thread ID
            self.room_group_name = f"chat_{self.thread_id}"
        else:
            # General chat group
            self.room_group_name = "general_room"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        """Remove user from the group when they disconnect."""
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """
        Receive message from WebSocket and broadcast to group.
        Expected payload: { "message": "...", "sender": "...", "thread": <id or null> }
        """
        data = json.loads(text_data)
        message = data.get("message")
        sender = data.get("sender")
        thread = data.get("thread", self.thread_id)

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
