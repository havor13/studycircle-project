from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Post, Comment, Like
from .serializers import PostSerializer, CommentSerializer, LikeSerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # ✅ Ensure group is provided
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
