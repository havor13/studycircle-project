import React, { useState, useEffect, useRef } from 'react';
import api from '../api/api';
import '../styles.css';

function ChatBox({ threadId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!threadId) return;
    api.get('messages/', { params: { thread: threadId } })
      .then(res => setMessages(res.data))
      .catch(err => console.error('Failed to fetch messages:', err));
  }, [threadId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await api.post('messages/', {
        thread: threadId,
        content: newMessage
      });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err.response?.data || err);
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