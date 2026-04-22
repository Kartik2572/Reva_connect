import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEventsByHost, fetchMentorshipRequestsForAlumnus, fetchJobReferrals, fetchPostsByAuthor, deletePost, updatePost } from "../services/api";

const AlumniRoleDashboard = () => {
  const navigate = useNavigate();
  const [hostedEvents, setHostedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [loadingMentorships, setLoadingMentorships] = useState(true);

  const [jobReferrals, setJobReferrals] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [recentPosts, setRecentPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [editingPost, setEditingPost] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: "", description: "" });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUser = user.name || "";
  const alumniId = user.alumniId;

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser) {
        setLoadingEvents(false);
        setLoadingMentorships(false);
        setLoadingJobs(false);
        setLoadingPosts(false);
        return;
      }

      try {
        const response = await fetchEventsByHost(currentUser);
        setHostedEvents(response.data?.data || []);
      } catch (error) {
        console.error("Error loading hosted events:", error);
      } finally {
        setLoadingEvents(false);
      }

      try {
        const postsRes = await fetchPostsByAuthor(currentUser);
        setRecentPosts(postsRes.data?.data || []);
      } catch (error) {
        console.error("Error loading recent posts:", error);
      } finally {
        setLoadingPosts(false);
      }

      if (alumniId) {
        try {
          const mentRes = await fetchMentorshipRequestsForAlumnus(alumniId);
          setMentorshipRequests(mentRes.data?.data || []);
        } catch (error) {
          console.error("Error loading mentorship requests:", error);
        } finally {
          setLoadingMentorships(false);
        }

        try {
          const jobRes = await fetchJobReferrals();
          const allJobs = jobRes.data?.data || [];
          setJobReferrals(allJobs.filter(job => job.alumniId === alumniId));
        } catch (error) {
          console.error("Error loading job referrals:", error);
        } finally {
          setLoadingJobs(false);
        }
      } else {
        setLoadingMentorships(false);
        setLoadingJobs(false);
      }
    };

    loadDashboardData();
  }, [currentUser, alumniId]);

  const handleDeletePost = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost(id);
      setRecentPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  const startEditingPost = (e, post) => {
    e.stopPropagation();
    setEditingPost(post);
    setEditFormData({ title: post.title, description: post.description });
  };

  const submitEditPost = async (e) => {
    e.preventDefault();
    setSubmittingEdit(true);
    try {
      const updated = await updatePost(editingPost.id, editFormData);
      const updatedPost = updated.data?.data || updated.data;
      setRecentPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, title: updatedPost.title, description: updatedPost.description } : p));
      setEditingPost(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update post");
    } finally {
      setSubmittingEdit(false);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/20 relative min-h-[calc(100vh-64px)] overflow-hidden transition-colors duration-300">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-100/40 to-transparent dark:from-orange-500/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
              Alumni Dashboard
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
              Your command center for mentorship, referrals, and events.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center rounded-full bg-orange-50 dark:bg-orange-900/30 px-4 py-1.5 text-sm font-bold text-[#F37021] dark:text-orange-400 border border-orange-100 dark:border-orange-800/50 shadow-sm animate-fade-in hidden sm:inline-flex">
              <span className="w-2 h-2 rounded-full bg-[#F37021] dark:bg-orange-400 mr-2 animate-pulse"></span>
              Alumni Network Active
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

        <div className="grid gap-8 md:grid-cols-2">
          {/* Mentorship Requests Section */}
          <section className="card p-6 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-700/50 group" onClick={() => navigate('/alumni/mentorships')}>
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-800/50 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  </div>
                  <h3 className="card-title">Mentorship Requests</h3>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Review incoming mentorship requests from students.
                </p>
                {loadingMentorships ? (
                  <p className="mt-4 text-sm text-gray-400 italic">Loading requests...</p>
                ) : mentorshipRequests.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {mentorshipRequests.slice(0, 3).map((req) => (
                      <div key={req.id} className="flex justify-between items-center rounded-xl border border-gray-100 bg-white/50 p-3 hover:bg-white transition-colors">
                        <div className="truncate pr-2">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {req.studentName || `Student #${req.studentId}`}
                          </p>
                          <p className="text-xs text-gray-500 font-medium truncate">{req.studentBranch || req.studentEmail}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : req.status === 'Accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-gray-400 italic">No mentorship requests received yet.</p>
                )}
              </div>
              <span className="text-xs font-bold text-blue-600 group-hover:underline shrink-0">View all</span>
            </div>
          </section>

          {/* Job Referrals Section */}
          <section className="card p-6 cursor-pointer hover:bg-gray-50/50 group" onClick={() => navigate('/alumni/jobs')}>
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600 border border-purple-100/50 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 className="card-title">Job Referrals</h3>
                </div>
                <p className="mt-2 text-sm text-gray-500 font-medium">
                  Track job referral opportunities you have posted.
                </p>
                {loadingJobs ? (
                  <p className="mt-4 text-sm text-gray-400 italic">Loading job referrals...</p>
                ) : jobReferrals.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {jobReferrals.slice(0, 3).map((job) => (
                      <div key={job.id} className="rounded-xl border border-gray-100 bg-white/50 p-3 hover:bg-white transition-colors">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {job.jobTitle}
                        </p>
                        <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                          {job.company} {job.location && `· ${job.location}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-gray-400 italic">No job referrals posted yet.</p>
                )}
              </div>
              <span className="text-xs font-bold text-blue-600 group-hover:underline shrink-0">View all</span>
            </div>
          </section>

          {/* Posts Section */}
          <section className="card p-6 cursor-pointer hover:bg-gray-50/50 group" onClick={() => navigate('/alumni/posts')}>
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 border border-indigo-100/50 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                  </div>
                  <h3 className="card-title">Networking Posts</h3>
                </div>
                <p className="mt-2 text-sm text-gray-500 font-medium">
                  Share posts and advice with students.
                </p>
                {loadingPosts ? (
                  <p className="mt-4 text-sm text-gray-400 italic">Loading posts...</p>
                ) : recentPosts.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {recentPosts.slice(0, 3).map((post) => (
                      <div key={post.id} className="rounded-xl border border-gray-100 bg-white/50 p-3 hover:bg-white transition-colors">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{post.title}</p>
                            <p className="text-xs text-gray-500 font-medium line-clamp-2 mt-1 leading-snug">{post.description}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={(e) => startEditingPost(e, post)} className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
                            <button onClick={(e) => handleDeletePost(e, post.id)} className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:text-red-800 transition-colors">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-gray-400 italic">No posts published yet.</p>
                )}
              </div>
              <button onClick={(e) => { e.stopPropagation(); navigate('/alumni/create-post'); }} className="text-xs font-bold text-blue-600 hover:underline shrink-0">Create new</button>
            </div>
          </section>

          {/* Events Section */}
          <section className="card p-6 cursor-pointer hover:bg-gray-50/50 group" onClick={() => navigate('/alumni/events')}>
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600 border border-orange-100/50 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 className="card-title">Events</h3>
                </div>
                <p className="mt-2 text-sm text-gray-500 font-medium">
                  Manage alumni-hosted events and webinars.
                </p>
                {loadingEvents ? (
                  <p className="mt-4 text-sm text-gray-400 italic">Loading your hosted events...</p>
                ) : hostedEvents.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {hostedEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="rounded-xl border border-gray-100 bg-white/50 p-3 hover:bg-white transition-colors">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          {new Date(event.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })} · {event.mode}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-gray-400 italic">
                    No hosted events found yet.
                  </p>
                )}
              </div>
              <span className="text-xs font-bold text-blue-600 group-hover:underline shrink-0">View all</span>
            </div>
          </section>
        </div>
      </div>

      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Post</h3>
            <form onSubmit={submitEditPost} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-[#F37021] focus:ring-2 focus:ring-[#F37021]/20 focus:bg-white transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Description</label>
                <textarea
                  required
                  rows={4}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-[#F37021] focus:ring-2 focus:ring-[#F37021]/20 focus:bg-white transition-all outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="btn-primary"
                >
                  {submittingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniRoleDashboard;

