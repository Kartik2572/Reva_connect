import { useEffect, useState } from "react";
import { fetchAdminActivityLogs } from "../services/api.js";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminActivityLogs()
      .then((res) => setLogs(res.data?.data || []))
      .catch(() => setError("Unable to load activity logs."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Activity Logs
          </h2>
          <p className="text-sm text-gray-600">
            Timeline of key administrative actions performed on the platform.
          </p>
        </header>
        <section className="card p-4">
          <h3 className="card-title">Recent Activity</h3>
          {loading ? (
            <p className="mt-2 text-sm text-gray-600">Loading activity logs...</p>
          ) : error ? (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          ) : logs.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">
              No admin activity logged yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                  <p className="mt-1 text-sm text-gray-800">{log.action}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ActivityLogs;

