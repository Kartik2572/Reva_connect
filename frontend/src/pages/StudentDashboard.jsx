import { useEffect, useState } from "react";
import { fetchAlumni, fetchEvents, fetchJobs, fetchPosts, fetchMentorshipRequestsForStudent, fetchMyConnections, fetchJobApplicationsForStudent } from "../services/api.js";
import AlumniCard from "../components/AlumniCard.jsx";
import JobCard from "../components/JobCard.jsx";
import EventCard from "../components/EventCard.jsx";
import PostCard from "../components/PostCard.jsx";

const StudentDashboard = () => {
  const [alumni, setAlumni] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ mentorshipRequests: 0, networkConnections: 0, jobReferralsApplied: 0 });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const studentId = user.id;

    if (studentId) {
      Promise.all([
        fetchMentorshipRequestsForStudent(studentId).catch(() => ({ data: { data: [] } })),
        fetchMyConnections().catch(() => ({ data: { data: [] } })),
        fetchJobApplicationsForStudent(studentId).catch(() => ({ data: { data: [] } }))
      ]).then(([mentorshipRes, connectionsRes, jobsRes]) => {
        setStats({
          mentorshipRequests: (mentorshipRes.data?.data || []).length,
          networkConnections: (connectionsRes.data?.data || []).filter(c => c.status === 'Accepted').length,
          jobReferralsApplied: (jobsRes.data?.data || []).length
        });
      });
    }

    // Load recommended data when the dashboard mounts
    fetchAlumni()
      .then((res) => setAlumni((res.data?.data || []).slice(0, 3)))
      .catch(() => {});
    fetchJobs()
      .then((res) => setJobs((res.data?.data || []).slice(0, 3)))
      .catch(() => {});
    fetchEvents()
      .then((res) => setEvents((res.data?.data || []).slice(0, 3)))
      .catch(() => {});
    fetchPosts()
      .then((res) => setPosts((res.data?.data || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Student Dashboard
            </h2>
            <p className="text-sm text-gray-600">
              Get a snapshot of alumni mentors, job referrals, events and network activity.
            </p>
          </div>
          <span className="badge bg-orange-50 text-[#F37021]">
            Connected to REVA Alumni Network
          </span>
        </header>

        {/* Stats Section */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="card p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Mentorship Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.mentorshipRequests}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
          </div>
          <div className="card p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Network Connections</p>
              <p className="text-2xl font-bold text-gray-900">{stats.networkConnections}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            </div>
          </div>
          <div className="card p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Job Referrals Applied</p>
              <p className="text-2xl font-bold text-gray-900">{stats.jobReferralsApplied}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-6">
            <div className="card p-4">
              <div className="card-header">
                <h3 className="card-title">Recommended Alumni Mentors</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {alumni.map((a) => (
                  <AlumniCard key={a.id} alumni={a} />
                ))}
                {alumni.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No alumni loaded yet. Ensure the backend server is running.
                  </p>
                )}
              </div>
            </div>

            <div className="card p-4">
              <div className="card-header">
                <h3 className="card-title">Networking Posts</h3>
              </div>
              <div className="space-y-4">
                {posts.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
                {posts.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Networking feed is empty or failed to load.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="card p-4">
              <div className="card-header">
                <h3 className="card-title">Job Referrals</h3>
              </div>
              <div className="space-y-4">
                {jobs.map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
                {jobs.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No job referrals available right now.
                  </p>
                )}
              </div>
            </div>

            <div className="card p-4">
              <div className="card-header">
                <h3 className="card-title">Upcoming Events</h3>
              </div>
              <div className="space-y-4">
                {events.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
                {events.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No upcoming alumni events at the moment.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

