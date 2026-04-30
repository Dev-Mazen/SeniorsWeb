import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  
  if (profile?.role !== "admin") redirect("/");
  return (
    <div className="flex min-h-screen bg-surface transition-colors duration-700 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[70rem] h-[70rem] bg-primary/5 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60rem] h-[60rem] bg-secondary/5 blur-[180px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
      </div>

      <AdminSidebar adminName={profile?.full_name ?? "Admin"} />
      
      <main className="app-main-shell ml-72 flex-1 p-10 pb-40 relative z-10 overflow-x-hidden">
        {/* Decorative layout elements */}
        <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent -z-10" />
        {children}
      </main>
    </div>
  );
}