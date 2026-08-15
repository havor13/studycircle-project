import React, { useState } from 'react';
import '../styles.css';

function ChatBox({ messages, onSend }) {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = (e) => {
    e.preventDefault(); // prevent page reload
    if (newMessage.trim() === '') return;
    onSend(newMessage);
    setNewMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // stop newline
      handleSend(e);
    }
  };

  return (
    <div className="chat-container">
      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <img src="/empty-chat.png" alt="No messages" />
            <p>No messages yet. Start chatting!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.sender === 'Me' ? 'sent' : 'received'}`}
            >
              <p>{msg.text || msg.content}</p>
              <span className="timestamp">
                {msg.sender} • {msg.time || new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Message form */}
      <form className="chat-input" onSubmit={handleSend}>
        <textarea
          rows="1"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" className="send-btn" title="Send message">
          ✈️
        </button>
      </form>
    </div>
  );
}

export default ChatBox;
