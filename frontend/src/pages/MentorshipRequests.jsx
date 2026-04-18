import { useState, useEffect } from "react";
import { submitMentorshipRequest, fetchAlumni } from "../services/api.js";
import { useLocation } from "react-router-dom";

const MentorshipRequests = () => {
  const [form, setForm] = useState({
    studentName: "",
    studentEmail: "",
    message: "",
    targetAlumniId: ""
  });
  const [alumni, setAlumni] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchAlumni()
      .then((res) => setAlumni(res.data?.data || []))
      .catch(() => setAlumni([]));
  }, []);

  useEffect(() => {
    if (location.state?.selectedAlumni) {
      setForm((prev) => ({
        ...prev,
        targetAlumniId: location.state.selectedAlumni.id.toString()
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const studentId = user.id;
    if (!studentId) {
      setStatus({ type: "error", message: "Please sign in as a student to send a request." });
      setIsSubmitting(false);
      return;
    }

    const payload = {
      studentId,
      mentorId: form.targetAlumniId
    };

    submitMentorshipRequest(payload)
      .then(() => {
        setStatus({
          type: "success",
          message:
            "Request sent. You can track its status under Mentorship Requests in the student menu."
        });
        setForm({
          studentName: "",
          studentEmail: "",
          message: "",
          targetAlumniId: ""
        });
      })
      .catch((err) => {
        const message =
          err.response?.data?.message ||
          "Failed to submit mentorship request. Please try again.";
        setStatus({ type: "error", message });
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Mentorship Requests
          </h2>
          <p className="text-sm text-gray-600">
            Share a clear, focused request with a specific alumni mentor.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="card p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Your Name
              </label>
              <input
                type="text"
                name="studentName"
                value={form.studentName}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
                placeholder="e.g. Karthik R"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">
                REVA Email
              </label>
              <input
                type="email"
                name="studentEmail"
                value={form.studentEmail}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
                placeholder="e.g. name@reva.edu.in"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Target Alumni
              </label>
              <select
                name="targetAlumniId"
                value={form.targetAlumniId}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
              >
                <option value="">Select an alumni</option>
                {alumni.map((alum) => (
                  <option key={alum.id} value={alum.id}>
                    {alum.name} - {alum.role} at {alum.company}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">
              Your Request
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#F37021] focus:outline-none focus:ring-1 focus:ring-[#F37021]"
              placeholder="Briefly describe your background, goal (e.g. SDE role), and what specific help you expect from the alumni."
            />
          </div>

          {status.message && (
            <p
              className={`text-sm ${
                status.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {status.message}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorshipRequests;

