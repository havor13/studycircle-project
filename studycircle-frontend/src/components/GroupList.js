import React, { useEffect, useState } from 'react';
import api from '../api/api'; // ✅ Correct path to API setup
import '../styles.css'; // ✅ Global stylesheet import

function GroupList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('groups/')
      .then(res => {
        setGroups(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching groups:', err);
        setError('Failed to load groups. Please try again later.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="main">
      <h2>👥 Study Groups</h2>

      {loading && <p>Loading groups...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <ul className="group-list">
          {groups.length > 0 ? (
            groups.map(group => (
              <li key={group.id} className="group-card">
                <h3>{group.name}</h3>
                {group.description && <p>{group.description}</p>}
              </li>
            ))
          ) : (
            <p>No groups available.</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default GroupList;
