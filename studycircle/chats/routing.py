from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # General chat room (shared by all users)
    re_path(r'^ws/chats/$', consumers.ChatConsumer.as_asgi()),

    # Conversation-based chat (connect with conversation_id in URL)
    re_path(r'^ws/chats/(?P<conversation_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
]
