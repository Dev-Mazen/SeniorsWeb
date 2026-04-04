import { createClient } from "@/lib/supabase/server";
import TimeCapsuleClient from "./TimeCapsuleClient";

export default async function TimeCapsulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: capsule } = await supabase.from("time_capsules").select("*").eq("author_id", user!.id).single();
  return <TimeCapsuleClient existing={capsule} userId={user!.id} />;
}