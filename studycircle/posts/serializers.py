from rest_framework import serializers
from .models import Post, Comment, Like, Reaction


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at']


class LikeSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Like
        fields = ['id', 'post', 'user']


class ReactionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Reaction
        fields = ['id', 'emoji', 'user', 'post', 'message', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    likes = LikeSerializer(many=True, read_only=True)
    reactions = ReactionSerializer(many=True, read_only=True)   # NEW FIELD

    class Meta:
        model = Post
        fields = [
            'id',
            'group',
            'author',
            'content',
            'pinned',        # NEW FIELD
            'created_at',
            'comments',
            'likes',
            'reactions'
        ]
