import { createClient } from "@/lib/supabase/server";
import ContentReleaseClient from "./ContentReleaseClient";

export default async function ContentReleasePage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("platform_settings").select("*").single();

  return <ContentReleaseClient settings={settings!} />;
}
