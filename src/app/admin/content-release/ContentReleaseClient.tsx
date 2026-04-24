"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PlatformSettings } from "@/types/database";

export default function ContentReleaseClient({ settings: initial }: { settings: PlatformSettings }) {
  const [settings, setSettings] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);

  async function toggle(key: keyof PlatformSettings) {
    setLoading(key);
    const supabase = createClient();
    const newValue = !settings[key];
    await supabase.from("platform_settings").update({ [key]: newValue }).eq("id", 1);
    setSettings(prev => ({ ...prev, [key]: newValue }));
    setLoading(null);
  }

  const controls: { key: keyof PlatformSettings; title: string, description: string, icon: string }[] = [
    { key: "uploads_enabled", title: "Open Memories Upload", description: "Allows students to upload photos and videos to the Memory Grid.", icon: "cloud_upload" },
    { key: "wall_enabled", title: "Chaos Board Submissions", description: "Allows live anonymous sticky notes on the Chaos Board.", icon: "sticky_note_2" },
    { key: "voting_enabled", title: "Voting Phase Live", description: "Opens polls for senior categories. Freeze this when validating winners.", icon: "how_to_vote" },
    { key: "awards_revealed", title: "Reveal Awards", description: "Makes the final winners public to all students. Turn on manually at graduation.", icon: "workspace_premium" }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <header className="mb-10">
        <h2 className="serif text-4xl font-bold tracking-tight">Content Release Config</h2>
        <p className="text-on-surface-variant font-medium mt-1">Manage global platform access thresholds during the graduation progression.</p>
      </header>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-2xl mb-10 flex gap-4 animate-in slide-in-from-top-2">
         <span className="material-symbols-outlined text-3xl text-amber-600">warning</span>
         <div>
            <h4 className="font-bold text-amber-900 text-lg">Platform Freeze Alert</h4>
            <p className="text-amber-800 text-sm mt-1 leading-relaxed">
              These switches actively modify what every logged-in student can see and do globally. 
              Be careful when toggling "Reveal Awards" before the actual graduation ceremony.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {controls.map(ctrl => {
           const active = settings[ctrl.key];
           return (
             <div key={ctrl.key} className={`p-8 rounded-[2rem] border editorial-shadow transition-all relative overflow-hidden ${active ? "bg-white border-green-500/30 ring-4 ring-green-500/10" : "bg-surface-container border-outline-variant/20"}`}>
                <div className="flex justify-between items-start mb-6 relative z-10">
                   <div className={`p-4 rounded-2xl ${active ? "bg-green-100 text-green-700" : "bg-surface-variant text-on-surface-variant"}`}>
                      <span className="material-symbols-outlined text-3xl">{ctrl.icon}</span>
                   </div>
                   
                   <button
                     disabled={loading === ctrl.key} 
                     onClick={() => toggle(ctrl.key)}
                     className={`w-16 h-8 rounded-full border-2 transition-all p-0.5 flex relative items-center cursor-pointer ${active ? "bg-green-500 border-green-500" : "bg-surface-container-highest border-outline-variant"}`}
                   >
                     <div className={`w-6 h-6 rounded-full shadow-sm bg-white absolute transition-all duration-300 ${active ? "translate-x-8" : "translate-x-0"}`} />
                   </button>
                </div>
                
                <div className="relative z-10">
                   <h3 className={`serif text-2xl font-bold mb-2 transition-colors ${active ? "text-green-900" : "text-on-surface"}`}>{ctrl.title}</h3>
                   <p className="text-on-surface-variant font-medium text-sm leading-relaxed">{ctrl.description}</p>
                </div>

                {active && <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />}
             </div>
           );
         })}
      </div>
    </div>
  );
}
