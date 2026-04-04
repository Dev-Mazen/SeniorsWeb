import { createClient } from "@/lib/supabase/server";
import MemoryFeedClient from "./MemoryFeedClient";

export default async function MemoryFeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: settings } = await supabase.from("platform_settings").select("uploads_enabled").single();
  const { data: items } = await supabase
    .from("memories")
    .select("*, profiles(full_name, photo_url)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  return <MemoryFeedClient items={items ?? []} uploadsEnabled={settings?.uploads_enabled ?? true} userId={user!.id} />;
}