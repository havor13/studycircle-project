import React, { useState, useEffect } from 'react';
import api from '../api/api'; // axios instance with JWT interceptors
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

  // WebSocket connection with JWT
  useEffect(() => {
    if (!activeThread) return;

    const token = localStorage.getItem('accessToken'); // JWT from storage/context
    const wsUrl =
      activeThread.chat_type === 'general'
        ? `ws://localhost:8000/ws/chats/?token=${token}`
        : `ws://localhost:8000/ws/chats/${activeThread.id}/?token=${token}`;

    const ws = new WebSocket(wsUrl);
    setSocket(ws);

    ws.onopen = () => console.log('Connected to WebSocket');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.thread === activeThread.id || activeThread.chat_type === 'general') {
          setMessages(prev => [
            ...prev,
            { sender: data.sender, content: data.message, created_at: new Date().toISOString() }
          ]);
        }
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
  const handleSend = async (msg) => {
    if (!socket || !activeThread) return;

    const userId = localStorage.getItem('userId'); // replace with actual auth context
    const msgPayload = { sender: userId, message: msg, thread: activeThread.id };

    try {
      socket.send(JSON.stringify(msgPayload));
      await api.post('messages/', {
        thread: activeThread.id,
        sender: userId,
        content: msg
      });
    } catch (err) {
      console.error('Failed to send/save message:', err);
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
