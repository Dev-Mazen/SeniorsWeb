import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DirectoryPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, nickname, quote, fun_fact, photo_url, role")
    .eq("is_active", true)
    .eq("role", "student")
    .order("full_name");

  return (
    <div className="pt-8 pb-32 px-6 max-w-7xl mx-auto">
      <header className="mb-16 mt-8 flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="max-w-2xl">
          <h1 className="serif text-6xl md:text-7xl font-bold tracking-tighter text-on-surface mb-4 leading-none">
            The Class <span className="text-primary italic">Directory</span>
          </h1>
          <p className="text-on-surface-variant text-lg font-medium max-w-md">
            Every face has a story. Browse the legacy of the Class of 2026.
          </p>
        </div>
      </header>

      {(!profiles || profiles.length === 0) && (
        <div className="text-center py-32">
          <span className="material-symbols-outlined text-6xl text-outline/40">group_off</span>
          <p className="text-on-surface-variant mt-4">No students yet. Admins can add users from the dashboard.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {profiles?.map((p) => (
          <div key={p.id} className="group bg-surface-container-lowest rounded-xl p-8 transition-all duration-500 hover:-translate-y-2 editorial-shadow flex flex-col border border-transparent hover:border-primary/10">
            <div className="flex items-start justify-between mb-8">
              <div className="relative">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.full_name ?? ""} className="w-24 h-24 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center text-2xl font-black text-primary">
                    {(p.full_name ?? "?")[0]}
                  </div>
                )}
              </div>
              {p.nickname && (
                <span className="px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-xs font-bold tracking-widest uppercase">{p.nickname}</span>
              )}
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">{p.full_name ?? "Unknown"}</h3>
              {p.quote && <p className="text-on-surface-variant text-sm italic font-medium">&ldquo;{p.quote}&rdquo;</p>}
            </div>
            <div className="mt-auto flex flex-col gap-4">
              {p.fun_fact && (
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span className="text-xs font-bold uppercase tracking-wider">{p.fun_fact}</span>
                </div>
              )}
              <MemoryButton subjectId={p.id} subjectName={p.full_name ?? "this student"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemoryButton({ subjectId, subjectName }: { subjectId: string; subjectName: string }) {
  return (
    <Link
      href={`/directory/${subjectId}/memory`}
      className="w-full py-4 bg-surface-container-high text-on-surface font-bold rounded-full hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2 text-sm"
    >
      <span className="material-symbols-outlined text-xl">favorite</span>
      Submit a Memory
    </Link>
  );
}
