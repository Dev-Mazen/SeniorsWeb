import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  const profile = profileData as { role: string; is_active: boolean } | null;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar role={profile?.role} />
      <main className="pt-16 pb-24 md:pb-0">{children}</main>
      <MobileNav />
    </div>
  );
}
