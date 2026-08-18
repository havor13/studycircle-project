import React, { useState, useEffect } from 'react';
import api from '../api/api';
import '../styles.css';
import ChatBox from '../components/ChatBox';
import Sidebar from '../components/Sidebar';

function Chats() {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  // Load threads
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const res = await api.get('threads/');
        setThreads(res.data);
        if (res.data.length > 0) {
          setActiveThread(res.data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch threads:', err);
      }
    };
    fetchThreads();
  }, []);

  // Load users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('users/');
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, []);

  // Load messages for active thread
  useEffect(() => {
    if (activeThread) {
      const fetchMessages = async () => {
        try {
          const res = await api.get('messages/', {
            params: { thread: activeThread.id }
          });
          setMessages(res.data);
        } catch (err) {
          console.error('Failed to fetch messages:', err);
        }
      };
      fetchMessages();
    }
  }, [activeThread]);

  // WebSocket connection
  useEffect(() => {
    if (!activeThread) return;

    const token = localStorage.getItem('access');
    const baseUrl =
      process.env.NODE_ENV === 'development'
        ? 'ws://localhost:8000/ws/chats'
        : 'wss://studycircle-project.onrender.com/ws/chats';

    const wsUrl =
      activeThread.chat_type === 'general'
        ? `${baseUrl}/?token=${token}`
        : `${baseUrl}/${activeThread.id}/?token=${token}`;

    const ws = new WebSocket(wsUrl);
    setSocket(ws);

    ws.onopen = () => console.log('Connected to WebSocket');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages(prev => [
          ...prev,
          {
            sender: data.sender,
            content: data.content,   // ✅ now matches ChatBox
            type: data.type || 'text',
            name: data.name || null,
            thread: data.thread,
            created_at: data.created_at,
          }
        ]);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
    ws.onerror = (err) => console.error('WebSocket error:', err);
    ws.onclose = () => console.log('WebSocket disconnected');

    return () => {
      ws.close();
      setSocket(null);
    };
  }, [activeThread]);

  // Send message
  const handleSend = (msg) => {
    if (!socket || !activeThread) return;

    let payload;
    if (typeof msg === 'string') {
      payload = { message: msg, thread: activeThread.id };
    } else {
      payload = {
        message: msg.content,
        thread: activeThread.id,
        type: msg.type,
        name: msg.name
      };
    }

    try {
      socket.send(JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Start private chat
  const handleStartPrivateChat = async () => {
    if (!selectedUser) return;
    try {
      const userId = localStorage.getItem('userId');
      const res = await api.post('threads/private/', {
        user1: userId,
        user2: selectedUser
      });
      setThreads(prev => [...prev, res.data]);
      setActiveThread(res.data);
      setSelectedUser('');
    } catch (err) {
      console.error('Failed to start private chat:', err);
    }
  };

  return (
    <div className="chats-layout">
      <Sidebar
        threads={threads}
        activeThread={activeThread}
        setActiveThread={setActiveThread}
        users={users}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleStartPrivateChat={handleStartPrivateChat}
      />
      <div className="chat-main">
        <ChatBox
          messages={messages}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}

export default Chats;
