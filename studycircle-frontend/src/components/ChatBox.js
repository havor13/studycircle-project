import React, { useState, useEffect, useRef } from 'react';
import '../styles.css';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

function ChatBox({ messages, onSend }) {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [modalImage, setModalImage] = useState(null); // ✅ new state
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    onSend(newMessage);
    setNewMessage('');
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji.native);
  };

  const handleAttachment = async (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('http://localhost:8000/api/upload/', {
          method: 'POST',
          body: formData,
        });
        const result = await res.json();
        onSend({ type: fileType, content: result.fileUrl, name: file.name });
      } catch (err) {
        console.error('File upload failed:', err);
      }
    }
  };

  return (
    <div className="chat-container">
      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <img src="images/empty-chat.png" alt="No messages" />
            <p>No messages yet. Start chatting!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.sender === 'Me' ? 'sent' : 'received'}`}
            >
              {msg.type === 'photo' ? (
                <img
                  src={msg.content}
                  alt={msg.name || 'Photo'}
                  className="chat-photo"
                  onClick={() => setModalImage(msg.content)} // ✅ open modal
                />
              ) : msg.type === 'document' || msg.type === 'file' ? (
                <a href={msg.content} target="_blank" rel="noopener noreferrer">
                  📎 {msg.name || 'Attachment'}
                </a>
              ) : (
                <p>{msg.content}</p>
              )}
              <span className="timestamp">
                {msg.sender} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <form className="chat-input" onSubmit={handleSend}>
        <div className="chat-input-row">
          {/* Attachment dropdown */}
          <div className="attachment-menu">
            <button
              type="button"
              className="attach-btn"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              title="Attach"
            >
              📎
            </button>
            {showAttachmentMenu && (
              <div className="attachment-options">
                <label>
                  📷
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleAttachment(e, 'photo')}
                  />
                </label>
                <label>
                  📄
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => handleAttachment(e, 'document')}
                  />
                </label>
                <label>
                  📁
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleAttachment(e, 'file')}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Emoji button */}
          <button
            type="button"
            className="emoji-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Add emoji"
          >
            😀
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker">
              <Picker data={data} onEmojiSelect={addEmoji} />
            </div>
          )}

          {/* Message input */}
          <textarea
            id="message"
            name="message"
            rows="1"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Send button */}
          <button type="submit" className="send-btn" title="Send message">
            ➤
          </button>
        </div>
      </form>

      {/* ✅ Modal for full-size photo */}
      {modalImage && (
        <div className="modal-overlay" onClick={() => setModalImage(null)}>
          <div className="modal-content">
            <img src={modalImage} alt="Full size" className="modal-photo" />
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBox;
