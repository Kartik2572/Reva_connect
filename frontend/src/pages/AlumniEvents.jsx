import React, { useState, useEffect, useMemo } from "react";
import {
  fetchEventsByHost,
  fetchOtherAlumniHostedEvents,
  fetchEventRegistrations
} from "../services/api";
import EventCard from "../components/EventCard";
import CreateEventModal from "../components/CreateEventModal";

const splitUpcomingPast = (events) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = events
    .filter((event) => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = events
    .filter((event) => new Date(event.date) < today)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return { upcoming, past };
};

const AlumniEvents = () => {
  const [hostedEvents, setHostedEvents] = useState([]);
  const [otherAlumniEvents, setOtherAlumniEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUser = user.name?.trim() || "";

  const myUpcomingPast = useMemo(() => splitUpcomingPast(hostedEvents), [hostedEvents]);
  const otherUpcomingPast = useMemo(
    () => splitUpcomingPast(otherAlumniEvents),
    [otherAlumniEvents]
  );

  const loadEvents = async () => {
    if (!currentUser) {
      setHostedEvents([]);
      setOtherAlumniEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [hostedResponse, otherResponse] = await Promise.all([
        fetchEventsByHost(currentUser),
        fetchOtherAlumniHostedEvents(currentUser)
      ]);
      setHostedEvents(hostedResponse.data?.data || []);
      setOtherAlumniEvents(otherResponse.data?.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setHostedEvents([]);
      setOtherAlumniEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [currentUser]);

  const viewRegistrations = async (event) => {
    try {
      const response = await fetchEventRegistrations(event.id);
      setRegistrations(response.data.data);
      setSelectedEvent(event);
      setShowRegistrations(true);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    }
  };

  const renderEventGrid = (events, options = {}) => {
    const { showViewRegistrations = false } = options;
    if (events.length === 0) {
      return (
        <div className="card p-6 text-center">
          <p className="text-gray-500">No events in this section.</p>
        </div>
      );
    }
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            showViewRegistrations={showViewRegistrations}
            onViewRegistrations={showViewRegistrations ? viewRegistrations : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Events</h2>
              <p className="text-sm text-gray-600">
                Events you host, and sessions hosted by other alumni.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 rounded-md bg-[#F37021] px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              Create event
            </button>
          </div>
        </header>

        {!currentUser && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Sign in with an account that has your name set to see &ldquo;My events&rdquo; and host
            listings.
          </div>
        )}

        <div className="mb-6 flex gap-1 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "my"
                ? "border-b-2 border-[#F37021] text-[#F37021]"
                : "border-b-2 border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            My events
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("other")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "other"
                ? "border-b-2 border-[#F37021] text-[#F37021]"
                : "border-b-2 border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Other alumni
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">Loading events…</p>
          </div>
        ) : activeTab === "my" ? (
          <>
            <section className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Upcoming ({myUpcomingPast.upcoming.length})
              </h3>
              {myUpcomingPast.upcoming.length > 0 ? (
                renderEventGrid(myUpcomingPast.upcoming, { showViewRegistrations: true })
              ) : (
                <div className="card p-6 text-center">
                  <p className="text-gray-500">No upcoming events you are hosting.</p>
                  <p className="mt-2 text-sm text-gray-400">Create an event to get started.</p>
                </div>
              )}
            </section>

            <section className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Past ({myUpcomingPast.past.length})
              </h3>
              {renderEventGrid(myUpcomingPast.past, { showViewRegistrations: true })}
            </section>
          </>
        ) : (
          <>
            <p className="mb-6 text-sm text-gray-600">
              Events hosted by other alumni accounts (excludes your own). Host names match the
              alumni&rsquo;s display name in the platform.
            </p>
            <section className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Upcoming ({otherUpcomingPast.upcoming.length})
              </h3>
              {renderEventGrid(otherUpcomingPast.upcoming)}
            </section>

            <section className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Past ({otherUpcomingPast.past.length})
              </h3>
              {renderEventGrid(otherUpcomingPast.past)}
            </section>
          </>
        )}
      </div>

      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEventCreated={loadEvents}
        currentUser={currentUser}
      />

      {showRegistrations && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Registrations for {selectedEvent.title}
            </h3>
            {registrations.length > 0 ? (
              <ul className="space-y-2">
                {registrations.map((student) => (
                  <li
                    key={student.id}
                    className="flex items-center justify-between rounded bg-gray-50 p-2"
                  >
                    <span>{student.name}</span>
                    <span className="text-sm text-gray-500">{student.email}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No registrations yet.</p>
            )}
            <button
              type="button"
              onClick={() => setShowRegistrations(false)}
              className="mt-4 w-full rounded-md bg-[#F37021] px-4 py-2 text-white hover:bg-orange-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniEvents;
