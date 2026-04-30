"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  is_active: boolean;
  nickname: string | null;
  updated_at: string;
};

const ROLES = ["student", "admin"] as const;

export default function UsersClient({ users: initial }: { users: Profile[] }) {
  const [users, setUsers] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ full_name: string; role: string }>({ full_name: "", role: "student" });
  const [loading, setLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [actionNotice, setActionNotice] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showReset, setShowReset] = useState<string | null>(null);
  
  // Forms
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [newPassword, setNewPassword] = useState("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [resetPassword, setResetPassword] = useState("");

  const filtered = users.filter(
    (u) =>
      (
        (u.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase())
      ) &&
      (statusFilter === "all" || (statusFilter === "active" ? u.is_active : !u.is_active))
  );

  function startEdit(user: Profile) {
    setEditingId(user.id);
    setEditData({ full_name: user.full_name ?? "", role: user.role });
  }

  async function saveEdit(id: string) {
    setLoading(id);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ full_name: editData.full_name, role: editData.role })
      .eq("id", id);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, full_name: editData.full_name, role: editData.role } : u))
    );
    notify("User profile updated.");
    setEditingId(null);
    setLoading(null);
  }

  async function toggleActive(user: Profile) {
    setLoading(user.id);
    const supabase = createClient();
    await supabase.from("profiles").update({ is_active: !user.is_active }).eq("id", user.id);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u)));
    notify(`Account ${user.is_active ? "disabled" : "enabled"} for ${user.full_name}.`);
    setLoading(null);
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!showReset) return;
    setLoading("reset-" + showReset);
    try {
      const res = await fetch("/api/admin/reset-user-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: showReset, password: resetPassword }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message || "Failed");
      notify("Password reset successfully. User's sessions invalidated.");
      setShowReset(null);
      setResetPassword("");
    } catch (err: any) {
      notify("Error: " + err.message);
    }
    setLoading(null);
  }

  async function deleteUser(user: Profile) {
    if (!confirm(`Delete "${user.full_name ?? user.email}"? This action cannot be undone.`)) return;
    setLoading(user.id);
    const supabase = createClient();
    await supabase.from("profiles").delete().eq("id", user.id);
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    notify("User deleted permanently.");
    setLoading(null);
  }

  function notify(msg: string) {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(""), 3000);
  }

  function toggleSelectAll() {
    if (selectedUsers.size === filtered.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filtered.map(u => u.id)));
    }
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedUsers);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedUsers(next);
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 mb-16 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]" />
            <p className="text-on-surface-variant/60 font-black uppercase tracking-[0.5em] text-[10px]">Alumni Registry</p>
          </div>
          <h2 className="serif text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-on-surface via-primary to-primary-container dark:from-white dark:to-primary-fixed pb-2">Student <span className="italic">Registry</span></h2>
          <p className="text-sm font-medium text-on-surface-variant/60 mt-4 max-w-lg leading-relaxed">Systematic synchronization of authorized identities and credential management for the Class of 2026.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 w-full xl:w-auto relative z-10">
          <div className="relative flex-1 sm:flex-initial group">
            <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity">search</span>
            <input
              className="pl-16 pr-8 py-5 bg-white/60 dark:bg-white/5 rounded-[2.5rem] border border-white dark:border-white/5 focus:ring-8 focus:ring-primary/5 text-sm w-full sm:w-96 transition-all font-bold placeholder:text-on-surface-variant/30 shadow-xl shadow-black/[0.02]"
              placeholder="Query by name, email, or digital ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex bg-white/40 dark:bg-black/40 backdrop-blur-3xl rounded-[2rem] p-2 border border-white dark:border-white/5 shadow-2xl shadow-black/[0.02]">
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${statusFilter === f ? "bg-primary dark:bg-primary-fixed text-white dark:text-primary-fixed-dim shadow-2xl shadow-primary/30 scale-105" : "text-on-surface-variant/60 hover:text-on-surface hover:bg-on-surface/5"}`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-4 px-10 py-5 bg-on-surface dark:bg-white text-surface dark:text-black rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] hover:scale-105 active:scale-95 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.1)] group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform duration-500">person_add</span>
            Recruit Identity
          </button>
        </div>
      </header>
      
      {actionNotice && (
        <div className="mb-10 animate-in slide-in-from-top-10 flex items-center gap-5 rounded-[2.5rem] border border-green-200 dark:border-green-500/20 bg-white/80 dark:bg-green-500/10 text-green-800 dark:text-green-400 text-[10px] font-black uppercase tracking-[0.25em] px-10 py-6 shadow-[0_20px_60px_rgba(34,197,94,0.1)]">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">shield_check</span>
          </div>
          {actionNotice}
        </div>
      )}

      {/* Bulk Operations Deck */}
      {selectedUsers.size > 0 && (
        <div className="mb-10 bg-on-surface/5 dark:bg-primary/10 backdrop-blur-3xl border border-on-surface/10 dark:border-primary/20 rounded-[3rem] p-8 flex items-center justify-between animate-in slide-in-from-bottom-8 shadow-2xl transition-all duration-700">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-[1.75rem] bg-on-surface dark:bg-primary text-surface dark:text-white flex items-center justify-center font-black text-xl shadow-2xl">
               {selectedUsers.size}
             </div>
             <div>
               <p className="text-lg font-black text-on-surface tracking-tight">Identities Selected</p>
               <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] mt-1">Batch Authorization Ready</p>
             </div>
          </div>
          <div className="flex gap-4">
            <button className="px-10 py-4 bg-white dark:bg-neutral-800 text-on-surface text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-105 transition-all border border-outline-variant/10">Authorize All</button>
            <button className="px-10 py-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-red-500/30 hover:scale-105 transition-all">Revoke All</button>
          </div>
        </div>
      )}

      {/* Reset Credential Modal */}
      {showReset && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/90 z-[100] flex items-center justify-center p-8 backdrop-blur-3xl animate-in fade-in duration-700">
          <div className="bg-white dark:bg-neutral-900 rounded-[4rem] shadow-2xl w-full max-w-xl p-16 border border-white dark:border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                <span className="material-symbols-outlined text-[12rem] text-primary">security</span>
             </div>
             <h3 className="serif text-5xl font-black text-on-surface mb-6 tracking-tighter">Security Override</h3>
             <p className="text-sm font-medium text-on-surface-variant/60 mb-12 leading-relaxed">Injecting a new encrypted security key for this identity. All active session tokens will be purged immediately.</p>
             <form onSubmit={handleResetSubmit} className="space-y-8 relative z-10">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary ml-2">New Access Payload</label>
                   <input
                    required
                    type="password"
                    minLength={6}
                    className="w-full px-8 py-6 bg-surface-container-low dark:bg-white/5 rounded-[2rem] border border-outline-variant/20 focus:outline-none focus:ring-8 focus:ring-primary/5 text-lg font-black placeholder:opacity-20"
                    placeholder="Min. 8 alphanumeric characters"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                   />
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="submit" disabled={loading === "reset-" + showReset} className="flex-1 py-6 bg-primary text-white rounded-[1.75rem] font-black text-xs uppercase tracking-[0.3em] hover:brightness-110 transition-all shadow-2xl shadow-primary/30 active:scale-95">
                    {loading === "reset-" + showReset ? "Processing..." : "Initialize Reset"}
                  </button>
                  <button type="button" onClick={() => { setShowReset(null); setResetPassword(""); }} className="px-10 py-6 bg-on-surface/5 text-on-surface font-black text-xs uppercase tracking-[0.2em] rounded-[1.75rem] hover:bg-on-surface/10 transition-all">Cancel</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Main Registry Deck */}
      <div className="bg-white/40 dark:bg-neutral-950/40 backdrop-blur-3xl border border-white dark:border-white/5 rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-700">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 border-b border-outline-variant/10 bg-white/20 dark:bg-white/5">
                <th className="p-10 w-12 text-center">
                  <input type="checkbox" checked={selectedUsers.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="w-6 h-6 rounded-xl border-outline-variant/30 text-primary focus:ring-primary/20 bg-white dark:bg-white/5 transition-all cursor-pointer" />
                </th>
                <th className="p-10 font-black">Identity Signature</th>
                <th className="p-10 font-black">Comm Channel</th>
                <th className="p-10 font-black text-center">System UID</th>
                <th className="p-10 font-black">Temporal Status</th>
                <th className="p-10 font-black text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filtered.map((user) => (
                <tr key={user.id} className="group hover:bg-white dark:hover:bg-white/[0.02] transition-all duration-500">
                  <td className="p-10 text-center">
                    <input type="checkbox" checked={selectedUsers.has(user.id)} onChange={() => toggleSelect(user.id)} className="w-6 h-6 rounded-xl border-outline-variant/30 text-primary focus:ring-primary/20 bg-white dark:bg-white/5 transition-all cursor-pointer" />
                  </td>
                  
                  {/* Name & Role */}
                  <td className="p-10">
                    <div className="flex items-center gap-6">
                      <div className="relative group/avatar">
                        <div className="w-16 h-16 rounded-[1.75rem] bg-gradient-to-br from-primary/10 via-white to-secondary/10 dark:from-primary/20 dark:via-neutral-900 dark:to-secondary/20 flex items-center justify-center font-black text-primary text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-700 border border-white dark:border-white/5 shadow-xl shadow-black/[0.02]">
                          {(user.full_name ?? "?")[0].toUpperCase()}
                        </div>
                        {user.is_active && <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-[6px] border-white dark:border-neutral-950 shadow-lg" />}
                      </div>
                      <div className="flex flex-col">
                        {editingId === user.id ? (
                          <input
                            autoFocus
                            className="bg-surface-container-low dark:bg-white/5 rounded-xl px-5 py-3 text-sm font-black border border-primary/30 focus:ring-8 focus:ring-primary/5 w-64 transition-all"
                            value={editData.full_name}
                            onChange={(e) => setEditData((p) => ({ ...p, full_name: e.target.value }))}
                          />
                        ) : (
                          <span className="font-black text-xl text-on-surface tracking-tighter group-hover:text-primary transition-colors duration-500">{user.full_name ?? "—"}</span>
                        )}
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 mt-1">{user.role}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-10">
                    <div className="flex flex-col">
                       <span className="text-[13px] font-black text-on-surface/70">{user.email ?? "—"}</span>
                       <span className="text-[9px] font-black uppercase tracking-widest text-primary/40 mt-1.5 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/30" /> Verified Payload
                       </span>
                    </div>
                  </td>
                  
                  <td className="p-10">
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-[10px] font-black tracking-[0.2em] text-on-surface dark:text-primary-fixed bg-on-surface/5 dark:bg-primary/10 px-4 py-2 rounded-xl border border-outline-variant/10">
                        {user.id.substring(0,8).toUpperCase()}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-10">
                    <div className={`px-6 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 w-max shadow-sm transition-all duration-500 ${user.is_active ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200/50 dark:border-green-500/20" : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-500/20"}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${user.is_active ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]" : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]"}`} />
                      {user.is_active ? "Authorized" : "Suspended"}
                    </div>
                  </td>

                  {/* Operations */}
                  <td className="p-10 text-right">
                    <div className="flex justify-end gap-4 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-500">
                      {editingId === user.id ? (
                        <div className="flex gap-3">
                          <button onClick={() => saveEdit(user.id)} disabled={loading === user.id} className="px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/20">Authorize</button>
                          <button onClick={() => setEditingId(null)} className="px-8 py-3 bg-on-surface/5 text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-on-surface/10 transition-all">Abort</button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => setShowReset(user.id)} title="Reset Security Key"
                            className="w-14 h-14 rounded-2xl bg-on-surface/5 dark:bg-white/5 shadow-sm hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-500 group/btn">
                            <span className="material-symbols-outlined text-[1.5rem] group-hover/btn:rotate-90 transition-transform">key</span>
                          </button>
                          <button onClick={() => startEdit(user)} title="Modify Signature"
                            className="w-14 h-14 rounded-2xl bg-on-surface/5 dark:bg-white/5 shadow-sm hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-500 group/btn">
                            <span className="material-symbols-outlined text-[1.5rem] group-hover/btn:scale-110 transition-transform">edit_square</span>
                          </button>
                          <button onClick={() => toggleActive(user)} disabled={loading === user.id}
                            title={user.is_active ? "Revoke Access" : "Grant Access"}
                            className={`w-14 h-14 rounded-2xl bg-on-surface/5 dark:bg-white/5 shadow-sm flex items-center justify-center transition-all duration-500 group/btn ${user.is_active ? "hover:bg-red-500 hover:text-white" : "hover:bg-green-600 hover:text-white"}`}>
                            <span className="material-symbols-outlined text-[1.5rem] font-black">{user.is_active ? "security_update_warning" : "verified_user"}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filtered.length === 0 && (
          <div className="text-center py-48 group">
            <div className="relative inline-block mb-10">
               <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                  <span className="material-symbols-outlined text-7xl text-primary/20">person_search</span>
               </div>
               <div className="absolute -top-2 -right-2 w-10 h-10 bg-white dark:bg-neutral-900 rounded-2xl flex items-center justify-center shadow-xl border border-outline-variant/10">
                  <span className="material-symbols-outlined text-xl text-primary animate-pulse">priority_high</span>
               </div>
            </div>
            <h4 className="serif text-4xl font-black text-on-surface tracking-tight mb-4">Zero Matches Found</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 max-w-sm mx-auto leading-relaxed">System scan complete. No identities matching your current search parameters were detected.</p>
          </div>
        )}
      </div>
    </div>
  );
}