// Run database migration using Supabase Management API
const sql = `
CREATE TABLE IF NOT EXISTS memory_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id uuid NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(memory_id, user_id)
);

CREATE TABLE IF NOT EXISTS memory_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id uuid NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE memory_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view likes') THEN
    CREATE POLICY "Anyone can view likes" ON memory_likes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can like') THEN
    CREATE POLICY "Authenticated users can like" ON memory_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can unlike their own') THEN
    CREATE POLICY "Users can unlike their own" ON memory_likes FOR DELETE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view comments') THEN
    CREATE POLICY "Anyone can view comments" ON memory_comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can comment') THEN
    CREATE POLICY "Authenticated users can comment" ON memory_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own comments') THEN
    CREATE POLICY "Users can delete own comments" ON memory_comments FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_memory_likes_memory_id ON memory_likes(memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_comments_memory_id ON memory_comments(memory_id);
`;

async function runMigration() {
    const projectRef = 'jpjqmundfkkmihfhadud';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwanFtdW5kZmtrbWloZmhhZHVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTMwODA1MywiZXhwIjoyMDkwODg0MDUzfQ.4FT9XyDeErq2-YjC36I--r-OYSDIMTVzUP36touC1sc';

    // Use the Supabase pg endpoint
    const url = `https://${projectRef}.supabase.co/pg`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': serviceKey,
            },
            body: JSON.stringify({ query: sql }),
        });

        if (!res.ok) {
            const text = await res.text();
            console.log('pg endpoint failed:', res.status, text);

            // Try the /rest/v1/rpc approach - won't work for DDL but let's try
            // Fall back to direct pg connection info
            console.log('');
            console.log('Trying alternative approach...');

            // Try query endpoint  
            const res2 = await fetch(`https://${projectRef}.supabase.co/rest/v1/rpc/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${serviceKey}`,
                    'apikey': serviceKey,
                },
            });
            console.log('rpc status:', res2.status);
        } else {
            const data = await res.json();
            console.log('SUCCESS:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Error:', err.message);
    }

    // Verify
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(`https://${projectRef}.supabase.co`, serviceKey);

    const { error: e1 } = await supabase.from('memory_likes').select('id').limit(1);
    const { error: e2 } = await supabase.from('memory_comments').select('id').limit(1);

    console.log('');
    console.log('Verification:');
    console.log('memory_likes:', e1 ? 'NOT FOUND' : 'EXISTS ✅');
    console.log('memory_comments:', e2 ? 'NOT FOUND' : 'EXISTS ✅');
}

runMigration();
