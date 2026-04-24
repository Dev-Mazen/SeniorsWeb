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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-4xl font-bold text-on-surface serif tracking-tight">Students Management</h2>
          <p className="text-on-surface-variant font-medium mt-1">{users.length} registered accounts</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input
              className="pl-9 pr-4 py-2.5 bg-surface-container-high rounded-full border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 text-sm w-64 transition-all"
              placeholder="Search by name, email, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-surface-container-high rounded-full p-1 border border-outline-variant/20">
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${statusFilter === f ? "bg-primary text-white shadow-md shadow-primary/20" : "text-on-surface-variant hover:bg-surface-variant"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-2 bg-stone-900 text-white rounded-full font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Add Student
          </button>
        </div>
      </header>
      
      {actionNotice && (
        <div className="mb-4 animate-in slide-in-from-top-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm font-semibold px-4 py-3">
          <span className="material-symbols-outlined">check_circle</span>
          {actionNotice}
        </div>
      )}

      {/* Bulk Actions Panel */}
      {selectedUsers.size > 0 && (
        <div className="mb-4 bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-bottom-2">
          <div className="text-sm font-bold text-primary">
            {selectedUsers.size} students selected
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white text-on-surface text-xs font-bold rounded-full shadow-sm hover:bg-surface-variant">Bulk Activate</button>
            <button className="px-4 py-2 bg-white text-on-surface text-xs font-bold rounded-full shadow-sm hover:bg-surface-variant">Bulk Deactivate</button>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showReset && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95">
            <h3 className="serif text-2xl font-bold text-on-surface mb-2">Reset Password</h3>
            <p className="text-sm text-on-surface-variant mb-6">Enter a new secure password for this student. They will be logged out of active sessions.</p>
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <input
                  required
                  type="password"
                  minLength={6}
                  className="w-full px-4 py-3 bg-surface-container-high rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  placeholder="New password (min 6 chars)"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading === "reset-" + showReset} className="flex-1 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center">
                  {loading === "reset-" + showReset ? "Resetting..." : "Confirm Reset"}
                </button>
                <button type="button" onClick={() => { setShowReset(null); setResetPassword(""); }} className="px-6 py-3 bg-surface-container text-on-surface font-bold text-sm rounded-full hover:bg-surface-variant transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[2rem] shadow-sm overflow-hidden editorial-shadow">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low/50">
            <tr className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70 border-b border-surface-variant">
              <th className="p-4 pl-6 w-12">
                <input type="checkbox" checked={selectedUsers.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded border-outline-variant/40 text-primary focus:ring-primary/20" />
              </th>
              <th className="p-4">Student</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Access Code</th>
              <th className="p-4">Last Seen</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right pr-6">Management</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-surface-container-low hover:bg-surface-container-low/50 transition-colors group">
                <td className="p-4 pl-6">
                  <input type="checkbox" checked={selectedUsers.has(user.id)} onChange={() => toggleSelect(user.id)} className="rounded border-outline-variant/40 text-primary focus:ring-primary/20" />
                </td>
                
                {/* Name */}
                <td className="p-4">
                  {editingId === user.id ? (
                    <input
                      autoFocus
                      className="bg-white rounded-lg px-3 py-2 text-sm border focus:border-primary focus:ring-2 focus:ring-primary/20 w-full"
                      value={editData.full_name}
                      onChange={(e) => setEditData((p) => ({ ...p, full_name: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm flex-shrink-0">
                        {(user.full_name ?? "?")[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-on-surface">{user.full_name ?? "—"}</span>
                        <span className="text-xs text-on-surface-variant font-medium">{user.role.toUpperCase()}</span>
                      </div>
                    </div>
                  )}
                </td>

                <td className="p-4 text-on-surface-variant text-sm font-medium">{user.email ?? "—"}</td>
                
                <td className="p-4">
                  <span className="font-mono text-xs font-bold text-on-surface bg-surface-container-high px-2 py-1 rounded">
                    {user.id.substring(0,8).toUpperCase()}
                  </span>
                </td>

                <td className="p-4 text-on-surface-variant text-xs font-medium">
                  {new Date(user.updated_at).toLocaleDateString()}
                </td>

                {/* Status */}
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 w-max ${user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`} />
                    {user.is_active ? "Active" : "Disabled"}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-4 pr-6">
                  <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === user.id ? (
                      <>
                        <button onClick={() => saveEdit(user.id)} disabled={loading === user.id} title="Save" className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90">Save</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-lg">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setShowReset(user.id)} title="Reset Password"
                          className="w-8 h-8 rounded-full bg-surface-container shadow-sm hover:bg-surface-variant flex items-center justify-center transition-all text-on-surface">
                          <span className="material-symbols-outlined text-[1rem]">key</span>
                        </button>
                        <button onClick={() => startEdit(user)} title="Edit Student"
                          className="w-8 h-8 rounded-full bg-surface-container shadow-sm hover:bg-surface-variant flex items-center justify-center transition-all text-on-surface">
                          <span className="material-symbols-outlined text-[1rem]">edit</span>
                        </button>
                        <button onClick={() => toggleActive(user)} disabled={loading === user.id}
                          title={user.is_active ? "Disable Account (Force Logout)" : "Enable Account"}
                          className={`w-8 h-8 rounded-full bg-surface-container shadow-sm flex items-center justify-center transition-all ${user.is_active ? "hover:bg-red-100 text-red-600" : "hover:bg-green-100 text-green-600"}`}>
                          <span className="material-symbols-outlined text-[1rem]">{user.is_active ? "person_off" : "how_to_reg"}</span>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl opacity-20 mb-2 block">search_off</span>
            <p className="font-bold">No students found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}