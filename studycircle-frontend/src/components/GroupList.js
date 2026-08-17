import React, { useEffect, useState } from 'react';
import api from '../api/api'; // ✅ Correct path to API setup
import '../styles.css'; // ✅ Global stylesheet import
import { useNavigate } from 'react-router-dom'; // ✅ For navigation to events page

function GroupList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = () => {
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
  };

  const handleDeleteGroup = async (groupId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this group? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`groups/${groupId}/`);
      setGroups(groups.filter(group => group.id !== groupId));
    } catch (err) {
      console.error('Error deleting group:', err);
      setError('Failed to delete group. Please try again later.');
    }
  };

  const handleViewEvents = (groupId) => {
    // Navigate to group events page
    navigate(`/groups/${groupId}/events`);
  };

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
                <div className="group-actions">
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="events-btn"
                    onClick={() => handleViewEvents(group.id)}
                  >
                    View Events
                  </button>
                </div>
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
