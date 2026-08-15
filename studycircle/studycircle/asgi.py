import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chats.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'studycircle.settings')
django.setup()

# Standard Django ASGI app for HTTP requests
django_asgi_app = get_asgi_application()

# Channels router for WebSocket + HTTP
application = ProtocolTypeRouter({
    "http": django_asgi_app,   # REST API, admin, etc.
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chats.routing.websocket_urlpatterns
        )
    ),
})
