"use client";

import { useState, useEffect } from "react";
import { WindowBox } from "@/components/WindowBox";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLES = ["USER", "MAJLIS_CONTROLLER", "MAJLIS", "ADMIN", "CUSTOM_ROLE"];

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Settings state
  const [ramadanStartDate, setRamadanStartDate] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<Partial<User> & { password?: string } | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        const date = new Date(data.ramadanStartDate);
        setRamadanStartDate(date.toISOString().split('T')[0]);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else if (res.status === 403) {
        setError("Access denied. Admin privileges required.");
      }
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSettingsLoading(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ramadanStartDate: new Date(ramadanStartDate).toISOString() }),
      });

      if (res.ok) {
        setMessage("Ramadan start date updated successfully");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update settings");
      }
    } catch (err) {
      setError("Failed to update settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleRegenerateCalendar = async () => {
    if (!confirm("This will delete all existing schedules and generate a new 30-day calendar. Continue?")) {
      return;
    }

    setMessage("");
    setError("");
    setSettingsLoading(true);

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate: true }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(`Calendar regenerated successfully! Created ${data.count} schedules.`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to regenerate calendar");
      }
    } catch (err) {
      setError("Failed to regenerate calendar");
    } finally {
      setSettingsLoading(false);
    }
  };
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        setMessage("User created successfully");
        fetchUsers();
        setNewUser({
          name: "",
          email: "",
          password: "",
          role: "USER",
        });
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create user");
      }
    } catch (err) {
      setError("Failed to create user");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editUser) return;

    setMessage("");
    setError("");

    try {
      const res = await fetch(`/api/users/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUser),
      });

      if (res.ok) {
        setMessage("User updated successfully");
        setEditingId(null);
        setEditUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update user");
      }
    } catch (err) {
      setError("Failed to update user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setMessage("");
    setError("");

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage("User deleted successfully");
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete user");
      }
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <WindowBox title="Loading...">
        <div className="text-center py-8">Loading admin panel...</div>
      </WindowBox>
    );
  }

  return (
    <div className="space-y-4">
      <WindowBox title="👥 Admin Dashboard - User Management">
        <p className="text-sm text-gray-600">
          Create, edit, and manage user accounts and roles.
        </p>
      </WindowBox>

      {message && (
        <div className="border-2 border-green-600 bg-green-100 p-3 text-green-800">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="border-2 border-red-600 bg-red-100 p-3 text-red-800">
          ⚠️ {error}
        </div>
      )}

      {/* Ramadan Settings */}
      <WindowBox title="📅 Ramadan Calendar Settings">
        <form onSubmit={handleUpdateSettings} className="space-y-4">
          <div>
            <label className="block font-bold mb-1">Ramadan Start Date:</label>
            <input
              type="date"
              value={ramadanStartDate}
              onChange={(e) => setRamadanStartDate(e.target.value)}
              className="win-input"
              required
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              The first day of Ramadan. Calendar automatically generates 30 days from this date.
            </p>
          </div>

          <div className="flex gap-2">
            <button 
              type="submit" 
              className="win-button"
              disabled={settingsLoading}
            >
              💾 Save Start Date
            </button>

            <button
              type="button"
              onClick={handleRegenerateCalendar}
              className="win-button bg-orange-200 hover:bg-orange-300 dark:bg-orange-800"
              disabled={settingsLoading}
            >
              🔄 Regenerate Full Calendar (30 Days)
            </button>
          </div>

          <div className="win-box bg-yellow-50 dark:bg-yellow-950 p-3 text-sm text-yellow-800 dark:text-yellow-200">
            <strong>⚠️ Warning:</strong> Regenerating the calendar will delete all existing schedules
            and create a new 30-day schedule with 2 juz per day, completing the Quran twice.
          </div>
        </form>
      </WindowBox>

      {/* Create New User */}
      <WindowBox title="➕ Create New User">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold mb-1">Name:</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="win-input w-full"
                required
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Email:</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="win-input w-full"
                required
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Password:</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="win-input w-full"
                required
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Role:</label>
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="win-select w-full"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="win-button">
            ➕ Create User
          </button>
        </form>
      </WindowBox>

      {/* Existing Users */}
      <WindowBox title="📋 Existing Users">
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="win-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    {editingId === user.id ? (
                      <>
                        <td>
                          <input
                            type="text"
                            value={editUser?.name || ""}
                            onChange={(e) =>
                              setEditUser({ ...editUser!, name: e.target.value })
                            }
                            className="win-input w-full"
                          />
                        </td>
                        <td>
                          <input
                            type="email"
                            value={editUser?.email || ""}
                            onChange={(e) =>
                              setEditUser({
                                ...editUser!,
                                email: e.target.value,
                              })
                            }
                            className="win-input w-full"
                          />
                        </td>
                        <td>
                          <select
                            value={editUser?.role || ""}
                            onChange={(e) =>
                              setEditUser({ ...editUser!, role: e.target.value })
                            }
                            className="win-select w-full"
                          >
                            {ROLES.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="password"
                            placeholder="New password (optional)"
                            onChange={(e) =>
                              setEditUser({
                                ...editUser!,
                                password: e.target.value,
                              })
                            }
                            className="win-input w-full"
                          />
                        </td>
                        <td>
                          <button
                            onClick={handleUpdateUser}
                            className="win-button text-sm mr-1"
                          >
                            💾
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditUser(null);
                            }}
                            className="win-button text-sm"
                          >
                            ✕
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="font-bold">{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className="bg-gray-200 px-2 py-1 border border-black text-sm">
                            {user.role}
                          </span>
                        </td>
                        <td className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setEditingId(user.id);
                              setEditUser({
                                name: user.name,
                                email: user.email,
                                role: user.role,
                              });
                            }}
                            className="win-button text-sm mr-1"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="win-button text-sm"
                          >
                            🗑️
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No users found</p>
        )}
      </WindowBox>

      {/* Role Descriptions */}
      <WindowBox title="ℹ️ Role Descriptions">
        <div className="space-y-2 text-sm">
          <div className="border border-black p-2 bg-gray-50">
            <strong>USER:</strong> Can view calendar and progress (no login
            required for public pages)
          </div>
          <div className="border border-black p-2 bg-gray-50">
            <strong>MAJLIS_CONTROLLER:</strong> Can create/edit calendar,
            update progress
          </div>
          <div className="border border-black p-2 bg-gray-50">
            <strong>MAJLIS:</strong> Can update radio stream URL and live
            status
          </div>
          <div className="border border-black p-2 bg-gray-50">
            <strong>ADMIN:</strong> Full system access, can manage users
          </div>
          <div className="border border-black p-2 bg-gray-50">
            <strong>CUSTOM_ROLE:</strong> Configurable permissions (future
            feature)
          </div>
        </div>
      </WindowBox>
    </div>
  );
}
