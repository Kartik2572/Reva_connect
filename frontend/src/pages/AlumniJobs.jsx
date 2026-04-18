import { useCallback, useEffect, useState } from "react";
import { createJobReferral, fetchJobReferrals } from "../services/api.js";

const emptyForm = {
  job_title: "",
  company: "",
  description: "",
  location: "",
  job_link: ""
};

const AlumniJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const alumniId = user.alumniId;

  const fetchJobs = useCallback(async () => {
    setLoadingList(true);
    setError("");
    try {
      const res = await fetchJobReferrals();
      setJobs(res.data?.data || []);
    } catch {
      setJobs([]);
      setError("Could not load job referrals.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!alumniId) {
      alert("Your alumni profile id is missing. Please log out and log in again.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createJobReferral({
        alumni_id: alumniId,
        job_title: formData.job_title.trim(),
        company: formData.company.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        job_link: formData.job_link.trim()
      });

      const created = res.data?.data;
      if (created) {
        setJobs((prev) => [created, ...prev]);
      }
      setFormData({ ...emptyForm });
      alert("Job posted successfully");
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Error posting job";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Job Referrals</h2>
          <p className="text-sm text-gray-600">
            Post roles you can refer students for. New listings appear below immediately—no refresh
            needed.
          </p>
        </header>

        {!alumniId && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Log out and log in once so your alumni profile id is available for posting referrals.
          </div>
        )}

        <section className="card mb-8 p-6">
          <h3 className="card-title mb-4">Post a referral</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="job_title" className="block text-xs font-medium text-gray-700">
                  Job title <span className="text-red-500">*</span>
                </label>
                <input
                  id="job_title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
                  placeholder="e.g. Software Engineer I"
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-xs font-medium text-gray-700">
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
                  placeholder="e.g. Acme Corp"
                />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-xs font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
                placeholder="Role summary, stack, seniority…"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="location" className="block text-xs font-medium text-gray-700">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
                  placeholder="e.g. Bangalore / Remote"
                />
              </div>
              <div>
                <label htmlFor="job_link" className="block text-xs font-medium text-gray-700">
                  Job link
                </label>
                <input
                  id="job_link"
                  name="job_link"
                  type="url"
                  value={formData.job_link}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
                  placeholder="https://…"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting || !alumniId}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Posting…" : "Post referral"}
              </button>
            </div>
          </form>
        </section>

        <section className="card p-6">
          <h3 className="card-title mb-4">Posted referrals</h3>
          {error && (
            <p className="mb-4 text-sm text-red-600">{error}</p>
          )}
          {loadingList ? (
            <p className="text-sm text-gray-600">Loading…</p>
          ) : jobs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
              No jobs yet. Use the form above to add your first referral.
            </p>
          ) : (
            <ul className="space-y-4">
              {jobs.map((job) => (
                <li
                  key={job.id}
                  className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{job.jobTitle}</h4>
                      <p className="text-sm text-gray-600">
                        {[job.company, job.location].filter(Boolean).join(" · ") || "—"}
                      </p>
                      {job.alumniName && (
                        <p className="mt-1 text-xs text-gray-400">Posted by {job.alumniName}</p>
                      )}
                    </div>
                    {job.jobLink && (
                      <a
                        href={job.jobLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#F37021] px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                      >
                        Apply
                      </a>
                    )}
                  </div>
                  {job.description && (
                    <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{job.description}</p>
                  )}
                  {job.createdAt && (
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(job.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default AlumniJobs;
