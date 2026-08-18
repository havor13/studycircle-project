import React, { useState } from 'react';
import '../styles.css';

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

  const renderThreadButton = (thread, label) => (
    <button
      key={thread.id}
      type="button"
      className={activeThread?.id === thread.id ? 'active-tab' : ''}
      onClick={() => setActiveThread(thread)}
    >
      <span>{label}</span>
      {/* Show unread badge if unread_count exists */}
      {thread.unread_count > 0 && (
        <span className="unread-badge">{thread.unread_count}</span>
      )}
    </button>
  );

  return (
    <div className="chat-sidebar">
      {/* Threads Section */}
      <h3 onClick={() => setShowThreads(!showThreads)}>
        {showThreads ? '▼' : '▶'} Threads
      </h3>
      {showThreads && threads.map(thread => {
        const participants = Array.isArray(thread.participants)
          ? thread.participants.map(p => p.username).join(', ')
          : `Thread #${thread.id}`;
        return renderThreadButton(thread, participants || 'Discussion');
      })}

      {/* Start private chat */}
      <div className="start-private-chat">
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Select user...</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.username || user.name}
            </option>
          ))}
        </select>
        <button onClick={handleStartPrivateChat}>Start Private Chat</button>
      </div>
    </div>
  );
}

export default Sidebar;
