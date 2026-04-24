import { createClient } from "@/lib/supabase/server";
import TimeCapsuleClient from "./TimeCapsuleClient";

export default async function TimeCapsulePage() {
  const supabase = await createClient();
  
  const { data: capsules } = await supabase
    .from("time_capsules")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false });

  return <TimeCapsuleClient initialCapsules={capsules ?? []} />;
}
