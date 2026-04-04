import { createClient } from "@/lib/supabase/server";
import SettingsClient from "./SettingsClient";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("platform_settings").select("*").single();
  return <SettingsClient settings={settings} />;
}