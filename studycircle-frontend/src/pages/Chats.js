import React, { useState, useEffect, useCallback } from 'react';
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
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  // 🔎 Local search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Load conversations (run once on mount)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('conversations/');
        setConversations(res.data);
        if (res.data.length > 0) {
          setActiveConversation(res.data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err.response?.data || err.message);
      }
    };
    fetchConversations();
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
  }, []);

  // Load messages for active conversation
  useEffect(() => {
    if (activeConversation) {
      const fetchMessages = async () => {
        try {
          const res = await api.get('messages/', {
            params: { conversation: activeConversation.id }
          });
          setMessages(res.data);
        } catch (err) {
          console.error('Failed to fetch messages:', err.response?.data || err.message);
        }
      };
      fetchMessages();
    }
  }, [activeConversation]);

  // WebSocket connection
  useEffect(() => {
    if (!activeConversation) return;

    const token = localStorage.getItem('access');
    const wsUrl = `${WS_BASE}/${activeConversation.id}/?token=${token}`;
    const ws = new WebSocket(wsUrl);
    setSocket(ws);

    ws.onopen = () => console.log('✅ Connected to WebSocket');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'reaction') {
          // 🔹 Handle reaction events separately
          setMessages(prev =>
            prev.map(m =>
              m.id === data.reaction.message
                ? { ...m, reactions: [...(m.reactions || []), data.reaction] }
                : m
            )
          );
        } else {
          // 🔹 Handle normal messages
          setMessages(prev => {
            // Avoid duplicates if REST already added the message
            if (prev.some(m => m.id === data.id)) return prev;
            return [
              ...prev,
              {
                id: data.id,
                sender: data.sender,
                sender_username: data.sender_username,
                content: data.content,
                conversation: data.conversation,
                created_at: data.created_at,
                attachment_url: data.attachment_url || null,
              }
            ];
          });
        }
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
  }, [activeConversation]);

  // Send message (text or file)
  const handleSend = async (msg) => {
    if (!socket || !activeConversation) return;

    try {
      let res;
      if (msg.file) {
        const formData = new FormData();
        formData.append('conversation', activeConversation.id);
        formData.append('file', msg.file);

        res = await api.post('messages/upload/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const payload = {
          conversation: activeConversation.id,
          content: typeof msg === 'string' ? msg : msg.content,
        };
        socket.send(JSON.stringify(payload));
        res = await api.post('messages/', payload);
      }

      // Avoid duplicates: only add if not already in state
      setMessages(prev => (prev.some(m => m.id === res.data.id) ? prev : [...prev, res.data]));
    } catch (err) {
      console.error('Failed to send/save message:', err.response?.data || err.message);
    }
  };

  // Start private conversation
  const handleStartPrivateChat = async () => {
    if (!selectedUser) return;
    try {
      const userId = localStorage.getItem('userId');
      const res = await api.post('conversations/private/', {
        user1: userId,
        user2: selectedUser
      });
      setConversations(prev => [...prev, res.data]);
      setActiveConversation(res.data);
      setSelectedUser('');
    } catch (err) {
      console.error('Failed to start private conversation:', err.response?.data || err.message);
    }
  };

  // ✅ Stable handleSearch with useCallback
  const handleSearch = useCallback(async (q) => {
    setLoadingSearch(true);
    setSearchError('');
    try {
      const res = await api.get(`messages/`, {
        params: { conversation: activeConversation.id, q }
      });
      setSearchResults(res.data || []);
    } catch (err) {
      setSearchError('Search failed. Please try again.');
    } finally {
      setLoadingSearch(false);
    }
  }, [activeConversation]);

  // 🔎 Debounced local search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() && activeConversation) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, activeConversation, handleSearch]);

  return (
    <div className="chats-layout">
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversation}
        setActiveConversation={setActiveConversation}
        users={users}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleStartPrivateChat={handleStartPrivateChat}
      />
      <div className="chat-main">
        {/* 🔎 Local Conversation Search Bar */}
        <div className="conversation-search">
          <input
            type="text"
            placeholder="Search messages in this conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loadingSearch && <p className="search-status">⏳ Searching...</p>}
        {searchError && <p className="search-error">{searchError}</p>}

        {searchResults.length > 0 && (
          <div className="search-results">
            <h4>Messages Found</h4>
            {searchResults.map(m => (
              <p key={m.id}>📝 {m.sender_username}: {m.content}</p>
            ))}
          </div>
        )}

        <ChatBox
          conversationId={activeConversation?.id}
          onSend={handleSend}
          messages={messages}
        />
      </div>
    </div>
  );
}

export default Chats;
