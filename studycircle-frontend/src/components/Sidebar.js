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
  const [showGeneral, setShowGeneral] = useState(true);
  const [showPrivate, setShowPrivate] = useState(true);

  const generalThreads = threads.filter(t => t.chat_type === 'general');
  const privateThreads = threads.filter(t => t.chat_type === 'private');

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
      {/* General Chats */}
      <h3 onClick={() => setShowGeneral(!showGeneral)}>
        {showGeneral ? '▼' : '▶'} General Chat
      </h3>
      {showGeneral && generalThreads.map(thread =>
        renderThreadButton(thread, 'General Discussion')
      )}

      {/* Private Chats */}
      <h3 onClick={() => setShowPrivate(!showPrivate)}>
        {showPrivate ? '▼' : '▶'} Private Chats
      </h3>
      {showPrivate && privateThreads.map(thread => {
        const participants = Array.isArray(thread.participants)
          ? thread.participants.map(p => p.username || p.name).join(', ')
          : `Private Chat #${thread.id}`;
        return renderThreadButton(thread, participants);
      })}

      {/* Start private chat */}
      {showPrivate && (
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
      )}
    </div>
  );
}

export default Sidebar;
