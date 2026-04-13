import { createClient } from "@/lib/supabase/server";
import VotingClient from "./VotingClient";

export default async function VotingControlPage() {
  const supabase = await createClient();
  
  const [
    { data: questions },
    { data: votes },
    { data: settings },
    { count: totalStudents }
  ] = await Promise.all([
    supabase.from("awards_questions").select("*").order("display_order"),
    supabase.from("awards_votes").select("*, profiles!awards_votes_nominee_id_fkey(full_name, nickname)"),
    supabase.from("platform_settings").select("*").single(),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student").eq("is_active", true)
  ]);

  return <VotingClient 
    initialQuestions={questions ?? []} 
    votes={votes ?? []} 
    settings={settings!} 
    totalStudents={totalStudents ?? 0}
  />;
}
