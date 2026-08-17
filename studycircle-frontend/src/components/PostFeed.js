import React, { useEffect, useState } from 'react';
import api from '../api/api';
import '../styles.css';

function PostFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch posts from backend
  const fetchPosts = () => {
    setLoading(true);
    api.get('posts/')
      .then(res => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle delete post
  const handleDelete = async (id) => {
    try {
      await api.delete(`posts/${id}/`);
      setPosts(posts.filter(post => post.id !== id));
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('❌ Failed to delete post.');
    }
  };

  // Handle pin/unpin post
  const handlePin = async (id, pinned) => {
    try {
      const res = await api.patch(`posts/${id}/pin/`, { pinned: !pinned });
      setPosts(posts.map(post => post.id === id ? res.data : post));
    } catch (err) {
      console.error('Error pinning post:', err);
      setError('❌ Failed to pin/unpin post.');
    }
  };

  // Handle reaction
  const handleReaction = async (postId, emoji) => {
    try {
      const res = await api.post('reactions/', { post: postId, emoji });
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, reactions: [...post.reactions, res.data] }
          : post
      ));
    } catch (err) {
      console.error('Error reacting to post:', err);
      setError('❌ Failed to react.');
    }
  };

  return (
    <div className="post-feed">
      {loading && <p className="loading">⏳ Loading posts...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <ul className="post-list">
          {posts.length > 0 ? (
            posts.map(post => (
              <li key={post.id} className="post-card">
                <h4 className="post-title">
                  {post.content.slice(0, 30)}...
                  {post.pinned && <span className="pinned">📌</span>}
                </h4>
                <p>{post.content}</p>
                {post.author && <small className="post-author">✍️ {post.author}</small>}
                {post.created_at && (
                  <small className="post-time">
                    🕒 {new Date(post.created_at).toLocaleString()}
                  </small>
                )}

                {/* Reaction buttons */}
                <div className="reaction-bar">
                  {['👍', '❤️', '😂', '😮'].map(emoji => (
                    <button
                      key={emoji}
                      className="reaction-btn"
                      onClick={() => handleReaction(post.id, emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Show reactions */}
                <div className="reaction-list">
                  {post.reactions && post.reactions.length > 0 ? (
                    post.reactions.map(r => (
                      <span key={r.id} className="reaction-item">
                        {r.emoji} {r.user}
                      </span>
                    ))
                  ) : (
                    <small>No reactions yet</small>
                  )}
                </div>

                {/* Pin button (admin only) */}
                <button
                  className="pin-btn"
                  onClick={() => handlePin(post.id, post.pinned)}
                >
                  {post.pinned ? 'Unpin' : 'Pin'}
                </button>

                {/* Delete button */}
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(post.id)}
                >
                  🗑️ Delete
                </button>
              </li>
            ))
          ) : (
            <p>No posts available.</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default PostFeed;
