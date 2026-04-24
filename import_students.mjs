import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL = "https://jpjqmundfkkmihfhadud.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwanFtdW5kZmtrbWloZmhhZHVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTMwODA1MywiZXhwIjoyMDkwODg0MDUzfQ.4FT9XyDeErq2-YjC36I--r-OYSDIMTVzUP36touC1sc";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const accounts = JSON.parse(readFileSync("./accounts_data.json", "utf-8"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function importStudents() {
  console.log(`Starting import of ${accounts.length} students...\n`);

  let successCount = 0;
  let failCount = 0;
  const failed = [];

  for (let i = 0; i < accounts.length; i++) {
    const { id, full_name, email, password } = accounts[i];

    process.stdout.write(`[${i + 1}/${accounts.length}] ${full_name} ... `);

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          id,
          email,
          password,
          email_confirm: true, // auto-confirm so they can log in immediately
          user_metadata: {
            full_name,
            email,
          },
        });

      if (authError) {
        console.log(`❌ Auth error: ${authError.message}`);
        failCount++;
        failed.push({ full_name, email, error: authError.message });
        continue;
      }

      const userId = authData.user.id;

      // Step 2: Update existing profile row (created automatically by trigger)
      const now = new Date().toISOString();
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name,
          email,
          password,
          role: "student",
          is_active: true,
          updated_at: now,
        })
        .eq("id", userId);

      if (profileError) {
        console.log(`⚠️  Auth OK but profile error: ${profileError.message}`);
        failCount++;
        failed.push({ full_name, email, error: `Profile: ${profileError.message}` });
        continue;
      }

      console.log(`✅`);
      successCount++;

      // Small delay to avoid rate limiting
      await sleep(150);
    } catch (err) {
      console.log(`❌ Unexpected error: ${err.message}`);
      failCount++;
      failed.push({ full_name, email, error: err.message });
    }
  }

  console.log("\n=============================");
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed:  ${failCount}`);

  if (failed.length > 0) {
    console.log("\nFailed accounts:");
    failed.forEach((f) => console.log(`  - ${f.full_name} (${f.email}): ${f.error}`));
  }

  console.log("\nImport complete!");
}

importStudents();
