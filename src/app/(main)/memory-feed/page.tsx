import { createClient } from "@/lib/supabase/server";
import MemoryFeedExperience from "@/components/memory-feed/MemoryFeedExperience";

export default async function MemoryFeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: settings } = await supabase.from("platform_settings").select("uploads_enabled").single();
  const { data: items } = await supabase
    .from("memories")
    .select("*, profiles(full_name, photo_url)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  const { data: likes } = await supabase.from("memory_likes").select("memory_id, user_id");
  const { data: comments } = await supabase
    .from("memory_comments")
    .select("id, memory_id, content, created_at, user_id, profiles:user_id(full_name, photo_url)")
    .order("created_at", { ascending: true });

  return (
    <MemoryFeedExperience
      items={items ?? []}
      uploadsEnabled={settings?.uploads_enabled ?? true}
      userId={user!.id}
      initialLikes={likes ?? []}
      initialComments={comments ?? []}
    />
  );
}
