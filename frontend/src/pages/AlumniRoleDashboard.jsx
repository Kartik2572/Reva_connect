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
    <div className="flex-1 bg-gray-50 relative">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Alumni Dashboard
            </h2>
            <p className="text-sm text-gray-600">
              Quick view of mentorship, referrals and events for alumni.
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

        <div className="grid gap-6 md:grid-cols-2">
          {/* Mentorship Requests Section */}
          <section className="card p-4 cursor-pointer hover:bg-gray-50" onClick={() => navigate('/alumni/mentorships')}>
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0 w-full">
                <h3 className="card-title">Mentorship Requests</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Review incoming mentorship requests from students.
                </p>
                {loadingMentorships ? (
                  <p className="mt-4 text-sm text-gray-500">Loading requests...</p>
                ) : mentorshipRequests.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {mentorshipRequests.slice(0, 3).map((req) => (
                      <div key={req.id} className="flex justify-between items-center rounded-xl border border-gray-200 bg-white p-3">
                        <div className="truncate pr-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {req.studentName || `Student #${req.studentId}`}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{req.studentBranch || req.studentEmail}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : req.status === 'Accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">No mentorship requests received yet.</p>
                )}
              </div>
              <span className="text-xs text-blue-600 underline shrink-0">View all</span>
            </div>
          </section>

          {/* Job Referrals Section */}
          <section className="card p-4 cursor-pointer hover:bg-gray-50" onClick={() => navigate('/alumni/jobs')}>
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0 w-full">
                <h3 className="card-title">Job Referrals</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Track job referral opportunities you have posted.
                </p>
                {loadingJobs ? (
                  <p className="mt-4 text-sm text-gray-500">Loading job referrals...</p>
                ) : jobReferrals.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {jobReferrals.slice(0, 3).map((job) => (
                      <div key={job.id} className="rounded-xl border border-gray-200 bg-white p-3">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {job.jobTitle}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {job.company} {job.location && `· ${job.location}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">No job referrals posted yet.</p>
                )}
              </div>
              <span className="text-xs text-blue-600 underline shrink-0">View all</span>
            </div>
          </section>

          {/* Posts Section */}
          <section className="card p-4 cursor-pointer hover:bg-gray-50" onClick={() => navigate('/alumni/posts')}>
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0 w-full">
                <h3 className="card-title">Posts</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Share posts and advice with students.
                </p>
                {loadingPosts ? (
                  <p className="mt-4 text-sm text-gray-500">Loading posts...</p>
                ) : recentPosts.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {recentPosts.slice(0, 3).map((post) => (
                      <div key={post.id} className="rounded-xl border border-gray-200 bg-white p-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{post.description}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={(e) => startEditingPost(e, post)} className="text-xs text-blue-600 hover:underline">Edit</button>
                            <button onClick={(e) => handleDeletePost(e, post.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">No posts published yet.</p>
                )}
              </div>
              <button onClick={() => navigate('/alumni/create-post')} className="text-xs text-blue-600 underline shrink-0">Create new</button>
            </div>
          </section>

          <section className="card p-4 cursor-pointer hover:bg-gray-50" onClick={() => navigate('/alumni/events')}>
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <h3 className="card-title">Events</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Manage alumni-hosted events and webinars.
                </p>
                {loadingEvents ? (
                  <p className="mt-4 text-sm text-gray-500">Loading your hosted events...</p>
                ) : hostedEvents.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {hostedEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="rounded-xl border border-gray-200 bg-white p-3">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500">
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
                  <p className="mt-4 text-sm text-gray-500">
                    No hosted events found yet. Click to create or view events.
                  </p>
                )}
              </div>
              <span className="text-xs text-blue-600 underline shrink-0">View all</span>
            </div>
          </section>
        </div>
      </div>

      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Post</h3>
            <form onSubmit={submitEditPost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-[#F37021] focus:ring-1 focus:ring-[#F37021]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  required
                  rows={4}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-[#F37021] focus:ring-1 focus:ring-[#F37021]"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="rounded-md bg-[#F37021] px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
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

