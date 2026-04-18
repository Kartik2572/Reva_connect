import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchMentorshipRequestsForStudent } from "../services/api.js";

const StudentMentorship = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = user.id;

  const loadRequests = useCallback(() => {
    if (!studentId) {
      setRequests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    fetchMentorshipRequestsForStudent(studentId)
      .then((res) => setRequests(res.data?.data || []))
      .catch(() => {
        setRequests([]);
        setError("Could not load mentorship requests.");
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

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
          <h2 className="text-2xl font-semibold text-gray-900">My Mentorship Requests</h2>
          <p className="text-sm text-gray-600">
            Track requests you have sent to alumni mentors and their latest status.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {!studentId && (
          <p className="text-sm text-gray-600">Sign in as a student to see your requests.</p>
        )}

        <section className="card p-4">
          {loading ? (
            <p className="text-sm text-gray-600">Loading requests…</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-gray-600">
              You haven&apos;t sent any mentorship requests yet. Browse the{" "}
              <Link to="/student/alumni" className="font-medium text-[#F37021] hover:underline">
                Alumni Directory
              </Link>{" "}
              and use &ldquo;Request mentorship&rdquo;, or open the{" "}
              <Link to="/mentorship" className="font-medium text-[#F37021] hover:underline">
                Mentorship
              </Link>{" "}
              form.
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="rounded-lg border border-gray-100 bg-white p-4">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {request.mentorName || "Alumni mentor"}
                        {request.mentorCompany ? (
                          <span className="text-gray-500"> · {request.mentorCompany}</span>
                        ) : null}
                      </h3>
                      {request.mentorDomain && (
                        <p className="text-xs text-gray-500">Domain: {request.mentorDomain}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Sent on{" "}
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : "—"}
                      </p>
                    </div>
                    <span className={`badge w-fit ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
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

export default StudentMentorship;
