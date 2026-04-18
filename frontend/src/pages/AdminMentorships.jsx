import { useEffect, useState, useCallback } from "react";
import { fetchAllMentorshipRequests, updateMentorshipRequest } from "../services/api.js";

const AdminMentorships = () => {
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchAllMentorshipRequests()
      .then((res) => setMentorshipRequests(res.data?.data || []))
      .catch(() => {
        setMentorshipRequests([]);
        setError("Unable to load mentorship requests.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSetStatus = (id, status) => {
    setBusyId(id);
    updateMentorshipRequest(id, { status })
      .then(() => {
        setMentorshipRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Update failed.");
      })
      .finally(() => setBusyId(null));
  };

  const pendingCount = mentorshipRequests.filter((r) => r.status === "Pending").length;
  const acceptedCount = mentorshipRequests.filter((r) => r.status === "Accepted").length;

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Mentorship Requests</h2>
          <p className="text-sm text-gray-600">
            All mentorship requests from the database. Alumni actions and admin overrides share the
            same status field.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="card border-l-4 border-l-[#F37021] p-4 text-center">
            <p className="text-xs font-medium text-gray-500">Total requests</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{mentorshipRequests.length}</p>
          </div>
          <div className="card border-l-4 border-l-yellow-400 p-4 text-center">
            <p className="text-xs font-medium text-gray-500">Pending</p>
            <p className="mt-2 text-2xl font-semibold text-yellow-600">{pendingCount}</p>
          </div>
          <div className="card border-l-4 border-l-green-400 p-4 text-center">
            <p className="text-xs font-medium text-gray-500">Accepted</p>
            <p className="mt-2 text-2xl font-semibold text-green-600">{acceptedCount}</p>
          </div>
        </div>

        <section className="card p-4">
          <div className="card-header">
            <h3 className="card-title">All mentorship requests</h3>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <p className="py-6 text-sm text-gray-600">Loading…</p>
            ) : (
              <table className="min-w-full text-left text-xs text-gray-600">
                <thead className="border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Alumni mentor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Request date</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mentorshipRequests.map((req) => (
                    <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {req.studentName || "—"}
                        <div className="text-xs font-normal text-gray-500">{req.studentEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {req.mentorName || "—"}
                        {req.mentorCompany ? (
                          <div className="text-xs text-gray-500">{req.mentorCompany}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge ${
                            req.status === "Pending"
                              ? "border border-yellow-200 bg-yellow-100 text-yellow-800"
                              : req.status === "Accepted"
                                ? "border border-green-200 bg-green-100 text-green-800"
                                : "border border-red-200 bg-red-100 text-red-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {req.createdAt
                          ? new Date(req.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })
                          : "—"}
                      </td>
                      <td className="space-x-2 px-4 py-3">
                        {req.status === "Pending" && (
                          <>
                            <button
                              type="button"
                              disabled={busyId === req.id}
                              onClick={() => handleSetStatus(req.id, "Accepted")}
                              className="btn-ghost px-3 py-1 text-[11px] text-green-600"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              disabled={busyId === req.id}
                              onClick={() => handleSetStatus(req.id, "Rejected")}
                              className="btn-ghost px-3 py-1 text-[11px] text-red-600"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {req.status !== "Pending" && <span className="text-xs text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && mentorshipRequests.length === 0 && (
              <p className="py-6 text-sm text-gray-500">No mentorship requests in the database yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminMentorships;
