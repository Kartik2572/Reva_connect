import { useState, useEffect } from "react";
import { fetchAdminJobReferrals, updateAdminJobReferral } from "../services/api.js";

const AdminJobReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionInProgress, setActionInProgress] = useState({});

  useEffect(() => {
    const loadReferrals = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetchAdminJobReferrals();
        setReferrals(response.data?.data || []);
      } catch (err) {
        setError("Failed to load job referrals. Please check the API.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadReferrals();
  }, []);

  const handleArchive = async (id, currentStatus) => {
    try {
      setActionInProgress(prev => ({ ...prev, [id]: "archiving" }));
      const newStatus = currentStatus === "Archived" ? "Active" : "Archived";
      const response = await updateAdminJobReferral(id, { status: newStatus });
      
      setReferrals(prev => prev.map(r => r.id === id ? response.data?.data : r));
    } catch (err) {
      console.error(err);
      setError("Failed to update status.");
    } finally {
      setActionInProgress(prev => ({ ...prev, [id]: undefined }));
    }
  };

  const handleFlag = async (id, currentFlagged) => {
    try {
      setActionInProgress(prev => ({ ...prev, [id]: "flagging" }));
      const response = await updateAdminJobReferral(id, { isFlagged: !currentFlagged });
      
      setReferrals(prev => prev.map(r => r.id === id ? response.data?.data : r));
    } catch (err) {
      console.error(err);
      setError("Failed to update flag status.");
    } finally {
      setActionInProgress(prev => ({ ...prev, [id]: undefined }));
    }
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Job Referrals
          </h2>
          <p className="text-sm text-gray-600">
            Admin area for monitoring and moderating referral-ready job posts
            shared by alumni.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-600">Loading job referrals…</p>
        ) : referrals.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-gray-500">No job referrals found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map(referral => (
              <div key={referral.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{referral.jobTitle}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">Company:</span> {referral.company || "—"}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">Posted by:</span> {referral.postedBy || referral.alumniName || "Unknown"}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">Location:</span> {referral.location || "—"}
                    </p>
                    {referral.description && (
                      <p className="mt-2 text-sm text-gray-700">{referral.description}</p>
                    )}
                    {referral.jobLink && (
                      <p className="mt-2 text-sm">
                        <a href={referral.jobLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Job Link
                        </a>
                      </p>
                    )}
                    <p className="mt-3 text-xs text-gray-500">
                      Created: {new Date(referral.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        referral.status === "Archived" 
                          ? "bg-gray-200 text-gray-800" 
                          : "bg-green-200 text-green-800"
                      }`}>
                        {referral.status}
                      </span>
                      {referral.isFlagged && (
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-red-200 text-red-800">
                          🚩 Flagged
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleArchive(referral.id, referral.status)}
                      disabled={actionInProgress[referral.id]}
                      className={`px-3 py-2 text-xs font-medium rounded transition ${
                        referral.status === "Archived"
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50"
                      }`}
                    >
                      {actionInProgress[referral.id] === "archiving" ? "Updating..." : referral.status === "Archived" ? "Unarchive" : "Archive"}
                    </button>
                    <button
                      onClick={() => handleFlag(referral.id, referral.isFlagged)}
                      disabled={actionInProgress[referral.id]}
                      className={`px-3 py-2 text-xs font-medium rounded transition ${
                        referral.isFlagged
                          ? "bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                          : "bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50"
                      }`}
                    >
                      {actionInProgress[referral.id] === "flagging" ? "Updating..." : referral.isFlagged ? "Unflag" : "Flag"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobReferrals;

