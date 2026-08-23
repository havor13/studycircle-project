import React, { useState, useEffect } from 'react';
import { threadSearchApi } from '../api/api'; // ✅ use helper
import '../chats.css';
import ChatBox from '../components/ChatBox';
import Sidebar from '../components/Sidebar';
import api from '../api/api';

// ✅ Base WebSocket URL: local vs production
const WS_BASE =
  process.env.NODE_ENV === 'development'
    ? 'ws://localhost:8000/ws/chats'
    : 'wss://studycircle-project.onrender.com/ws/chats';

function Chats() {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  // 🔎 Local search state
  const [threadSearchQuery, setThreadSearchQuery] = useState('');
  const [threadSearchResults, setThreadSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Load threads (run once on mount)
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const res = await api.get('threads/');
        setThreads(res.data);
        if (res.data.length > 0) {
          setActiveThread(res.data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch threads:', err.response?.data || err.message);
      }
    };
    fetchThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load users (run once on mount)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('users/');
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch users:', err.response?.data || err.message);
      }
    };
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          console.error('Failed to fetch messages:', err.response?.data || err.message);
        }
      };
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThread]);

  // WebSocket connection
  useEffect(() => {
    if (!activeThread) return;

    const token = localStorage.getItem('access');
    const wsUrl = `${WS_BASE}/${activeThread.id}/?token=${token}`;
    const ws = new WebSocket(wsUrl);
    setSocket(ws);

    ws.onopen = () => console.log('✅ Connected to WebSocket');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages(prev => [
          ...prev,
          {
            id: data.id,
            sender: data.sender,
            sender_username: data.sender_username,
            content: data.content,
            thread: data.thread,
            created_at: data.created_at,
            attachment_url: data.attachment_url || null,
          }
        ]);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
    ws.onerror = (err) => console.error('❌ WebSocket error:', err);
    ws.onclose = () => console.log('⚠️ WebSocket disconnected');

    return () => {
      ws.close();
      setSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThread]);

  // Send message (text or file)
  const handleSend = async (msg) => {
    if (!socket || !activeThread) return;

    try {
      let res;
      if (msg.file) {
        const formData = new FormData();
        formData.append('thread', activeThread.id);
        formData.append('file', msg.file);

        res = await api.post('messages/upload/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const payload = {
          thread: activeThread.id,
          content: typeof msg === 'string' ? msg : msg.content,
        };
        socket.send(JSON.stringify(payload));
        res = await api.post('messages/', payload);
      }

      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to send/save message:', err.response?.data || err.message);
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
      console.error('Failed to start private chat:', err.response?.data || err.message);
    }
  };

  // 🔎 Debounced local thread search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (threadSearchQuery.trim() && activeThread) {
        handleThreadSearch(threadSearchQuery);
      } else {
        setThreadSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadSearchQuery, activeThread]);

  const handleThreadSearch = async (q) => {
    setLoadingSearch(true);
    setSearchError('');
    try {
      const res = await threadSearchApi(activeThread.id, q);
      setThreadSearchResults(res.messages || []);
    } catch (err) {
      setSearchError('Search failed. Please try again.');
    } finally {
      setLoadingSearch(false);
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
        {/* 🔎 Local Thread Search Bar */}
        <div className="thread-search">
          <input
            type="text"
            placeholder="Search messages in this thread..."
            value={threadSearchQuery}
            onChange={(e) => setThreadSearchQuery(e.target.value)}
          />
        </div>

        {loadingSearch && <p className="search-status">⏳ Searching...</p>}
        {searchError && <p className="search-error">{searchError}</p>}

        {threadSearchResults.length > 0 && (
          <div className="search-results">
            <h4>Messages Found</h4>
            {threadSearchResults.map(m => (
              <p key={m.id}>📝 {m.sender_username}: {m.content}</p>
            ))}
          </div>
        )}

        <ChatBox
          threadId={activeThread?.id}
          onSend={handleSend}
          messages={messages}
        />
      </div>
    </div>
  );
}

export default Chats;