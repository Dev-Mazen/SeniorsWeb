"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PlatformSettings } from "@/types/database";

export default function SettingsClient({ settings: initial }: { settings: PlatformSettings | null }) {
  const initialSettings = initial ?? {};
  const [settings, setSettings] = useState<Partial<PlatformSettings>>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const dirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  async function save() {
    setSaving(true); setSaved(false); setSaveError("");
    const supabase = createClient();
    const { error } = await supabase.from("platform_settings").update({ ...settings, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) {
      setSaveError(error.message);
      setSaving(false);
      return;
    }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function toggle(key: keyof PlatformSettings) {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  }

  const toggles: { key: keyof PlatformSettings; label: string; desc: string }[] = [
    { key: "wall_enabled", label: "The Wall Posts", desc: "Allow students to post on The Wall" },
    { key: "uploads_enabled", label: "Memory Uploads", desc: "Allow photo/video uploads to Memory Feed" },
    { key: "voting_enabled", label: "Awards Voting", desc: "Enable students to cast votes for awards" },
    { key: "awards_revealed", label: "Reveal Awards Results", desc: "Show voting winners publicly to all students" },
  ];

  return (
    <div className="max-w-2xl">
      <header className="mb-10">
        <div className="flex items-center gap-3">
          <h2 className="serif text-3xl font-bold">Platform Settings</h2>
          {dirty && <span className="rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-[10px] font-bold tracking-widest uppercase">Unsaved changes</span>}
        </div>
        <p className="text-on-surface-variant text-sm mt-1">Control features, moderation flow, and graduation countdown.</p>
      </header>

      {/* Graduation Date */}
      <div className="bg-surface-container-lowest rounded-xl p-8 mb-6 editorial-shadow">
        <h3 className="font-black text-lg mb-1">Graduation Date</h3>
        <p className="text-on-surface-variant text-sm mb-4">Used for the countdown timer on the home page.</p>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary">calendar_month</span>
          <input
            type="date"
            className="bg-surface-container-high rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-primary/20 font-medium"
            value={settings.graduation_date ?? ""}
            onChange={e => setSettings(prev => ({ ...prev, graduation_date: e.target.value }))}
          />
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-surface-container-lowest rounded-xl p-8 mb-6 editorial-shadow space-y-6">
        <h3 className="font-black text-lg">Feature Controls</h3>
        {toggles.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">{label}</p>
              <p className="text-on-surface-variant text-xs">{desc}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`w-14 h-7 rounded-full relative transition-all duration-300 flex-shrink-0 ${settings[key] ? "bg-primary" : "bg-surface-container-highest"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow transition-all duration-300 ${settings[key] ? "left-8" : "left-1"}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSettings(initialSettings)}
          disabled={saving || !dirty}
          className="flex-1 py-4 rounded-full bg-surface-container-high text-on-surface font-bold hover:bg-surface-container disabled:opacity-50 transition-colors"
        >
          Reset
        </button>
        <button onClick={save} disabled={saving || !dirty}
          className="flex-1 sunset-gradient py-4 rounded-full text-white font-bold hover:scale-[1.02] transition-transform disabled:opacity-60 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">{saving ? "hourglass_empty" : "save"}</span>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
      {saveError && <p className="text-red-600 text-sm text-center mt-3">{saveError}</p>}
      {saved && <p className="text-green-600 text-sm text-center mt-3 flex items-center justify-center gap-2"><span className="material-symbols-outlined text-sm">check_circle</span> Settings saved!</p>}
    </div>
  );
}