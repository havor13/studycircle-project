import React, { useState } from 'react';
import '../chats.css';

function Sidebar({
  threads,
  activeThread,
  setActiveThread,
  users,
  selectedUser,
  setSelectedUser,
  handleStartPrivateChat
}) {
  const [showThreads, setShowThreads] = useState(true);

  const renderThreadButton = (thread) => {
    const label = thread.is_group
      ? thread.name || `Group #${thread.id}`
      : Array.isArray(thread.participants)
        ? thread.participants.map(p => p.username).join(', ')
        : `Thread #${thread.id}`;

    return (
      <button
        key={thread.id}
        type="button"
        className={`thread-btn ${activeThread?.id === thread.id ? 'active-tab' : ''}`}
        onClick={() => setActiveThread(thread)}
      >
        <span className="thread-label">{label}</span>
        {thread.unread_count > 0 && (
          <span className="unread-badge">{thread.unread_count}</span>
        )}
      </button>
    );
  };

  return (
    <div className="chat-sidebar">
      {/* Threads Section */}
      <h3
        className="sidebar-header"
        onClick={() => setShowThreads(!showThreads)}
      >
        {showThreads ? '▼' : '▶'} Threads
      </h3>
      {showThreads && (
        <div className="thread-list">
          {threads.length === 0 ? (
            <p className="empty-threads">No threads yet</p>
          ) : (
            threads.map(renderThreadButton)
          )}
        </div>
      )}

      {/* Start private chat */}
      <div className="start-private-chat">
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">➕ Start private chat...</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.username || user.name}
            </option>
          ))}
        </select>
        <button onClick={handleStartPrivateChat}>Start</button>
      </div>
    </div>
  );
}

export default Sidebar;
