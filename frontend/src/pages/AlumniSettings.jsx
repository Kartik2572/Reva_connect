import { useEffect, useState } from "react";
import { fetchAlumnusById, updateAlumnusProfile } from "../services/api.js";
import DarkModeToggle from "../components/DarkModeToggle.jsx";

const AlumniSettings = () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const alumniId = storedUser.alumniId || "";

  const [form, setForm] = useState({
    name: storedUser.name || "",
    email: storedUser.email || "",
    company: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!alumniId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetchAlumnusById(alumniId);
        const alumnus = response.data?.data;
        setForm((prev) => ({
          ...prev,
          company: alumnus?.company || ""
        }));
      } catch (err) {
        console.error("Error fetching alumni profile:", err);
        setError("Unable to load alumni profile details.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [alumniId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!alumniId) {
      setError("No alumni profile available to update.");
      return;
    }

    const payload = {};
    if (form.name.trim()) payload.name = form.name.trim();
    if (form.email.trim()) payload.email = form.email.trim();
    if (form.company.trim()) payload.company = form.company.trim();

    if (!payload.name && !payload.email && !payload.company) {
      setMessage("No changes to save.");
      return;
    }

    setSaving(true);

    try {
      const response = await updateAlumnusProfile(alumniId, payload);
      const updated = response.data?.data;

      const updatedUser = {
        ...storedUser,
        name: payload.name || storedUser.name,
        email: payload.email || storedUser.email
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMessage("Profile updated successfully.");
      setForm((prev) => ({
        ...prev,
        name: updated.name || prev.name,
        email: updatedUser.email,
        company: updated.company || prev.company
      }));
    } catch (err) {
      console.error("Error updating alumni profile:", err);
      setError(err.response?.data?.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Alumni Settings
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Update your account details and toggle dark mode for your session.
          </p>
        </header>

        <div className="space-y-6">
          <DarkModeToggle />

          <section className="card p-6">
            <h3 className="card-title">Profile</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
              Update your name, email, and company information. Changes are synced across the platform.
            </p>

            {loading ? (
              <div className="mt-6 text-sm text-gray-500 dark:text-slate-300">
                Loading profile details...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                    Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-[#F37021] focus:outline-none focus:ring-2 focus:ring-[#F37021]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-[#F37021] focus:outline-none focus:ring-2 focus:ring-[#F37021]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                    Company
                  </label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-[#F37021] focus:outline-none focus:ring-2 focus:ring-[#F37021]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                {message && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-lg bg-[#F37021] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AlumniSettings;

