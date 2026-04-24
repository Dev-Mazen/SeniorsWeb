import { createClient } from "@/lib/supabase/server";
import WallClient from "./WallClient";

export default async function WallModerationPage() {
  const supabase = await createClient();
  
  const { data: posts } = await supabase
    .from("wall_posts")
    .select("*, profiles(full_name, nickname)")
    .order("created_at", { ascending: false });

  return <WallClient initialPosts={posts ?? []} />;
}
