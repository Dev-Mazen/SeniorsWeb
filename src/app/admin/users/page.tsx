import { createClient } from "@/lib/supabase/server";
import UsersClient from "./UsersClient";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");
  return <UsersClient users={users ?? []} />;
}