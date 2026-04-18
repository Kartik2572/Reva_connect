import { useEffect, useState } from "react";
import { fetchAdminUsers, deleteAdminUser } from "../services/api.js";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");
  const adminName = adminUser.name || "Admin";

  const handleDeleteUser = async (userId) => {
    try {
      await deleteAdminUser(userId, { adminName });
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      console.error(err);
      setError("Unable to delete user. Please try again.");
    }
  };

  useEffect(() => {
    fetchAdminUsers()
      .then((res) => {
        setUsers(res.data?.data || []);
      })
      .catch(() => {
        setError("Unable to load users. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            User Management
          </h2>
          <p className="text-sm text-gray-600">
            Admin view for managing student and alumni accounts.
          </p>
        </header>

        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="card-title">Users</h3>
              <p className="text-sm text-gray-600">
                All registered users are displayed here for quick admin oversight.
              </p>
            </div>
            <span className="text-sm text-gray-500">
              {loading ? "Loading..." : `${users.length} users loaded`}
            </span>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs text-gray-600">
              <thead className="border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Branch</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-900">{user.name}</td>
                    <td className="px-3 py-2 text-xs text-gray-700">{user.email}</td>
                    <td className="px-3 py-2 text-xs">{user.role}</td>
                    <td className="px-3 py-2 text-xs">{user.company || "-"}</td>
                    <td className="px-3 py-2 text-xs">{user.branch || "-"}</td>
                    <td className="px-3 py-2 text-xs">
                      <span className="badge bg-gray-100 text-gray-700 border border-gray-200">
                        {user.status || "Active"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <button
                        type="button"
                        className="btn-ghost px-2 py-1 text-[11px] text-red-600"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-xs text-gray-500">
                      No users found. Ensure the backend admin API is available.
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

export default UserManagement;

