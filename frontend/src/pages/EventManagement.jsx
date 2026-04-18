import React, { useState, useEffect } from 'react';
import { fetchEvents, deleteEvent, createAdminActivityLog, fetchEventRegistrations } from '../services/api';
import EventCard from '../components/EventCard';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetchEvents();
        setEvents(response.data.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");
  const adminName = adminUser.name || "Admin";

  const viewRegistrations = async (event) => {
    try {
      const response = await fetchEventRegistrations(event.id);
      setRegistrations(response.data.data);
      setSelectedEvent(event);
      setShowRegistrations(true);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const deletedEvent = events.find((event) => event.id === id);
        await deleteEvent(id);
        setEvents(events.filter(event => event.id !== id));
        await createAdminActivityLog({
          adminName,
          action: `Deleted event ${deletedEvent?.title || id}`
        });
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
      }
    }
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Event Management
          </h2>
          <p className="text-sm text-gray-600">
            Admin interface for managing alumni-led events, webinars and
            registrations.
          </p>
        </header>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading events...</p>
          </div>
        ) : (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              All Events ({events.length})
            </h3>
            {events.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map(event => (
                    <div key={event.id} className="relative">
                      <EventCard
                        event={event}
                        showViewRegistrations={true}
                        onViewRegistrations={viewRegistrations}
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => alert('Edit functionality not implemented yet')}
                          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="card p-6 text-center">
                <p className="text-gray-500">No events available.</p>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Registrations Modal */}
      {showRegistrations && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Registrations for {selectedEvent.title}
            </h3>
            {registrations.length > 0 ? (
              <ul className="space-y-2">
                {registrations.map((student) => (
                  <li key={student.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{student.name}</span>
                    <span className="text-sm text-gray-500">{student.email}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No registrations yet.</p>
            )}
            <button
              onClick={() => setShowRegistrations(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;

