import { useState } from "react";
import { submitMentorshipRequest } from "../services/api.js";

const AlumniCard = ({ alumni, onConnect }) => {
  const [requestSent, setRequestSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRequestMentorship = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const studentId = user.id;
      const mentorId = alumni.id;
      if (!studentId) {
        setMessage("Please sign in as a student to request mentorship.");
        return;
      }
      await submitMentorshipRequest({ studentId, mentorId });
      setRequestSent(true);
      setMessage("Mentorship request sent successfully!");
    } catch (error) {
      setMessage("Failed to send request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-4 flex flex-col justify-between">
      <div>
        <div className="card-header">
          <div>
            <h3 className="card-title">{alumni.name}</h3>
            <p className="text-sm text-gray-500">
              {[alumni.role, alumni.company].filter(Boolean).join(" · ") || "Alumni"}
            </p>
            {alumni.verificationStatus && (
              <p className="mt-1 text-[11px] text-gray-400">
                Status: {alumni.verificationStatus}
              </p>
            )}
          </div>
          <span className="badge bg-orange-50 text-[#F37021]">
            {alumni.experience != null && String(alumni.experience).trim() !== ""
              ? `${alumni.experience} yrs`
              : "—"}
          </span>
        </div>
        {alumni.branchOrCompany && (
          <p className="mb-2 text-xs text-gray-500">
            Branch: <span className="font-medium">{alumni.branchOrCompany}</span>
          </p>
        )}
        <p className="mb-2 text-xs text-gray-500">
          Domain: <span className="font-medium">{alumni.domain || "—"}</span>
        </p>
        <p className="mb-2 text-xs text-gray-500">
          Graduation year:{" "}
          <span className="font-medium">{alumni.graduationYear ?? "—"}</span>
        </p>
        <p className="mb-3 text-xs text-gray-500">
          Location: <span className="font-medium">{alumni.location || "—"}</span>
        </p>
        {(alumni.skills?.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {alumni.skills.map((skill) => (
              <span
                key={skill}
                className="badge border border-gray-200 bg-gray-100 text-gray-700"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-col space-y-2">
        {message && (
          <p className={`text-sm ${requestSent ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
        <button
          type="button"
          onClick={requestSent ? undefined : handleRequestMentorship}
          disabled={isLoading || requestSent}
          className={`btn-primary w-full sm:w-auto ${requestSent ? "bg-gray-400" : ""}`}
        >
          {isLoading ? "Sending..." : requestSent ? "Request Sent" : "Request Mentorship"}
        </button>
      </div>
    </div>
  );
};

export default AlumniCard;

