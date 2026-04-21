import { useState, useEffect } from "react";
import {
  fetchAllStudents,
  fetchConnectionStatus,
  sendConnectionRequest,
  fetchMyConnections,
  acceptConnectionRequest,
  rejectConnectionRequest
} from "../services/api";

const StudentFeed = () => {
  const [students, setStudents] = useState([]);
  const [connections, setConnections] = useState({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);
  const [myConnections, setMyConnections] = useState([]);
  const [activeTab, setActiveTab] = useState("discover");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  useEffect(() => {
    loadStudents();
    loadMyConnections();
  }, [userId]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await fetchAllStudents(userId);
      if (response.data?.success) {
        setStudents(response.data.data || []);
        // Load connection status for each student
        loadConnectionStatuses(response.data.data || []);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadConnectionStatuses = async (studentsList) => {
    const statuses = {};
    for (const student of studentsList) {
      try {
        const response = await fetchConnectionStatus(student.id);
        if (response.data?.success && response.data.data) {
          statuses[student.id] = response.data.data;
        }
      } catch (error) {
        console.error("Error loading connection status:", error);
      }
    }
    setConnections(statuses);
  };

  const loadMyConnections = async () => {
    try {
      const response = await fetchMyConnections();
      if (response.data?.success) {
        setMyConnections(response.data.data || []);
      }
    } catch (error) {
      console.error("Error loading connections:", error);
    }
  };

  const handleConnect = async (studentId) => {
    try {
      setSending(studentId);
      const response = await sendConnectionRequest(studentId);
      if (response.data?.success) {
        setConnections((prev) => ({
          ...prev,
          [studentId]: response.data.data
        }));
        alert("Connection request sent!");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      alert(error.response?.data?.message || "Failed to send connection request");
    } finally {
      setSending(null);
    }
  };

  const handleAccept = async (connectionId, studentId) => {
    try {
      setSending(connectionId);
      const response = await acceptConnectionRequest(connectionId);
      if (response.data?.success) {
        setConnections((prev) => ({
          ...prev,
          [studentId]: response.data.data
        }));
        loadMyConnections();
        alert("Connection accepted!");
      }
    } catch (error) {
      console.error("Error accepting connection request:", error);
      alert(error.response?.data?.message || "Failed to accept connection request");
    } finally {
      setSending(null);
    }
  };

  const handleReject = async (connectionId, studentId) => {
    try {
      setSending(connectionId);
      const response = await rejectConnectionRequest(connectionId);
      if (response.data?.success) {
        setConnections((prev) => ({
          ...prev,
          [studentId]: response.data.data
        }));
        loadMyConnections();
      }
    } catch (error) {
      console.error("Error rejecting connection request:", error);
      alert(error.response?.data?.message || "Failed to reject connection request");
    } finally {
      setSending(null);
    }
  };

  const getConnectionButton = (student) => {
    const connection = connections[student.id];
    
    if (!connection) {
      return (
        <button
          onClick={() => handleConnect(student.id)}
          disabled={sending === student.id}
          className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {sending === student.id ? "Sending..." : "Connect"}
        </button>
      );
    }

    if (connection.status === "Pending") {
      if (connection.requester_id === userId) {
        return (
          <span className="rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-medium text-yellow-800">
            Pending
          </span>
        );
      } else {
        return (
          <button
            onClick={() => handleAccept(connection.id, student.id)}
            disabled={sending === connection.id}
            className="rounded-full bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {sending === connection.id ? "Accepting..." : "Accept"}
          </button>
        );
      }
    }

    if (connection.status === "Accepted") {
      return (
        <span className="rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800">
          Connected
        </span>
      );
    }

    if (connection.status === "Rejected") {
      return (
        <button
          onClick={() => handleConnect(student.id)}
          disabled={sending === student.id}
          className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {sending === student.id ? "Sending..." : "Connect"}
        </button>
      );
    }

    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Networking Feed
            </h2>
          </header>
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Networking Feed
          </h2>
          <p className="text-sm text-gray-600">
            Connect with other students and build your network.
          </p>
        </header>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("discover")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "discover"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Discover Students
          </button>
          <button
            onClick={() => setActiveTab("connections")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "connections"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Connections ({myConnections.filter(c => c.status === "Accepted").length})
          </button>
        </div>

        {activeTab === "discover" && (
          <section>
            {students.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-gray-500">No other students found.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="card flex flex-col gap-3 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-600">
                        {student.name?.charAt(0).toUpperCase() || "S"}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {student.branch || "No branch specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Joined {formatDate(student.created_at)}
                      </span>
                      {getConnectionButton(student)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "connections" && (
          <section>
            {myConnections.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-gray-500">You haven't connected with anyone yet.</p>
                <p className="mt-2 text-sm text-gray-400">
                  Go to "Discover Students" to find and connect with other students.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myConnections.filter(c => c.status === "Accepted").map((connection) => (
                  <div
                    key={connection.id}
                    className="card flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                        {connection.name?.charAt(0).toUpperCase() || "S"}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {connection.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {connection.branch || "No branch"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          connection.status === "Accepted"
                            ? "bg-green-100 text-green-800"
                            : connection.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {connection.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(connection.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default StudentFeed;

