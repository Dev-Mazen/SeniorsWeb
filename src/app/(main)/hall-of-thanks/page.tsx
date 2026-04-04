import { createClient } from "@/lib/supabase/server";
import HallClient from "./HallClient";

export default async function HallOfThanksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: teachers } = await supabase.from("teachers").select("*, teacher_messages(id, content, status)").order("display_order");
  return <HallClient teachers={teachers ?? []} userId={user!.id} />;
}