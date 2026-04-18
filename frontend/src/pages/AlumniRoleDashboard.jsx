import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEventsByHost } from "../services/api";

const AlumniRoleDashboard = () => {
  const navigate = useNavigate();
  const [hostedEvents, setHostedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUser = user.name || "";

  useEffect(() => {
    const loadHostedEvents = async () => {
      if (!currentUser) {
        setLoadingEvents(false);
        return;
      }

      try {
        const response = await fetchEventsByHost(currentUser);
        setHostedEvents(response.data.data || []);
      } catch (error) {
        console.error("Error loading hosted events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadHostedEvents();
  }, [currentUser]);

  return (
    <div className="flex-1 bg-gray-50">
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
          <section className="card p-4">
            <h3 className="card-title">Mentorship Requests</h3>
            <p className="mt-2 text-sm text-gray-600">
              Placeholder space where alumni will review incoming mentorship
              requests from students.
            </p>
          </section>
          <section className="card p-4">
            <h3 className="card-title">Job Referrals</h3>
            <p className="mt-2 text-sm text-gray-600">
              Placeholder area for posting and tracking job referral
              opportunities.
            </p>
          </section>
          <section className="card p-4">
            <h3 className="card-title">Career Advice Posts</h3>
            <p className="mt-2 text-sm text-gray-600">
              Placeholder section for sharing posts and advice with students.
            </p>
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
              <span className="text-xs text-blue-600 underline">View all</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AlumniRoleDashboard;

