import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Verify the caller is an authenticated admin
    const serverSupabase = await createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });

    const { data: profileData } = await serverSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const callerProfile = profileData as { role: string } | null;
    if (callerProfile?.role !== "admin") {
      return NextResponse.json({ error: { message: "Admin access required" } }, { status: 403 });
    }

    const { email, password, full_name, role } = await req.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceRoleKey && serviceRoleKey !== "your-service-role-key-here") {
      // ── Full admin flow (service role key available) ──────────────────
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });

      if (authError) return NextResponse.json({ error: authError }, { status: 400 });

      await adminClient.from("profiles").upsert({
        id: authData.user.id,
        email,
        full_name,
        role,
        is_active: true,
      });

      return NextResponse.json({ success: true });

    } else {
      // ── Fallback: regular signUp (user gets confirmation email) ───────
      const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: authData, error: authError } = await anonClient.auth.signUp({
        email,
        password,
        options: { data: { full_name } },
      });

      if (authError) {
        // User might already exist
        return NextResponse.json({ error: authError }, { status: 400 });
      }
      if (!authData.user) {
        return NextResponse.json({ error: { message: "User creation failed" } }, { status: 400 });
      }

      // A DB trigger auto-creates the profile row when auth.users is inserted.
      // We now UPDATE it with the admin-specified name and role.
      // Give the trigger ~200ms to run first.
      await new Promise((resolve) => setTimeout(resolve, 200));

      await serverSupabase
        .from("profiles")
        .update({ full_name, role, is_active: true } as any)
        .eq("id", authData.user.id);

      return NextResponse.json({
        success: true,
        note: "User created. They will receive a confirmation email before they can log in. To skip email confirmation, add SUPABASE_SERVICE_ROLE_KEY to .env.local",
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
