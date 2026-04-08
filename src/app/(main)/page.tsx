import { createClient } from "@/lib/supabase/server";
import HomeExperience from "@/components/home/HomeExperience";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("platform_settings").select("*").single();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user!.id).single();

  return <HomeExperience settings={settings} profile={profile} />;
}
