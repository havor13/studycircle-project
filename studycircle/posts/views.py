from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from .models import Post, Comment, Like, Reaction
from .serializers import PostSerializer, CommentSerializer, LikeSerializer, ReactionSerializer


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-pinned', '-created_at')  # pinned first
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.data.get("group"):
            return Response(
                {"error": "Group field is required when creating a post."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer.save(author=self.request.user)

    def destroy(self, request, *args, **kwargs):
        post = self.get_object()
        if post.author != request.user:
            raise PermissionDenied("❌ You can only delete your own posts.")
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["patch"], url_path="pin")
    def pin_post(self, request, pk=None):
        post = self.get_object()
        pinned = request.data.get("pinned", True)
        post.pinned = pinned
        post.save()
        return Response(PostSerializer(post).data)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('created_at')
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.data.get("post"):
            return Response(
                {"error": "Post field is required when creating a comment."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer.save(author=self.request.user)

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.author != request.user:
            raise PermissionDenied("❌ You can only delete your own comments.")
        return super().destroy(request, *args, **kwargs)


class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.data.get("post"):
            return Response(
                {"error": "Post field is required when liking a post."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        like = self.get_object()
        if like.user != request.user:
            raise PermissionDenied("❌ You can only remove your own likes.")
        return super().destroy(request, *args, **kwargs)


class ReactionViewSet(viewsets.ModelViewSet):
    queryset = Reaction.objects.all()
    serializer_class = ReactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if not (self.request.data.get("post") or self.request.data.get("message")):
            return Response(
                {"error": "Either 'post' or 'message' field is required when creating a reaction."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        reaction = self.get_object()
        if reaction.user != request.user:
            raise PermissionDenied("❌ You can only remove your own reactions.")
        return super().destroy(request, *args, **kwargs)
