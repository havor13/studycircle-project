import React, { useState, useEffect, useRef } from 'react';
import '../chats.css';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import api from '../api/api'; // ✅ import API helper

function ChatBox({ threadId, onSend, messages }) {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send message via parent handler
  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSend({ content: newMessage });   // delegate to Chats.js
    setNewMessage('');
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  // ✅ Upload file properly
  const uploadFile = (file) => {
    onSend({ file });  // Chats.js will handle file upload and append attachment_url
  };

  const handleCamera = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = e => uploadFile(e.target.files[0]);
    input.click();
  };

  const handleGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => uploadFile(e.target.files[0]);
    input.click();
  };

  const handleDocument = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt';
    input.onchange = e => uploadFile(e.target.files[0]);
    input.click();
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        setNewMessage(`📍 Location: ${latitude}, ${longitude}`);
      });
    }
  };

  // ✅ Render attachments
  const renderAttachment = (msg) => {
    if (!msg.attachment_url) return null;
    const isImage = msg.attachment_url.match(/\.(jpeg|jpg|png|gif|webp)$/i);
    return isImage ? (
      <img src={msg.attachment_url} alt="attachment" className="chat-image" />
    ) : (
      <a
        href={msg.attachment_url}
        target="_blank"
        rel="noopener noreferrer"
        className="chat-file"
      >
        📎 Download {msg.content || "Attachment"}
      </a>
    );
  };

  // ✅ React to a message
  const handleReact = async (messageId, emoji) => {
    try {
      await api.post(`messages/${messageId}/react/`, { emoji });
      // Optionally: refresh or update local state here
    } catch (err) {
      console.error("Failed to react:", err.response?.data || err.message);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages && messages.length === 0 ? (
          <p className="chat-empty">No messages yet. Start chatting!</p>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id || Math.random()}
              className={`chat-message ${
                msg.sender_username === localStorage.getItem('username')
                  ? 'sent'
                  : 'received'
              }`}
            >
              <p>
                <strong>{msg.sender_username || "Unknown"}:</strong>{" "}
                {msg.content}
              </p>
              {renderAttachment(msg)}
              {msg.created_at && (
                <span className="timestamp">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}

              {/* 🔹 Reactions display */}
              {msg.chat_reactions && msg.chat_reactions.length > 0 && (
                <div className="reactions">
                  {msg.chat_reactions.map(r => (
                    <span key={r.id}>{r.emoji} ({r.user_username})</span>
                  ))}
                </div>
              )}

              {/* 🔹 Reaction buttons */}
              <div className="reaction-buttons">
                <button onClick={() => handleReact(msg.id, "👍")}>👍</button>
                <button onClick={() => handleReact(msg.id, "❤️")}>❤️</button>
                <button onClick={() => handleReact(msg.id, "😂")}>😂</button>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <div className="chat-input-row">
          <button
            type="button"
            className="emoji-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😀
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker">
              <Picker data={data} onEmojiSelect={handleEmojiSelect} />
            </div>
          )}

          <button
            type="button"
            className="attach-btn"
            onClick={() => setShowAttachments(!showAttachments)}
          >
            📎
          </button>
          {showAttachments && (
            <div className="attachments-menu">
              <button type="button" onClick={handleCamera}>📷 Camera</button>
              <button type="button" onClick={handleGallery}>🖼️ Gallery</button>
              <button type="button" onClick={handleDocument}>📄 Document</button>
              <button type="button" onClick={handleLocation}>📍 Location</button>
            </div>
          )}

          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />

          <button type="submit" className="send-btn">➤</button>
        </div>
      </form>
    </div>
  );
}

export default ChatBox;