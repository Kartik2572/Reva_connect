import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminStats,
  fetchAdminUsers,
  deleteAdminUser,
  fetchAdminPendingAlumni,
  updateAdminPendingAlumniStatus,
  fetchAdminPosts,
  fetchAdminEvents,
  fetchAdminActivityLogs,
  createAdminActivityLog,
  deleteAdminPost,
  deleteEvent
} from "../services/api.js";

const getAdminName = () => {
  const u = JSON.parse(localStorage.getItem("user") || "{}");
  return u.name || "Admin";
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [moderationPosts, setModerationPosts] = useState([]);
  const [managedEvents, setManagedEvents] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  const loadActivityLog = () => {
    fetchAdminActivityLogs({ limit: 5 })
      .then((res) => setActivityLog(res.data?.data || []))
      .catch(() => {});
  };

  const logAdminAction = async (action) => {
    try {
      await createAdminActivityLog({ adminName: getAdminName(), action });
      loadActivityLog();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdminStats()
      .then((res) => setStats(res.data?.data || {}))
      .catch(() => {});

    fetchAdminUsers()
      .then((res) => setUsers(res.data?.data || []))
      .catch(() => {});

    fetchAdminPendingAlumni()
      .then((res) => setPendingAlumni(res.data?.data || []))
      .catch(() => {});

    fetchAdminPosts()
      .then((res) => setModerationPosts(res.data?.data || []))
      .catch(() => {});

    fetchAdminEvents()
      .then((res) => setManagedEvents(res.data?.data || []))
      .catch(() => {});

    loadActivityLog();
  }, []);

  const handleSuspendUser = (user) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, status: "Suspended" } : u
      )
    );
    logAdminAction(`Admin ${getAdminName()} suspended user ${user.name}`);
  };

  const handleDeleteUser = async (user) => {
    try {
      await deleteAdminUser(user.id, { adminName: getAdminName() });
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      loadActivityLog();
    } catch (error) {
      console.error(error);
      logAdminAction(`Failed to remove user ${user.name}`);
    }
  };

  const handleApproveAlumni = async (alumni) => {
    try {
      await updateAdminPendingAlumniStatus(alumni.id, "approve", getAdminName());
      setPendingAlumni((prev) => prev.filter((a) => a.id !== alumni.id));
      loadActivityLog();
    } catch (error) {
      console.error(error);
      logAdminAction(`Failed to approve alumni verification for ${alumni.name}`);
    }
  };

  const handleRejectAlumni = async (alumni) => {
    try {
      await updateAdminPendingAlumniStatus(alumni.id, "reject", getAdminName());
      setPendingAlumni((prev) => prev.filter((a) => a.id !== alumni.id));
      loadActivityLog();
    } catch (error) {
      console.error(error);
      logAdminAction(`Failed to reject alumni verification for ${alumni.name}`);
    }
  };

  const handleDeletePost = async (post) => {
    try {
      await deleteAdminPost(post.id, { adminName: getAdminName() });
      setModerationPosts((prev) => prev.filter((p) => p.id !== post.id));
      loadActivityLog();
    } catch (error) {
      console.error(error);
      logAdminAction(`Failed to delete post by ${post.author}`);
    }
  };

  const handleDeleteEvent = async (event) => {
    try {
      await deleteEvent(event.id, { data: { adminName: getAdminName() } });
      setManagedEvents((prev) => prev.filter((e) => e.id !== event.id));
      loadActivityLog();
    } catch (error) {
      console.error(error);
      logAdminAction(`Failed to delete event "${event.title}"`);
    }
  };

  const handleEditEvent = (event) => {
    logAdminAction(`Admin ${getAdminName()} started editing event "${event.title}"`);
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Admin Dashboard
            </h2>
            <p className="text-sm text-gray-600">
              Central place to manage users, content and events on the
              platform.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-ghost"
          >
            Logout
          </button>
        </header>

        {/* 1. Platform statistics */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="card p-4 border-l-4 border-l-[#F37021]">
            <p className="text-xs font-medium text-gray-500">Total Students</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stats?.totalStudents ?? 0}
            </p>
            <p className="mt-1 text-xs text-gray-400">Active on platform</p>
          </div>
          <div className="card p-4 border-l-4 border-l-[#F37021]">
            <p className="text-xs font-medium text-gray-500">Total Alumni</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stats?.totalAlumni ?? 0}
            </p>
            <p className="mt-1 text-xs text-gray-400">Verified mentors</p>
          </div>
          <div className="card p-4 border-l-4 border-l-[#F37021]">
            <p className="text-xs font-medium text-gray-500">
              Mentorship Requests
            </p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stats?.totalMentorshipRequests ?? 0}
            </p>
            <p className="mt-1 text-xs text-gray-400">Pending approval</p>
          </div>
          <div className="card p-4 border-l-4 border-l-[#F37021]">
            <p className="text-xs font-medium text-gray-500">Job Referrals</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stats?.totalJobReferrals ?? 0}
            </p>
            <p className="mt-1 text-xs text-gray-400">Posted by alumni</p>
          </div>
          <div className="card p-4 border-l-4 border-l-[#F37021]">
            <p className="text-xs font-medium text-gray-500">Events</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stats?.totalEvents ?? 0}
            </p>
            <p className="mt-1 text-xs text-gray-400">Webinars & meetups</p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 2. User Management Panel */}
          <section className="card p-4 lg:col-span-2">
            <div className="card-header">
              <h3 className="card-title">User Management</h3>
            </div>
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
                      <td className="px-3 py-2 text-xs space-x-1">
                        <button
                          type="button"
                          className="btn-ghost px-2 py-1 text-[11px]"
                          onClick={() =>
                            logAdminAction(`Admin ${getAdminName()} viewed profile of ${user.name}`)
                          }
                        >
                          View Profile
                        </button>
                        <button
                          type="button"
                          className="btn-ghost px-2 py-1 text-[11px]"
                          onClick={() => handleSuspendUser(user)}
                        >
                          Suspend
                        </button>
                        <button
                          type="button"
                          className="btn-ghost px-2 py-1 text-[11px] text-red-600"
                          onClick={() => handleDeleteUser(user)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-4 text-center text-xs text-gray-500"
                      >
                        No users loaded. Ensure the backend admin APIs are running.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. Analytics Section */}
          <section className="card p-4">
            <div className="card-header">
              <h3 className="card-title">Key Analytics</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Most Active Alumni
                </p>
                <p className="mt-1 font-semibold">
                  {stats?.analytics?.mostActiveAlumni ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Most Requested Mentor
                </p>
                <p className="mt-1 font-semibold">
                  {stats?.analytics?.mostRequestedMentor ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Most Popular Event
                </p>
                <p className="mt-1 font-semibold">
                  {stats?.analytics?.mostPopularEvent ?? "-"}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* 3. Alumni Verification System */}
          <section className="card p-4">
            <div className="card-header">
              <h3 className="card-title">Alumni Verification</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-gray-600">
                <thead className="border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Company</th>
                    <th className="px-3 py-2">Graduation Year</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAlumni.map((alumni) => (
                    <tr key={alumni.id} className="border-b border-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {alumni.name}
                      </td>
                      <td className="px-3 py-2 text-xs">{alumni.company}</td>
                      <td className="px-3 py-2 text-xs">
                        {alumni.graduationYear}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className="badge bg-gray-100 text-gray-700 border border-gray-200">
                          {alumni.verificationStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs space-x-1">
                        <button
                          type="button"
                          className="btn-ghost px-2 py-1 text-[11px] text-green-700"
                          onClick={() => handleApproveAlumni(alumni)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn-ghost px-2 py-1 text-[11px] text-red-600"
                          onClick={() => handleRejectAlumni(alumni)}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pendingAlumni.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-4 text-center text-xs text-gray-500"
                      >
                        No pending alumni for verification.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Content Moderation */}
          <section className="card p-4">
            <div className="card-header">
              <h3 className="card-title">Content Moderation</h3>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {moderationPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 text-sm">
                      {post.author}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short"
                      })}
                    </p>
                  </div>
                  <p className="mt-1 text-xs">{post.description}</p>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      className="btn-ghost px-3 py-1 text-[11px] text-red-600"
                      onClick={() => handleDeletePost(post)}
                    >
                      Delete Post
                    </button>
                  </div>
                </div>
              ))}
              {moderationPosts.length === 0 && (
                <p className="text-xs text-gray-500">
                  No posts available for moderation.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* 5. Event Management & 7. Activity Log */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="card p-4">
            <div className="card-header">
              <h3 className="card-title">Event Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-gray-600">
                <thead className="border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Event Title</th>
                    <th className="px-3 py-2">Host</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Registered Students</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {managedEvents.map((event) => (
                    <tr key={event.id} className="border-b border-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {event.title}
                      </td>
                      <td className="px-3 py-2 text-xs">{event.host || "-"}</td>
                      <td className="px-3 py-2 text-xs">
                        {new Date(event.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {event.registeredStudents}
                      </td>
                      <td className="px-3 py-2 text-xs space-x-1">
                        <button
                          type="button"
                          className="btn-ghost px-2 py-1 text-[11px]"
                          onClick={() => handleEditEvent(event)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-ghost px-2 py-1 text-[11px] text-red-600"
                          onClick={() => handleDeleteEvent(event)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {managedEvents.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-4 text-center text-xs text-gray-500"
                      >
                        No events found for management.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Admin activity log */}
          <section className="card p-4">
            <div className="card-header">
              <h3 className="card-title">Admin Activity Log</h3>
            </div>
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1 text-xs text-gray-700">
              {activityLog.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-2 rounded-lg bg-gray-50 p-2"
                >
                  <div className="mt-[3px] h-2 w-2 flex-shrink-0 rounded-full bg-[#F37021]" />
                  <div>
                    <p className="text-[11px] text-gray-400">
                      {entry.createdAt
                        ? new Date(entry.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : ""}
                    </p>
                    <p className="text-xs text-gray-700">{entry.action}</p>
                  </div>
                </div>
              ))}
              {activityLog.length === 0 && (
                <p className="text-xs text-gray-500">
                  Recent admin actions will appear here as you manage the
                  platform.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

