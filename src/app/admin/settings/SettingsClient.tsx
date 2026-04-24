"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import type { PlatformSettings } from "@/types/database";

export default function SettingsClient({ settings: initial }: { settings: PlatformSettings | null }) {
  const initialSettings: Partial<PlatformSettings> = initial ?? {};
  const [settings, setSettings] = useState<Partial<PlatformSettings>>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { theme, setTheme } = useTheme();

  const dirty = settings.graduation_date !== initialSettings.graduation_date;

  async function save() {
    setSaving(true); setSaved(false);
    const supabase = createClient();
    await supabase.from("platform_settings").update({ graduation_date: settings.graduation_date, updated_at: new Date().toISOString() }).eq("id", 1);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // Backup Export Mock
  function exportDatabase() {
     const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ note: "Requires Edge Function to aggregate all tables for true export. This is a UI mockup."}));
     const dlAnchorElem = document.createElement('a');
     dlAnchorElem.setAttribute("href",     dataStr     );
     dlAnchorElem.setAttribute("download", "seniors_backup_2026.json");
     dlAnchorElem.click();
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-20">
      <header className="mb-10">
        <h2 className="serif text-4xl font-bold tracking-tight">Platform Settings</h2>
        <p className="text-on-surface-variant font-medium mt-1">Configure global platform details and security backups.</p>
      </header>

      {/* Graduation Date */}
      <div className="bg-surface-container-lowest rounded-[2rem] p-8 mb-8 editorial-shadow border border-outline-variant/20 flex flex-col md:flex-row gap-8 justify-between items-center">
        <div>
           <h3 className="serif text-2xl font-bold mb-2">Graduation Date Target</h3>
           <p className="text-on-surface-variant text-sm max-w-sm leading-relaxed">
             This date automatically drives the countdown timer on the platform homepage and sets the final locked state logic.
           </p>
        </div>
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-2xl">event</span>
            <input
              type="date"
              className="bg-transparent text-lg font-bold border-none focus:outline-none focus:ring-0 text-on-surface"
              value={settings.graduation_date ?? ""}
              onChange={e => setSettings(prev => ({ ...prev, graduation_date: e.target.value }))}
            />
          </div>
          <button onClick={save} disabled={saving || !dirty} className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow disabled:opacity-50 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[1rem]">save</span> {saving ? "Saving..." : "Save Timeframe"}
          </button>
        </div>
      </div>

      {/* Theme Preference */}
      <div className="bg-surface-container-lowest rounded-[2rem] p-8 mb-8 editorial-shadow border border-outline-variant/20">
        <h3 className="serif text-2xl font-bold mb-6">Theme Preference</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* Light Mode */}
           <button 
             onClick={() => setTheme("light")}
             className={`flex flex-col items-center gap-4 p-6 bg-surface-container rounded-2xl border-2 transition-all ${theme === "light" ? "border-primary shadow-lg scale-[1.02]" : "border-transparent hover:border-outline-variant/50"}`}
           >
              <div className="w-16 h-16 bg-gradient-to-br from-[#fcf9f4] to-[#e5e2dd] rounded-full shadow-inner ring-1 ring-black/5" />
              <span className="font-bold text-sm">Light</span>
           </button>
           {/* Dark Mode */}
           <button 
             onClick={() => setTheme("dark")}
             className={`flex flex-col items-center gap-4 p-6 bg-surface-container rounded-2xl border-2 transition-all ${theme === "dark" ? "border-primary shadow-lg scale-[1.02]" : "border-transparent hover:border-outline-variant/50"}`}
           >
              <div className="w-16 h-16 bg-gradient-to-br from-[#171615] to-[#282524] rounded-full shadow-inner ring-1 ring-white/10" />
              <span className="font-bold text-sm">Dark</span>
           </button>
           {/* System Default */}
           <button 
             onClick={() => setTheme("system")}
             className={`flex flex-col items-center gap-4 p-6 bg-surface-container rounded-2xl border-2 transition-all ${theme === "system" ? "border-primary shadow-lg scale-[1.02]" : "border-transparent hover:border-outline-variant/50"}`}
           >
              <div className="w-16 h-16 rounded-full shadow-inner flex overflow-hidden ring-1 ring-outline/20">
                 <div className="w-1/2 h-full bg-[#fcf9f4]" />
                 <div className="w-1/2 h-full bg-[#171615]" />
              </div>
              <span className="font-bold text-sm">System Match</span>
           </button>
        </div>
      </div>

      {/* Backup Options */}
      <div className="bg-surface-container-lowest rounded-[2rem] p-8 editorial-shadow border border-outline-variant/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-3xl rounded-full pointer-events-none" />
        <h3 className="serif text-2xl font-bold mb-2">Platform Backup</h3>
        <p className="text-sm font-medium text-on-surface-variant mb-6 max-w-md">Generate a complete JSON export of the current database representing all memories, quotes, student directories, and votes.</p>
        
        <button onClick={exportDatabase} className="group relative flex items-center gap-4 px-6 py-4 bg-white border border-outline-variant/20 rounded-2xl hover:border-red-500/50 hover:bg-red-50 transition-all shadow-sm">
           <span className="material-symbols-outlined text-red-600 bg-red-100 p-3 rounded-xl group-hover:scale-110 transition-transform">cloud_download</span>
           <div className="flex flex-col text-left">
              <span className="font-bold text-on-surface">Export Database Archive .JSON</span>
              <span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">Size: ~25.4 MB</span>
           </div>
        </button>
      </div>

    </div>
  );
}