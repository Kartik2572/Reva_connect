import { useCallback, useEffect, useState } from "react";
import {
  fetchJobReferrals,
  fetchJobApplicationsForStudent,
  createJobApplication
} from "../services/api.js";

const StudentJobs = () => {
  const [referrals, setReferrals] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = user.id;

  const loadData = useCallback(async () => {
    if (!studentId) {
      setReferrals([]);
      setApplications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [refRes, appRes] = await Promise.all([
        fetchJobReferrals(studentId),
        fetchJobApplicationsForStudent(studentId)
      ]);
      setReferrals(refRes.data?.data || []);
      setApplications(appRes.data?.data || []);
    } catch {
      setReferrals([]);
      setApplications([]);
      setError("Could not load job referrals or your applications.");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApply = async (jobId) => {
    if (!studentId) return;
    setApplyingId(jobId);
    try {
      const res = await createJobApplication({
        student_id: studentId,
        job_referral_id: jobId
      });
      const created = res.data?.data;
      setReferrals((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, hasApplied: true } : j))
      );
      if (created) {
        setApplications((prev) => {
          const exists = prev.some((a) => a.jobReferralId === created.jobReferralId);
          if (exists) {
            return prev.map((a) =>
              a.jobReferralId === created.jobReferralId ? { ...a, ...created } : a
            );
          }
          return [created, ...prev];
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Could not submit application.");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Job Referrals</h2>
          <p className="text-sm text-gray-600">
            Browse alumni-posted roles. Use Apply to record your interest; the button switches to
            Applied once it is stored for your account.
          </p>
        </header>

        {!studentId && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Sign in as a student to see referrals and track applications.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <section className="card mb-8 p-6">
          <h3 className="card-title mb-4">Open referrals</h3>
          {!studentId ? (
            <p className="text-sm text-gray-500">Sign in as a student to browse referrals.</p>
          ) : loading ? (
            <p className="text-sm text-gray-600">Loading…</p>
          ) : referrals.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
              No job referrals yet. Check back after alumni post openings.
            </p>
          ) : (
            <ul className="space-y-4">
              {referrals.map((job) => (
                <li
                  key={job.id}
                  className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{job.jobTitle}</h4>
                      <p className="text-sm text-gray-600">
                        {[job.company, job.location].filter(Boolean).join(" · ") || "—"}
                      </p>
                      {job.alumniName && (
                        <p className="mt-1 text-xs text-gray-400">From {job.alumniName}</p>
                      )}
                      {job.description && (
                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{job.description}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                      {job.jobLink && (
                        <a
                          href={job.jobLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                        >
                          View posting
                        </a>
                      )}
                      {job.hasApplied ? (
                        <span className="inline-flex justify-center rounded-md bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 ring-1 ring-inset ring-green-200">
                          Applied
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={!studentId || applyingId === job.id}
                          onClick={() => handleApply(job.id)}
                          className="inline-flex justify-center rounded-md bg-[#F37021] px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {applyingId === job.id ? "Applying…" : "Apply"}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6">
          <h3 className="card-title mb-4">My applications</h3>
          <p className="mb-4 text-sm text-gray-600">
            Your saved applications and their current status.
          </p>
          {!studentId ? (
            <p className="text-sm text-gray-500">Sign in to see your applications.</p>
          ) : loading ? (
            <p className="text-sm text-gray-600">Loading…</p>
          ) : applications.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
              You have not applied to any referrals yet. Use <strong>Apply</strong> on a listing
              above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-gray-700">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Job title</th>
                    <th className="px-3 py-2">Company</th>
                    <th className="px-3 py-2">Alumni</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100">
                      <td className="px-3 py-3 font-medium text-gray-900">{row.jobTitle}</td>
                      <td className="px-3 py-3">{row.company || "—"}</td>
                      <td className="px-3 py-3">{row.alumniName || "—"}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            String(row.status).toLowerCase() === "applied"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500">
                        {row.createdAt
                          ? new Date(row.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentJobs;
