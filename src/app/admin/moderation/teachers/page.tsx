import { createClient } from "@/lib/supabase/server";
import TeachersClient from "./TeachersClient";

export default async function TeachersModerationPage() {
  const supabase = await createClient();
  
  // Need both messages and teachers table
  const [
    { data: messages },
    { data: teachers }
  ] = await Promise.all([
    supabase.from("teacher_messages").select("*, teachers(name), profiles(nickname, full_name)").order("created_at", { ascending: false }),
    supabase.from("teachers").select("*").order("name"),
  ]);

  return <TeachersClient initialMessages={messages ?? []} initialTeachers={teachers ?? []} />;
}
