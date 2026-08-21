import React, { useState, useEffect } from 'react';
import { searchApi, recommendationsApi } from '../api/api'; // ✅ use helpers

function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debounced live search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      } else {
        setResults(null);
      }
    }, 300); // wait 300ms after typing stops

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSearch = async (q) => {
    setLoading(true);
    setError('');
    try {
      const res = await searchApi(q);
      setResults(res);

      // ✅ also fetch recommendations
      const recRes = await recommendationsApi();
      setRecommendations(recRes.recommendations || []);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Live search failed:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="global-search">
      <input
        type="text"
        placeholder="Search users, groups, posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p className="search-status">⏳ Searching...</p>}
      {error && <p className="search-error">{error}</p>}

      {results && (
        <div className="search-results">
          <h4>Users</h4>
          {results.users.length > 0 ? (
            results.users.map(u => <p key={u.id}>👤 {u.username}</p>)
          ) : (
            <p>No users found</p>
          )}

          <h4>Threads</h4>
          {results.threads.length > 0 ? (
            results.threads.map(t => <p key={t.id}>💬 Thread {t.id}</p>)
          ) : (
            <p>No threads found</p>
          )}

          <h4>Messages</h4>
          {results.messages.length > 0 ? (
            results.messages.map(m => (
              <p key={m.id}>📝 {m.sender_username}: {m.content}</p>
            ))
          ) : (
            <p>No messages found</p>
          )}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="recommendations">
          <h4>Recommended for you</h4>
          {recommendations.map((rec, idx) => (
            <p key={idx}>⭐ {rec}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
