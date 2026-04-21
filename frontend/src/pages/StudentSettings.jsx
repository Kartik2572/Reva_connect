import { useState, useEffect } from "react";
import DarkModeToggle from "../components/DarkModeToggle.jsx";
import { updateUserProfile } from "../services/api";

const StudentSettings = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    branch: user?.branch || ""
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await updateUserProfile(formData);
      if (response.data) {
        // Update localStorage with new user data
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setMessage({ type: "success", text: "Profile updated successfully!" });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Student Settings
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Configure your notification preferences and update your profile.
          </p>
        </header>

        <div className="space-y-6">
          {/* Profile Section */}
          <section className="card p-6">
            <h3 className="card-title mb-4">Profile Information</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science, Electronics, Mechanical"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {message.text && (
                <div className={`p-3 rounded-md ${message.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>

          <DarkModeToggle />
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;

