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

  // Add user modal
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [newPassword, setNewPassword] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const filtered = users.filter(
    (u) =>
      (
        (u.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email ?? "").toLowerCase().includes(search.toLowerCase())
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
    setActionNotice("User profile updated.");
    setTimeout(() => setActionNotice(""), 2500);
    setEditingId(null);
    setLoading(null);
  }

  async function toggleActive(user: Profile) {
    setLoading(user.id);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ is_active: !user.is_active })
      .eq("id", user.id);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u)));
    setActionNotice(`User ${user.is_active ? "deactivated" : "activated"}.`);
    setTimeout(() => setActionNotice(""), 2500);
    setLoading(null);
  }

  async function deleteUser(user: Profile) {
    if (!confirm(`Delete "${user.full_name ?? user.email}"? This action cannot be undone.`)) return;
    setLoading(user.id);
    const supabase = createClient();
    await supabase.from("profiles").delete().eq("id", user.id);
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setActionNotice("User deleted.");
    setTimeout(() => setActionNotice(""), 2500);
    setLoading(null);
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, password: newPassword, full_name: newName, role: newRole }),
      });
      const json = await res.json();

      if (json.error?.message) {
        setAddError(json.error.message);
      } else {
        if (json.note) setAddSuccess(json.note);
        // Refresh user list
        const supabase = createClient();
        const { data: updated } = await supabase.from("profiles").select("*").order("full_name");
        if (updated) setUsers(updated as Profile[]);
        if (!json.note) {
          setShowAdd(false);
          setNewEmail(""); setNewName(""); setNewPassword(""); setNewRole("student");
        }
      }
    } catch (err: any) {
      setAddError(err.message ?? "Unknown error");
    }
    setAddLoading(false);
  }

  function closeAddModal() {
    setShowAdd(false);
    setAddError("");
    setAddSuccess("");
    setNewEmail(""); setNewName(""); setNewPassword(""); setNewRole("student");
  }

  return (
    <div>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-on-surface" style={{ fontFamily: "'Noto Serif', serif" }}>
            User Directory
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">{users.length} total accounts</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm pointer-events-none">search</span>
            <input
              className="pl-9 pr-4 py-2.5 bg-surface-container-high rounded-full border-none focus:ring-2 focus:ring-primary/20 text-sm w-56"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center rounded-full bg-surface-container-high p-1">
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${statusFilter === f ? "bg-primary text-white" : "text-on-surface-variant"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/90 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Add User
          </button>
        </div>
      </header>
      {actionNotice && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm font-semibold px-4 py-3">
          {actionNotice}
        </div>
      )}

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-xl font-bold text-on-surface mb-6">Add New User</h3>
            {addSuccess ? (
              <div className="text-center space-y-4">
                <span className="material-symbols-outlined text-5xl text-green-600 block">check_circle</span>
                <p className="text-sm text-on-surface-variant leading-relaxed">{addSuccess}</p>
                <button
                  onClick={closeAddModal}
                  className="w-full py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/90 transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 mb-1 block">Full Name</label>
                  <input
                    autoFocus
                    required
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    placeholder="Jane Smith"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 mb-1 block">Email</label>
                  <input
                    required
                    type="email"
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    placeholder="jane@school.edu"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 mb-1 block">Password</label>
                  <input
                    required
                    type="password"
                    minLength={6}
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 mb-1 block">Role</label>
                  <select
                    className="w-full px-4 py-3 bg-surface-container-high rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {addError && (
                  <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{addError}</p>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="flex-1 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {addLoading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                    {addLoading ? "Creating..." : "Create User"}
                  </button>
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="px-6 py-3 bg-surface-container-high rounded-full font-bold text-sm hover:bg-surface-container transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-black uppercase tracking-widest text-on-surface-variant/50 border-b border-surface-variant">
              <th className="p-5">Student</th>
              <th className="p-5">Email</th>
              <th className="p-5">Role</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-surface-container-low hover:bg-surface-container-low transition-colors">
                {/* Name */}
                <td className="p-5">
                  {editingId === user.id ? (
                    <input
                      autoFocus
                      className="bg-surface-container-high rounded-lg px-3 py-2 text-sm border-none focus:ring-2 focus:ring-primary/20 w-full"
                      value={editData.full_name}
                      onChange={(e) => setEditData((p) => ({ ...p, full_name: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm flex-shrink-0">
                        {(user.full_name ?? "?")[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-sm">{user.full_name ?? "—"}</span>
                    </div>
                  )}
                </td>
                {/* Email */}
                <td className="p-5 text-on-surface-variant text-sm">{user.email ?? "—"}</td>
                {/* Role */}
                <td className="p-5">
                  {editingId === user.id ? (
                    <select
                      className="bg-surface-container-high rounded-lg px-3 py-2 text-sm border-none focus:ring-2 focus:ring-primary/20"
                      value={editData.role}
                      onChange={(e) => setEditData((p) => ({ ...p, role: e.target.value }))}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${user.role === "admin" ? "bg-secondary/10 text-secondary" : "bg-surface-container-high text-on-surface-variant"}`}>
                      {user.role.toUpperCase()}
                    </span>
                  )}
                </td>
                {/* Status */}
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {user.is_active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                {/* Actions */}
                <td className="p-5">
                  <div className="flex justify-end gap-1">
                    {editingId === user.id ? (
                      <>
                        <button onClick={() => saveEdit(user.id)} disabled={loading === user.id} title="Save"
                          className="w-8 h-8 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full flex items-center justify-center transition-all">
                          <span className="material-symbols-outlined text-sm">check</span>
                        </button>
                        <button onClick={() => setEditingId(null)} title="Cancel"
                          className="w-8 h-8 bg-surface-container-high rounded-full flex items-center justify-center hover:bg-surface-container transition-all">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(user)} title="Edit name & role"
                          className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-all text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => toggleActive(user)} disabled={loading === user.id}
                          title={user.is_active ? "Deactivate" : "Activate"}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${user.is_active ? "hover:bg-red-50 text-red-400" : "hover:bg-green-50 text-green-600"}`}>
                          <span className="material-symbols-outlined text-sm">{user.is_active ? "person_off" : "person"}</span>
                        </button>
                        <button onClick={() => deleteUser(user)} disabled={loading === user.id} title="Delete user"
                          className="w-8 h-8 rounded-full hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">delete</span>
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
          <div className="text-center py-16 text-on-surface-variant">No users found.</div>
        )}
      </div>
    </div>
  );
}