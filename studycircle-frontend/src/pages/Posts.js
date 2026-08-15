import React, { useState, useEffect } from 'react';
import PostFeed from '../components/PostFeed';
import api from '../api/api';
import '../styles.css';

function Posts() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [group, setGroup] = useState('');
  const [groups, setGroups] = useState([]); // ✅ store available groups
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ Fetch groups for dropdown
  useEffect(() => {
    api.get('groups/')
      .then(res => setGroups(res.data))
      .catch(err => {
        console.error('Error fetching groups:', err);
        setError('❌ Failed to load groups.');
      });
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('posts/', { group, title, content });
      setSuccess('✅ Post created successfully!');
      setTitle('');
      setContent('');
      setGroup('');
    } catch (err) {
      console.error('Post creation error:', err);
      if (err.response && err.response.data) {
        setError(`❌ ${JSON.stringify(err.response.data)}`);
      } else {
        setError('❌ Failed to create post. Please check your input.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main posts-page">
      <header className="posts-header">
        <h2>📝 Posts</h2>
        <p className="posts-subtitle">Share your thoughts and see what others are saying</p>
      </header>

      {/* Create Post Form */}
      <form onSubmit={handleCreatePost} className="create-post-form">
        <input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Write your post..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        {/* ✅ Group dropdown */}
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          required
        >
          <option value="">Select a group</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Posting...' : 'Create Post'}
        </button>
      </form>

      {error && <p style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {/* Post feed */}
      <PostFeed />
    </div>
  );
}

export default Posts;
