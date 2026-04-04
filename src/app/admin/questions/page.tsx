import { createClient } from "@/lib/supabase/server";
import QuestionsClient from "./QuestionsClient";

export default async function QuestionsPage() {
  const supabase = await createClient();
  const { data: questions } = await supabase
    .from("awards_questions")
    .select("*")
    .order("display_order");
  return <QuestionsClient questions={questions ?? []} />;
}
