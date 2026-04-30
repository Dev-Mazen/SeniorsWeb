import { createClient } from "@/lib/supabase/server";
import MemoriesClient from "./MemoriesClient";

export default async function MemoriesModerationPage() {
  const supabase = await createClient();
  
  const { data: memories } = await supabase
    .from("memories")
    .select("*, profiles(full_name, nickname, email)")
    .order("created_at", { ascending: false });

  // Pass all data to client to allow rapid local filtering
  return <MemoriesClient initialMemories={memories ?? []} />;
}
