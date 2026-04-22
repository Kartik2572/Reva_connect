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
    <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/20 relative min-h-[calc(100vh-64px)] overflow-hidden transition-colors duration-300">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-100/40 to-transparent dark:from-orange-500/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
              Student Dashboard
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
              Your personalized hub for alumni connections, job referrals, and events.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-orange-50 dark:bg-orange-900/30 px-4 py-1.5 text-sm font-bold text-[#F37021] dark:text-orange-400 border border-orange-100 dark:border-orange-800/50 shadow-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#F37021] dark:bg-orange-400 mr-2 animate-pulse"></span>
            Connected to REVA Network
          </span>
        </header>

        {/* Stats Section */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <div className="card p-6 flex items-center justify-between group cursor-default">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1">Mentorship Requests</p>
              <p className="text-4xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{stats.mentorshipRequests}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-800/50 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
          </div>
          <div className="card p-6 flex items-center justify-between group cursor-default">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1">Network Connections</p>
              <p className="text-4xl font-black text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">{stats.networkConnections}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl text-green-600 dark:text-green-400 border border-green-100/50 dark:border-green-800/50 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            </div>
          </div>
          <div className="card p-6 flex items-center justify-between group cursor-default">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1">Job Referrals Applied</p>
              <p className="text-4xl font-black text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">{stats.jobReferralsApplied}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl text-purple-600 dark:text-purple-400 border border-purple-100/50 dark:border-purple-800/50 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-8">
            <div className="card p-6">
              <div className="card-header">
                <h3 className="card-title">Recommended Alumni Mentors</h3>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {alumni.map((a) => (
                  <AlumniCard key={a.id} alumni={a} />
                ))}
                {alumni.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    No alumni loaded yet. Ensure the backend server is running.
                  </p>
                )}
              </div>
            </div>

            <div className="card p-6">
              <div className="card-header">
                <h3 className="card-title">Networking Posts</h3>
              </div>
              <div className="space-y-5">
                {posts.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
                {posts.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    Networking feed is empty or failed to load.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="card p-6">
              <div className="card-header">
                <h3 className="card-title">Job Referrals</h3>
              </div>
              <div className="space-y-5">
                {jobs.map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
                {jobs.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    No job referrals available right now.
                  </p>
                )}
              </div>
            </div>

            <div className="card p-6">
              <div className="card-header">
                <h3 className="card-title">Upcoming Events</h3>
              </div>
              <div className="space-y-5">
                {events.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
                {events.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
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

