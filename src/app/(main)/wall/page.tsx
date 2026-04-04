import { createClient } from "@/lib/supabase/server";
import WallClient from "./WallClient";

export default async function WallPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: settings } = await supabase.from("platform_settings").select("wall_enabled").single();
  const { data: posts } = await supabase
    .from("wall_posts")
    .select("*, profiles(full_name, photo_url)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return <WallClient posts={posts ?? []} wallEnabled={settings?.wall_enabled ?? true} userId={user!.id} />;
}