import { useEffect, useState, useCallback } from "react";
import { fetchMentorshipRequestsForAlumnus, updateMentorshipRequest } from "../services/api.js";

const AlumniMentorships = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const alumniId = user.alumniId;

  const loadRequests = useCallback(() => {
    if (!alumniId) {
      setRequests([]);
      setLoading(false);
      setError(
        "Your alumni profile id was not found. Please log out and log in again so requests can load."
      );
      return;
    }
    setLoading(true);
    setError("");
    fetchMentorshipRequestsForAlumnus(alumniId)
      .then((res) => setRequests(res.data?.data || []))
      .catch(() => {
        setRequests([]);
        setError("Could not load mentorship requests.");
      })
      .finally(() => setLoading(false));
  }, [alumniId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleStatusChange = (id, newStatus) => {
    if (!alumniId) return;
    setBusyId(id);
    updateMentorshipRequest(id, { status: newStatus, mentorId: alumniId })
      .then(() => {
        setRequests((prev) =>
          prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
        );
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Failed to update request.");
      })
      .finally(() => setBusyId(null));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "Accepted":
        return "bg-green-50 text-green-700 border border-green-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Mentorship requests</h2>
          <p className="text-sm text-gray-600">
            Requests from students who chose you as a mentor. Accept or reject each one; status is
            stored for the student and admins to see.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}

        <section className="card p-4">
          {loading ? (
            <p className="text-sm text-gray-600">Loading requests…</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-gray-600">No mentorship requests yet.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="rounded-lg border border-gray-100 bg-white p-4">
                  <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {request.studentName || `Student #${request.studentId}`}
                      </h3>
                      <p className="text-sm text-gray-500">{request.studentEmail}</p>
                      {request.studentBranch && (
                        <p className="text-xs text-gray-500">Branch: {request.studentBranch}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        Received{" "}
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })
                          : "—"}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <span className={`badge ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      {request.status === "Pending" && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busyId === request.id}
                            onClick={() => handleStatusChange(request.id, "Accepted")}
                            className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            disabled={busyId === request.id}
                            onClick={() => handleStatusChange(request.id, "Rejected")}
                            className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AlumniMentorships;
