import React, { useState, useEffect, useRef } from 'react';
import '../chats.css';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import api from '../api/api';

function ChatBox({ conversationId, onSend, messages }) {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionTargetId, setReactionTargetId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // ✅ image preview state
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSend({ content: newMessage });
    setNewMessage('');
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const uploadFile = (file) => {
    onSend({ file });
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

  // ✅ Updated attachment renderer with click-to-preview + download
  const renderAttachment = (msg) => {
    if (!msg.attachment_url) return null;

    const baseUrl = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
    const fileUrl = msg.attachment_url.startsWith('http')
      ? msg.attachment_url
      : `${baseUrl}${msg.attachment_url}`;

    const isImage = fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i);
    return isImage ? (
      <div className="chat-image-wrapper">
        <img
          src={fileUrl}
          alt="attachment"
          className="chat-image"
          onClick={() => setPreviewImage(fileUrl)}
        />
        {/* ✅ Download button on thumbnail */}
        <a href={fileUrl} download className="download-btn" title="Download image">⬇️</a>
      </div>
    ) : (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="chat-file"
        download
      >
        📎 Download {msg.content || "Attachment"}
      </a>
    );
  };

  const openReactionPicker = (messageId) => {
    setReactionTargetId(messageId);
    setShowReactionPicker(true);
  };

  const handleReactionSelect = async (emoji) => {
    try {
      await api.post(`messages/${reactionTargetId}/react/`, { emoji: emoji.native });
      setShowReactionPicker(false);
      setReactionTargetId(null);
    } catch (err) {
      console.error("Failed to react:", err.response?.data || err.message);
    }
  };

  const startEditing = (msg) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  const saveEdit = async () => {
    try {
      await api.patch(`messages/${editingMessageId}/`, { content: editContent });
      setEditingMessageId(null);
      setEditContent('');
    } catch (err) {
      console.error("Failed to edit message:", err.response?.data || err.message);
    }
  };

  const groupReactions = (reactions) => {
    const grouped = {};
    reactions.forEach(r => {
      grouped[r.emoji] = (grouped[r.emoji] || 0) + 1;
    });
    return grouped;
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages && messages.length === 0 ? (
          <p className="chat-empty">No messages yet. Start chatting!</p>
        ) : (
          messages.map(msg => {
            const groupedReactions = msg.reactions ? groupReactions(msg.reactions) : {};
            return (
              <div
                key={msg.id || Math.random()}
                className={`chat-bubble ${
                  msg.sender_username === localStorage.getItem('username')
                    ? 'sent'
                    : 'received'
                }`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  openReactionPicker(msg.id);
                }}
              >
                <div className="bubble-content">
                  {editingMessageId === msg.id ? (
                    <>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <button onClick={saveEdit}>Save</button>
                      <button onClick={() => setEditingMessageId(null)}>Cancel</button>
                    </>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  {renderAttachment(msg)}
                </div>
                {msg.created_at && (
                  <span className="timestamp">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}

                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="reactions">
                    {Object.entries(groupedReactions).map(([emoji, count]) => (
                      <span key={emoji}>{emoji} {count > 1 ? `×${count}` : ''}</span>
                    ))}
                  </div>
                )}

                {msg.sender_username === localStorage.getItem('username') && editingMessageId !== msg.id && (
                  <button className="edit-btn" onClick={() => startEditing(msg)}>✏️ Edit</button>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {showReactionPicker && (
        <>
          <div
            className="reaction-overlay"
            onClick={() => {
              setShowReactionPicker(false);
              setReactionTargetId(null);
            }}
          />
          <div className="reaction-picker">
            <Picker data={data} onEmojiSelect={handleReactionSelect} />
          </div>
        </>
      )}

      {/* ✅ Image Preview Overlay with download */}
      {previewImage && (
        <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
          <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="preview" className="image-preview" />
            <a href={previewImage} download className="download-btn-overlay">⬇️ Download</a>
          </div>
        </div>
      )}

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