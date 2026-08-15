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

  return (
    <div className="post-feed">
      {loading && <p className="loading">⏳ Loading posts...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <ul className="post-list">
          {posts.length > 0 ? (
            posts.map(post => (
              <li key={post.id} className="post-card">
                <h4 className="post-title">{post.title}</h4>
                <p>{post.content}</p>
                {post.author && <small className="post-author">✍️ {post.author}</small>}
                {post.timestamp && (
                  <small className="post-time">
                    🕒 {new Date(post.timestamp).toLocaleString()}
                  </small>
                )}

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
