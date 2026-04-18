import React, { useState, useEffect } from 'react';
import { fetchUpcomingAlumniEvents, registerForEvent, fetchUserRegistrations } from '../services/api';
import EventCard from '../components/EventCard';

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registeredEvents, setRegisteredEvents] = useState(new Set());

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUser = user;

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetchUpcomingAlumniEvents();
        setEvents(response.data.data);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const handleRegister = async (eventId) => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (!currentUser || !currentUser.id) {
      alert("Please login first");
      return;
    }

    try {
      await registerForEvent({
        user_id: currentUser.id,
        event_id: eventId
      });

      alert("Registered successfully!");

      // Update UI immediately
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                registered_count: Number(event.registered_count || 0) + 1,
                isRegistered: true
              }
            : event
        )
      );

      setRegisteredEvents(prev => new Set([...prev, eventId]));
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetchUpcomingAlumniEvents();
        const eventsData = response.data.data;

        // Check which events the current user has registered for
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (currentUser && currentUser.id) {
          try {
            const registrationsResponse = await fetchUserRegistrations(currentUser.id);
            const registeredEventIds = registrationsResponse.data.data;
            setRegisteredEvents(new Set(registeredEventIds));
          } catch (regError) {
            console.error('Error fetching user registrations:', regError);
            setRegisteredEvents(new Set());
          }
        }

        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">Loading events...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Events & Webinars
          </h2>
          <p className="text-sm text-gray-600">
            Discover upcoming alumni-led sessions, AMAs and technical webinars.
          </p>
        </header>
        <section className="card p-4">
          <h3 className="card-title">Upcoming Events</h3>
          {events.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">
              No upcoming events at the moment.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  showRegister={currentUser.role === 'student'}
                  currentUser={currentUser}
                  onRegister={handleRegister}
                  isRegistered={registeredEvents.has(event.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentEvents;

