-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Likes table for memories
CREATE TABLE IF NOT EXISTS memory_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id uuid NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(memory_id, user_id)
);

-- Comments table for memories
CREATE TABLE IF NOT EXISTS memory_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id uuid NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE memory_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_comments ENABLE ROW LEVEL SECURITY;

-- Likes policies
CREATE POLICY "Anyone can view likes" ON memory_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON memory_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike their own" ON memory_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON memory_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON memory_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON memory_comments FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_memory_likes_memory_id ON memory_likes(memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_comments_memory_id ON memory_comments(memory_id);
