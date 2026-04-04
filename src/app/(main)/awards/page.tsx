import { createClient } from "@/lib/supabase/server";
import AwardsClient from "./AwardsClient";

export default async function AwardsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: settings } = await supabase.from("platform_settings").select("voting_enabled, awards_revealed").single();
  const { data: questions } = await supabase.from("awards_questions").select("*").eq("is_active", true).order("display_order");
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, photo_url").eq("is_active", true).eq("role", "student");
  const { data: myVotes } = await supabase.from("awards_votes").select("question_id, nominee_id").eq("voter_id", user!.id);
  
  let results: Record<string, { nominee_id: string; count: number }[]> | null = null;
  if (settings?.awards_revealed) {
    const { data: allVotes } = await supabase.from("awards_votes").select("question_id, nominee_id");
    if (allVotes) {
      results = {};
      allVotes.forEach(v => {
        if (!results![v.question_id]) results![v.question_id] = [];
        const existing = results![v.question_id].find(r => r.nominee_id === v.nominee_id);
        if (existing) existing.count++;
        else results![v.question_id].push({ nominee_id: v.nominee_id, count: 1 });
      });
      Object.keys(results).forEach(qid => results![qid].sort((a, b) => b.count - a.count));
    }
  }
  return <AwardsClient questions={questions ?? []} profiles={profiles ?? []} myVotes={myVotes ?? []} votingEnabled={settings?.voting_enabled ?? false} awardsRevealed={settings?.awards_revealed ?? false} results={results} userId={user!.id} />;
}