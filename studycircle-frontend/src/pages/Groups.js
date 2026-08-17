import React, { useEffect, useState } from 'react';
import api from '../api/api';
import '../styles.css';
import { useNavigate } from 'react-router-dom'; // ✅ for navigation to events

function Groups() {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', subject: '' });
  const [filter, setFilter] = useState('all'); // ✅ filter state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('groups/');   // ✅ fixed path
        setGroups(res.data);
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
    };
    fetchGroups();
  }, []);

  const filteredGroups = groups
    .filter(group => group.name.toLowerCase().includes(search.toLowerCase()))
    .filter(group => filter === 'all' ? true : group.is_member);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('groups/', newGroup);   // ✅ fixed path
      setGroups([...groups, res.data]);
      setShowModal(false);
      setNewGroup({ name: '', description: '', subject: '' });
      alert('✅ Group created successfully!');
    } catch (err) {
      console.error('Error creating group:', err);
      alert('❌ Failed to create group.');
    }
  };

  const handleJoinLeave = async (groupId, isMember) => {
    try {
      if (isMember) {
        await api.delete(`group-members/${groupId}/leave/`);   // ✅ fixed path
        setGroups(groups.map(g =>
          g.id === groupId ? { ...g, is_member: false, members_count: g.members_count - 1 } : g
        ));
      } else {
        await api.post(`group-members/${groupId}/join/`);      // ✅ fixed path
        setGroups(groups.map(g =>
          g.id === groupId ? { ...g, is_member: true, members_count: g.members_count + 1 } : g
        ));
      }
    } catch (err) {
      console.error('Error joining/leaving group:', err);
      alert('❌ Action failed.');
    }
  };

  const handleViewEvents = (groupId) => {
    // Navigate to group events page
    navigate(`/groups/${groupId}/events`);
  };

  return (
    <div className="groups-container">
      <h2>👥 Study Groups</h2>

      {/* Filter Tabs */}
      <div className="group-filters">
        <button
          className={filter === 'all' ? 'active-filter' : ''}
          onClick={() => setFilter('all')}
        >
          All Groups
        </button>
        <button
          className={filter === 'my' ? 'active-filter' : ''}
          onClick={() => setFilter('my')}
        >
          My Groups
        </button>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search groups..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="group-search"
      />

      {/* Empty state */}
      {filteredGroups.length === 0 ? (
        <div className="group-empty">
          <img src="/images/empty-groups.PNG" alt="No groups" />
          <p>{filter === 'my' ? 'You haven’t joined any groups yet.' : 'No groups available.'}</p>
          {filter === 'all' && (
            <button className="create-group-btn" onClick={() => setShowModal(true)}>
              ➕ Create Group
            </button>
          )}
        </div>
      ) : (
        <div className="group-list">
          {filteredGroups.map(group => (
            <div key={group.id} className="group-card">
              <h3>{group.name}</h3>
              <p>{group.description}</p>
              <p><strong>Subject:</strong> {group.subject}</p>
              <p><strong>Members:</strong> {group.members_count}</p>
              <div className="group-actions">
                <button
                  className={group.is_member ? 'leave-btn' : 'join-btn'}
                  onClick={() => handleJoinLeave(group.id, group.is_member)}
                >
                  {group.is_member ? 'Leave Group' : 'Join Group'}
                </button>
                <button
                  className="events-btn"
                  onClick={() => handleViewEvents(group.id)}
                >
                  View Events
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create New Group</h3>
            <form onSubmit={handleCreateGroup} className="modal-form">
              <input
                type="text"
                placeholder="Group Name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Subject (e.g. WDD130, CSE499)"
                value={newGroup.subject}
                onChange={(e) => setNewGroup({ ...newGroup, subject: e.target.value })}
              />
              <div className="modal-actions">
                <button type="submit" className="create-group-btn">Create</button>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Groups;