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
    <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/20 relative min-h-[calc(100vh-64px)] overflow-hidden transition-colors duration-300">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-100/40 to-transparent dark:from-orange-500/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
              Admin Dashboard
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
              Central place to manage users, content and events on the platform.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-900/30 px-4 py-1.5 text-sm font-bold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50 shadow-sm animate-fade-in hidden sm:inline-flex">
              <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 mr-2 animate-pulse"></span>
              Admin Access Enabled
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-ghost shadow-sm hover:shadow-md"
            >
              Logout
            </button>
          </div>
        </header>

        {/* 1. Platform statistics */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="card p-5 border-l-4 border-l-[#F37021] hover:-translate-y-1 transition-transform duration-300">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Students</p>
            <p className="mt-2 text-4xl font-black text-gray-900 dark:text-white">
              {stats?.totalStudents ?? 0}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-400 dark:text-gray-500">Active on platform</p>
          </div>
          <div className="card p-5 border-l-4 border-l-blue-500 hover:-translate-y-1 transition-transform duration-300">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Alumni</p>
            <p className="mt-2 text-4xl font-black text-gray-900 dark:text-white">
              {stats?.totalAlumni ?? 0}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-400 dark:text-gray-500">Verified mentors</p>
          </div>
          <div className="card p-5 border-l-4 border-l-green-500 hover:-translate-y-1 transition-transform duration-300">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Mentorship Requests
            </p>
            <p className="mt-2 text-4xl font-black text-gray-900 dark:text-white">
              {stats?.totalMentorshipRequests ?? 0}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-400 dark:text-gray-500">Total requests</p>
          </div>
          <div className="card p-5 border-l-4 border-l-purple-500 hover:-translate-y-1 transition-transform duration-300">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Job Referrals</p>
            <p className="mt-2 text-4xl font-black text-gray-900 dark:text-white">
              {stats?.totalJobReferrals ?? 0}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-400 dark:text-gray-500">Posted by alumni</p>
          </div>
          <div className="card p-5 border-l-4 border-l-rose-500 hover:-translate-y-1 transition-transform duration-300">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Events</p>
            <p className="mt-2 text-4xl font-black text-gray-900 dark:text-white">
              {stats?.totalEvents ?? 0}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-400 dark:text-gray-500">Webinars & meetups</p>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* 2. User Management Panel */}
          <section className="card p-6 lg:col-span-2">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <h3 className="card-title">User Management</h3>
              </div>
            </div>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="min-w-full text-left text-xs text-gray-600">
                <thead className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Branch</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">{user.name}</td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-600">{user.email}</td>
                      <td className="px-4 py-3 text-xs font-medium capitalize">{user.role}</td>
                      <td className="px-4 py-3 text-xs">{user.company || "-"}</td>
                      <td className="px-4 py-3 text-xs">{user.branch || "-"}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`badge ${user.status === 'Suspended' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                          {user.status || "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs space-x-2">
                        <button
                          type="button"
                          className="font-bold text-yellow-600 hover:text-yellow-800 transition-colors uppercase tracking-wider text-[10px]"
                          onClick={() => handleSuspendUser(user)}
                        >
                          Suspend
                        </button>
                        <button
                          type="button"
                          className="font-bold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider text-[10px]"
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
                        className="px-4 py-8 text-center text-sm font-medium text-gray-500 italic"
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
          <section className="card p-6">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="bg-[#F37021]/10 p-2 rounded-lg text-[#F37021]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h3 className="card-title">Key Analytics</h3>
              </div>
            </div>
            <div className="space-y-5 text-sm text-gray-700">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Most Active Alumni
                </p>
                <p className="mt-1 font-black text-gray-900 text-lg">
                  {stats?.analytics?.mostActiveAlumni ?? "-"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Most Requested Mentor
                </p>
                <p className="mt-1 font-black text-gray-900 text-lg">
                  {stats?.analytics?.mostRequestedMentor ?? "-"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Most Popular Event
                </p>
                <p className="mt-1 font-black text-gray-900 text-lg">
                  {stats?.analytics?.mostPopularEvent ?? "-"}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* 3. Alumni Verification System */}
          <section className="card p-6">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="card-title">Alumni Verification</h3>
              </div>
            </div>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="min-w-full text-left text-xs text-gray-600">
                <thead className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Name</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Grad Year</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingAlumni.map((alumni) => (
                    <tr key={alumni.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        {alumni.name}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">{alumni.company}</td>
                      <td className="px-4 py-3 text-xs font-medium">
                        {alumni.graduationYear}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="badge bg-yellow-50 text-yellow-700 border border-yellow-100">
                          {alumni.verificationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs space-x-2">
                        <button
                          type="button"
                          className="font-bold text-green-600 hover:text-green-800 transition-colors uppercase tracking-wider text-[10px]"
                          onClick={() => handleApproveAlumni(alumni)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="font-bold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider text-[10px]"
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
                        className="px-4 py-8 text-center text-sm font-medium text-gray-500 italic"
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
          <section className="card p-6">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="bg-red-50 p-2 rounded-lg text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h3 className="card-title">Content Moderation</h3>
              </div>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {moderationPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-gray-900 text-sm">
                      {post.author}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short"
                      })}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-600 line-clamp-2 leading-relaxed">{post.description}</p>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="font-bold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider text-[10px]"
                      onClick={() => handleDeletePost(post)}
                    >
                      Delete Post
                    </button>
                  </div>
                </div>
              ))}
              {moderationPosts.length === 0 && (
                <p className="text-sm font-medium text-gray-500 italic text-center py-4">
                  No posts available for moderation.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* 5. Event Management & 7. Activity Log */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="card p-6">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="card-title">Event Management</h3>
              </div>
            </div>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="min-w-full text-left text-xs text-gray-600">
                <thead className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Event Title</th>
                    <th className="px-4 py-3">Host</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Registrations</th>
                    <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {managedEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        {event.title}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">{event.host || "-"}</td>
                      <td className="px-4 py-3 text-xs font-medium">
                        {new Date(event.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">
                        <span className="badge bg-gray-100 text-gray-700 border border-gray-200">
                          {event.registeredStudents} users
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs space-x-2">
                        <button
                          type="button"
                          className="font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider text-[10px]"
                          onClick={() => handleEditEvent(event)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="font-bold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider text-[10px]"
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
                        className="px-4 py-8 text-center text-sm font-medium text-gray-500 italic"
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
          <section className="card p-6">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                </div>
                <h3 className="card-title">Activity Log</h3>
              </div>
            </div>
            <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2 custom-scrollbar text-sm text-gray-700">
              {activityLog.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 hover:bg-white transition-colors"
                >
                  <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#F37021]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                      {entry.createdAt
                        ? new Date(entry.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : ""}
                    </p>
                    <p className="text-xs font-medium text-gray-700 leading-snug">{entry.action}</p>
                  </div>
                </div>
              ))}
              {activityLog.length === 0 && (
                <p className="text-sm font-medium text-gray-500 italic text-center py-4">
                  Recent admin actions will appear here.
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

