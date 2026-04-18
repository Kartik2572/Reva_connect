import { useEffect, useState } from "react";
import { fetchAdminPendingAlumni, updateAdminPendingAlumniStatus, createAdminActivityLog } from "../services/api.js";

const AlumniVerification = () => {
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [error, setError] = useState("");
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");
  const adminName = adminUser.name || "Admin";

  useEffect(() => {
    fetchAdminPendingAlumni()
      .then((res) => setPendingAlumni(res.data?.data || []))
      .catch((err) => {
        console.error(err);
        setError("Unable to load pending alumni.");
      });
  }, []);

  const handleApprove = async (id) => {
    try {
      const result = await updateAdminPendingAlumniStatus(id, "approve", adminName);
      setPendingAlumni((prev) => prev.filter((a) => a.id !== id));
      await createAdminActivityLog({
        adminName,
        action: `Approved alumni ${result.data.data.name}`
      });
    } catch (err) {
      console.error(err);
      setError("Unable to approve alumni. Please try again.");
    }
  };

  const handleReject = async (id) => {
    try {
      const result = await updateAdminPendingAlumniStatus(id, "reject", adminName);
      setPendingAlumni((prev) => prev.filter((a) => a.id !== id));
      await createAdminActivityLog({
        adminName,
        action: `Rejected alumni ${result.data.data.name}`
      });
    } catch (err) {
      console.error(err);
      setError("Unable to reject alumni. Please try again.");
    }
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Alumni Verification
          </h2>
          <p className="text-sm text-gray-600">
            Review and approve alumni accounts requesting platform verification.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="card p-4">
          <div className="card-header">
            <h3 className="card-title">Pending Alumni Verification Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs text-gray-600">
              <thead className="border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Graduation Year</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingAlumni.length > 0 ? (
                  pendingAlumni.map((alumni) => (
                    <tr key={alumni.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {alumni.name}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">{alumni.company}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{alumni.branchOrCompany}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{alumni.graduationYear}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{alumni.experience || "-"}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{alumni.domain || "-"}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{alumni.location || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="badge bg-yellow-100 text-yellow-800 border border-yellow-200">
                          {alumni.verificationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => handleApprove(alumni.id)}
                          className="btn-ghost text-green-600 px-3 py-1 text-[11px]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(alumni.id)}
                          className="btn-ghost text-red-600 px-3 py-1 text-[11px]"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-6 text-center text-xs text-gray-500"
                    >
                      No pending alumni verification requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AlumniVerification;

