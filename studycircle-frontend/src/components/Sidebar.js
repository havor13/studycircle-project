import React, { useState } from 'react';
import '../chats.css';

function Sidebar({
  conversations,
  activeConversation,
  setActiveConversation,
  users,
  selectedUser,
  setSelectedUser,
  handleStartPrivateChat
}) {
  const [showConversations, setShowConversations] = useState(true);

  const renderConversationButton = (conv) => {
    const label = Array.isArray(conv.participants)
      ? conv.participants.map(p => p.username).join(', ')
      : `Conversation #${conv.id}`;

    return (
      <button
        key={conv.id}
        type="button"
        className={`conversation-btn ${activeConversation?.id === conv.id ? 'active-tab' : ''}`}
        onClick={() => setActiveConversation(conv)}
      >
        <span className="conversation-label">{label}</span>
        {conv.unread_count > 0 && (
          <span className="unread-badge">{conv.unread_count}</span>
        )}
      </button>
    );
  };

  return (
    <div className="chat-sidebar">
      {/* Conversations Section */}
      <h3
        className="sidebar-header"
        onClick={() => setShowConversations(!showConversations)}
      >
        {showConversations ? '▼' : '▶'} Conversations
      </h3>
      {showConversations && (
        <div className="conversation-list">
          {conversations.length === 0 ? (
            <p className="empty-conversations">No conversations yet</p>
          ) : (
            conversations.map(renderConversationButton)
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
