import React, { useState } from 'react';
import '../styles.css';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

function ChatBox({ messages, onSend }) {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    onSend({ type: 'text', content: newMessage });
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
              {msg.type === 'file' || msg.type === 'photo' || msg.type === 'document' ? (
                <a href={msg.content} target="_blank" rel="noopener noreferrer">
                  📎 {msg.name || 'Attachment'}
                </a>
              ) : (
                <p>{msg.text || msg.content}</p>
              )}
              <span className="timestamp">
                {msg.sender} • {msg.time || new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
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
    </div>
  );
}

export default ChatBox;
