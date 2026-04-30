import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";
import HotReloader from "@/components/layout/HotReloader";
import GlobalScrollToTop from "@/components/layout/GlobalScrollToTop";
import AppGuide from "@/components/AppGuide";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, is_active, photo_url")
    .eq("id", user.id)
    .single();

  const profile = profileData as { role: string; is_active: boolean; photo_url: string | null } | null;

  return (
    <div className="min-h-screen bg-surface">
      <HotReloader />
      <Navbar role={profile?.role} photoUrl={profile?.photo_url || null} />
      <main className="app-main-shell overflow-x-hidden pt-20 pb-28 md:pb-0">{children}</main>
      <MobileNav />
      <GlobalScrollToTop />
      <AppGuide />
    </div>
  );
}
