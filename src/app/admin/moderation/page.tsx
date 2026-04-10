import { createClient } from "@/lib/supabase/server";
import ModerationClient from "./ModerationClient";

export default async function ModerationPage() {
  const supabase = await createClient();
  const [
    { data: wallPosts },
    { data: memories },
    { data: teacherMsgs },
    { data: seniorMems },
    { data: approvedWall },
    { data: approvedMem },
    { data: rejectedWall },
    { data: rejectedMem },
    { data: rejectedTeacherMsgs },
    { data: rejectedSeniorMems },
  ] = await Promise.all([
    supabase.from("wall_posts").select("*, profiles(full_name)").eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("memories").select("*, profiles(full_name)").eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("teacher_messages").select("*, teachers(name)").eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("senior_memories").select("*, profiles!senior_memories_author_id_fkey(full_name), subject:profiles!senior_memories_subject_id_fkey(full_name)").eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("wall_posts").select("*, profiles(full_name)").eq("status", "approved").order("created_at", { ascending: false }).limit(50),
    supabase.from("memories").select("*, profiles(full_name)").eq("status", "approved").order("created_at", { ascending: false }).limit(50),
    supabase.from("wall_posts").select("*, profiles(full_name)").eq("status", "rejected").order("created_at", { ascending: false }).limit(50),
    supabase.from("memories").select("*, profiles(full_name)").eq("status", "rejected").order("created_at", { ascending: false }).limit(50),
    supabase.from("teacher_messages").select("*, teachers(name)").eq("status", "rejected").order("created_at", { ascending: false }).limit(50),
    supabase.from("senior_memories").select("*, profiles!senior_memories_author_id_fkey(full_name), subject:profiles!senior_memories_subject_id_fkey(full_name)").eq("status", "rejected").order("created_at", { ascending: false }).limit(50),
  ]);

  return (
    <ModerationClient
      wallPosts={wallPosts ?? []}
      memories={memories ?? []}
      teacherMsgs={teacherMsgs ?? []}
      seniorMems={seniorMems ?? []}
      approvedWall={approvedWall ?? []}
      approvedMem={approvedMem ?? []}
      rejectedWall={rejectedWall ?? []}
      rejectedMem={rejectedMem ?? []}
      rejectedTeacherMsgs={rejectedTeacherMsgs ?? []}
      rejectedSeniorMems={rejectedSeniorMems ?? []}
    />
  );
}