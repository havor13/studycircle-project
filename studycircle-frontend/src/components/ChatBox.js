import React, { useState, useEffect, useRef } from 'react';
import api from '../api/api';   // ✅ use axios client
import '../styles.css';

function ChatBox({ threadId, userId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Load messages for thread
  useEffect(() => {
    if (!threadId) return;
    api.get('messages/', { params: { thread: threadId } })
      .then(res => setMessages(res.data))
      .catch(err => console.error('Failed to fetch messages:', err));
  }, [threadId]);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await api.post('messages/', {
        thread: threadId,
        sender: userId,
        content: newMessage
      });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <p>No messages yet. Start chatting!</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="chat-message">
              <p><strong>{msg.sender_username}:</strong> {msg.content}</p>
              <span className="timestamp">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">➤</button>
      </form>
    </div>
  );
}

export default ChatBox;
