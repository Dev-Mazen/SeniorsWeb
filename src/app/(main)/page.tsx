import { createClient } from "@/lib/supabase/server";
import HomeExperience from "@/components/home/HomeExperience";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("platform_settings").select("*").single();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user!.id).single();
  const { count: memoryCount } = await supabase.from("memories").select("*", { count: "exact", head: true }).eq("status", "approved");
  const { count: wallCount } = await supabase.from("wall_posts").select("*", { count: "exact", head: true }).eq("status", "approved");
  const { count: profileCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true);
  const { data: recentMemories } = await supabase
    .from("memories")
    .select("id, caption, media_url, media_type, created_at, profiles(full_name, photo_url)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <HomeExperience
      settings={settings}
      profile={profile}
      stats={{ memories: memoryCount ?? 0, wallPosts: wallCount ?? 0, classmates: profileCount ?? 0 }}
      recentMemories={recentMemories ?? []}
    />
  );
}
