"use client";

import { useState, useEffect } from "react";
import { WindowBox } from "@/components/WindowBox";
import { useLanguage } from "@/components/LanguageProvider";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLES = ["USER", "MAJLIS", "ADMIN"];

export default function AdminDashboard() {
  const { t } = useLanguage();
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
        setError(t('admin.access_denied'));
      }
    } catch (err) {
      setError(t('common.error'));
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
        setMessage(t('admin.date_updated'));
      } else {
        const data = await res.json();
        setError(data.error || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleRegenerateCalendar = async () => {
    if (!confirm(t('admin.regenerate_confirm'))) {
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
        setMessage(`${t('admin.calendar_regenerated')} ${data.count}`);
      } else {
        const data = await res.json();
        setError(data.error || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
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
        setMessage(t('admin.user_created'));
        fetchUsers();
        setNewUser({
          name: "",
          email: "",
          password: "",
          role: "USER",
        });
      } else {
        const data = await res.json();
        setError(data.error || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
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
        setMessage(t('admin.user_updated'));
        setEditingId(null);
        setEditUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm(t('admin.delete_confirm'))) return;

    setMessage("");
    setError("");

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage(t('admin.user_deleted'));
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  if (loading) {
    return (
      <WindowBox title={t('common.loading')}>
        <div className="text-center py-8">{t('common.loading')}</div>
      </WindowBox>
    );
  }

  return (
    <div className="space-y-4">
      <WindowBox title={t('admin.title')}>
        <p className="text-sm text-gray-600">
          {t('admin.desc')}
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
      <WindowBox title={t('admin.ramadan_settings')}>
        <form onSubmit={handleUpdateSettings} className="space-y-4">
          <div>
            <label className="block font-bold mb-1">{t('admin.ramadan_start')}</label>
            <input
              type="date"
              value={ramadanStartDate}
              onChange={(e) => setRamadanStartDate(e.target.value)}
              className="win-input"
              required
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('admin.ramadan_start_desc')}
            </p>
          </div>

          <div className="flex gap-2">
            <button 
              type="submit" 
              className="win-button"
              disabled={settingsLoading}
            >
              {t('admin.save_date')}
            </button>

            <button
              type="button"
              onClick={handleRegenerateCalendar}
              className="win-button bg-orange-200 hover:bg-orange-300 dark:bg-orange-800"
              disabled={settingsLoading}
            >
              {t('admin.regenerate')}
            </button>
          </div>

          <div className="win-box bg-yellow-50 dark:bg-yellow-950 p-3 text-sm text-yellow-800 dark:text-yellow-200">
            <strong>⚠️</strong> {t('admin.regenerate_warn')}
          </div>
        </form>
      </WindowBox>

      {/* Create New User */}
      <WindowBox title={t('admin.create_user')}>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold mb-1">{t('admin.name')}</label>
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
              <label className="block font-bold mb-1">{t('admin.email')}</label>
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
              <label className="block font-bold mb-1">{t('admin.password')}</label>
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
              <label className="block font-bold mb-1">{t('admin.role')}</label>
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
            {t('admin.create_btn')}
          </button>
        </form>
      </WindowBox>

      {/* Existing Users */}
      <WindowBox title={t('admin.users_list')}>
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="win-table">
              <thead>
                <tr>
                  <th>{t('admin.name_col')}</th>
                  <th>{t('admin.email_col')}</th>
                  <th>{t('admin.role_col')}</th>
                  <th>{t('admin.created_col')}</th>
                  <th>{t('admin.actions_col')}</th>
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
                            placeholder={t('admin.new_password')}
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
          <p className="text-center text-gray-500 py-4">{t('admin.no_users')}</p>
        )}
      </WindowBox>

      {/* Role Descriptions */}
      <WindowBox title={t('admin.role_info')}>
        <div className="space-y-2 text-sm">
          <div className="border border-black dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800">
            <strong>USER:</strong> {t('admin.role_user')}
          </div>
          <div className="border border-black dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800">
            <strong>MAJLIS:</strong> {t('admin.role_majlis')}
          </div>
          <div className="border border-black dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800">
            <strong>ADMIN:</strong> {t('admin.role_admin')}
          </div>
        </div>
      </WindowBox>
    </div>
  );
}
