-- Users (basic auth handled by Django, but we keep extra fields here)
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  photo_url TEXT,
  study_interests TEXT[]
);

-- Profiles (extend user info)
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  photo_url TEXT,
  study_interests TEXT,
  UNIQUE(user_id)
);

-- Study Groups
DROP TABLE IF EXISTS study_groups CASCADE;
CREATE TABLE study_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  created_by INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group Memberships
DROP TABLE IF EXISTS group_members CASCADE;
CREATE TABLE group_members (
  id SERIAL PRIMARY KEY,
  group_id INT REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- 'member' or 'admin'
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (group_id, user_id)
);

-- Group Posts (with pinned flag)
DROP TABLE IF EXISTS group_posts CASCADE;
CREATE TABLE group_posts (
  id SERIAL PRIMARY KEY,
  group_id INT REFERENCES study_groups(id) ON DELETE CASCADE,
  author_id INT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments
DROP TABLE IF EXISTS group_comments CASCADE;
CREATE TABLE group_comments (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES group_posts(id) ON DELETE CASCADE,
  author_id INT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Likes
DROP TABLE IF EXISTS group_likes CASCADE;
CREATE TABLE group_likes (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES group_posts(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (post_id, user_id)
);

-- Chat Threads
DROP TABLE IF EXISTS chat_threads CASCADE;
CREATE TABLE chat_threads (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Participants
DROP TABLE IF EXISTS chat_participants CASCADE;
CREATE TABLE chat_participants (
  id SERIAL PRIMARY KEY,
  thread_id INT REFERENCES chat_threads(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (thread_id, user_id)
);

-- Chat Messages
DROP TABLE IF EXISTS chat_messages CASCADE;
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  thread_id INT REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id INT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Read Receipts
DROP TABLE IF EXISTS chat_message_reads CASCADE;
CREATE TABLE chat_message_reads (
  id SERIAL PRIMARY KEY,
  message_id INT REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (message_id, user_id)
);

-- Reactions (AFTER chat_messages exists)
DROP TABLE IF EXISTS reactions CASCADE;
CREATE TABLE reactions (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES group_posts(id) ON DELETE CASCADE,
  message_id INT REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, post_id, emoji),
  UNIQUE (user_id, message_id, emoji)
);

-- Indexes
CREATE INDEX idx_group_posts_group_id ON group_posts(group_id);
CREATE INDEX idx_group_posts_pinned ON group_posts(pinned);
CREATE INDEX idx_group_comments_post_id ON group_comments(post_id);
CREATE INDEX idx_group_likes_post_id ON group_likes(post_id);
CREATE INDEX idx_chat_messages_thread_id ON chat_messages(thread_id);
CREATE INDEX idx_chat_message_reads_message_id ON chat_message_reads(message_id);
CREATE INDEX idx_chat_message_reads_user_id ON chat_message_reads(user_id);
CREATE INDEX idx_reactions_post_id ON reactions(post_id);
CREATE INDEX idx_reactions_message_id ON reactions(message_id);
