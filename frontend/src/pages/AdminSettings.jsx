import { useEffect, useState } from "react";
import { updateUserProfile } from "../services/api.js";
import DarkModeToggle from "../components/DarkModeToggle.jsx";
import ChangePassword from "../components/ChangePassword.jsx";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("profile"); // profile, security
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    name: storedUser.name || "",
    email: storedUser.email || ""
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const payload = {};
    if (form.name.trim()) payload.name = form.name.trim();
    if (form.email.trim()) payload.email = form.email.trim();

    if (!payload.name && !payload.email) {
      setMessage("No changes to save.");
      return;
    }

    setSaving(true);

    try {
      const response = await updateUserProfile(payload);
      const updated = response.data?.data;

      const updatedUser = {
        ...storedUser,
        name: payload.name || storedUser.name,
        email: payload.email || storedUser.email
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-slate-950 font-sans min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Admin Settings
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium mt-1">
            Configure your account details and theme preferences.
          </p>
        </header>

        {/* Settings Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Settings Navigation Menu */}
          <aside className="space-y-6 md:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm">
              <div className="px-3 mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Account Settings
                </p>
              </div>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    activeTab === "profile"
                      ? "bg-orange-50 dark:bg-orange-950/20 text-[#F37021] dark:text-orange-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Settings
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("security")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    activeTab === "security"
                      ? "bg-orange-50 dark:bg-orange-950/20 text-[#F37021] dark:text-orange-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Security Settings
                </button>
              </nav>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm">
              <DarkModeToggle />
            </div>
          </aside>

          {/* Settings Content Area */}
          <main className="md:col-span-3">
            {activeTab === "profile" && (
              <section className="card p-6 md:p-8">
                <h3 className="card-title text-xl font-bold mb-2">Profile Information</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                  Update your display name and email address. Changes are synced across the platform.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-[#F37021] focus:ring-2 focus:ring-[#F37021]/10 focus:outline-none transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-[#F37021] focus:ring-2 focus:ring-[#F37021]/10 focus:outline-none transition-all duration-300"
                      required
                    />
                  </div>

                  {message && (
                    <div className="flex items-center gap-3 rounded-2xl p-4 text-sm font-semibold border bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-900/50 dark:text-green-400">
                      <span>✅</span>
                      <p>{message}</p>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-3 rounded-2xl p-4 text-sm font-semibold border bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
                      <span>⚠️</span>
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#F37021] to-orange-500 hover:from-orange-400 hover:to-[#F37021] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                  >
                    {saving ? "Saving changes..." : "Save Changes"}
                  </button>
                </form>
              </section>
            )}

            {activeTab === "security" && (
              <ChangePassword />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
