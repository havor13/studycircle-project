from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth.models import User
from chats.models import ChatMessage, ChatThread
from .models import SearchQuery
from .serializers import UserSerializer, ThreadSerializer, MessageSerializer

@api_view(['GET'])
def search(request):
    query = request.GET.get('q', '')
    results = {}

    if query:
        # Log search
        sq = SearchQuery.objects.create(
            user=request.user if request.user.is_authenticated else None,
            query=query
        )

        # Search users
        users = User.objects.filter(
            Q(username__icontains=query) | Q(email__icontains=query)
        )
        results['users'] = UserSerializer(users, many=True).data

        # Search threads (handle both direct User and Profile relations)
        try:
            threads = ChatThread.objects.filter(
                participants__username__icontains=query
            ).distinct()
        except Exception:
            threads = ChatThread.objects.filter(
                participants__user__username__icontains=query
            ).distinct()
        results['threads'] = ThreadSerializer(threads, many=True).data

        # Search messages
        messages = ChatMessage.objects.filter(
            Q(content__icontains=query)
        )
        results['messages'] = MessageSerializer(messages, many=True).data

        # Update result count
        sq.result_count = sum(len(v) for v in results.values())
        sq.save()

    return Response(results)


@api_view(['GET'])
def recommendations(request):
    user = request.user
    if not user.is_authenticated:
        return Response({"error": "Login required"}, status=403)

    # Simple example: recommend based on last search
    last_query = SearchQuery.objects.filter(user=user).order_by('-created_at').first()
    if not last_query:
        return Response({"recommendations": []})

    query = last_query.query
    recs = []

    # Recommend users with similar names
    similar_users = User.objects.filter(username__icontains=query).exclude(id=user.id)[:5]
    for u in similar_users:
        recs.append({"title": u.username, "type": "user", "score": 0.8})

    # Recommend threads with matching participants
    try:
        threads = ChatThread.objects.filter(
            participants__username__icontains=query
        ).distinct()[:5]
    except Exception:
        threads = ChatThread.objects.filter(
            participants__user__username__icontains=query
        ).distinct()[:5]

    for t in threads:
        recs.append({"title": f"Thread {t.id}", "type": "group", "score": 0.7})

    # Recommend messages containing query
    msgs = ChatMessage.objects.filter(content__icontains=query)[:5]
    for m in msgs:
        recs.append({"title": m.content[:50], "type": "post", "score": 0.6})

    return Response({"recommendations": recs})
