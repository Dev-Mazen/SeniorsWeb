import HomeExperience from "@/components/home/HomeExperience";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: settings },
    { data: profile },
    { count: memoryCount },
    { count: wallCount },
    { count: profileCount },
    { count: capsuleCount },
    { count: userMemoryCount },
    { count: userWallCount },
    { count: userCapsuleCount },
    { data: recentMemories },
    { data: spotlightProfiles },
  ] = await Promise.all([
    supabase.from("platform_settings").select("*").single(),
    supabase
      .from("profiles")
      .select("full_name, role, nickname, quote, fun_fact")
      .eq("id", user!.id)
      .single(),
    supabase.from("memories").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("wall_posts").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("time_capsules").select("*", { count: "exact", head: true }),
    supabase.from("memories").select("*", { count: "exact", head: true }).eq("author_id", user!.id),
    supabase.from("wall_posts").select("*", { count: "exact", head: true }).eq("author_id", user!.id),
    supabase.from("time_capsules").select("*", { count: "exact", head: true }).eq("author_id", user!.id),
    supabase
      .from("memories")
      .select("id, caption, media_url, media_type, created_at, profiles(full_name, photo_url)")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("profiles")
      .select("id, full_name, nickname, quote, fun_fact, photo_url")
      .eq("is_active", true)
      .neq("id", user!.id)
      .order("updated_at", { ascending: false })
      .limit(4),
  ]);

  return (
    <HomeExperience
      settings={settings}
      profile={profile}
      stats={{
        memories: memoryCount ?? 0,
        wallPosts: wallCount ?? 0,
        classmates: profileCount ?? 0,
      }}
      recentMemories={recentMemories ?? []}
    />
  );
}
