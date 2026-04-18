import { useEffect, useState } from "react";
import { fetchAlumni, fetchEvents, fetchJobs, fetchPosts } from "../services/api.js";
import AlumniCard from "../components/AlumniCard.jsx";
import JobCard from "../components/JobCard.jsx";
import EventCard from "../components/EventCard.jsx";
import PostCard from "../components/PostCard.jsx";

const StudentDashboard = () => {
  const [alumni, setAlumni] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
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

