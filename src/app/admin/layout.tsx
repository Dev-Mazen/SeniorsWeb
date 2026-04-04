import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile, error } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  
  if (profile?.role !== "admin") redirect("/");
  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar adminName={profile?.full_name ?? "Admin"} />
      <main className="ml-72 flex-1 p-8 pb-16">{children}</main>
    </div>
  );
}