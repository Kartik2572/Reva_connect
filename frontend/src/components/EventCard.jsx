import React, { useState } from 'react';

const EventCard = ({ event, showRegister = false, currentUser, onRegister, isRegistered = false, showViewRegistrations = false, onViewRegistrations }) => {
  const [registering, setRegistering] = useState(false);

  const handleRegister = async () => {
    if (!currentUser || isRegistered) return;

    setRegistering(true);
    try {
      await onRegister(event.id);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="card-header">
        <div>
          <h3 className="card-title">{event.title}</h3>
          <p className="text-sm text-gray-500">Host: {event.host}</p>
        </div>
        <span className="badge bg-orange-50 text-[#F37021]">
          {event.mode}
        </span>
      </div>
      <p className="text-sm text-gray-600">{event.description}</p>
      <p className="text-xs text-gray-500">
        {new Date(event.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })}{" "}
        · {event.time}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Registered Students: {event.registered_count || event.registeredStudents || 0}
        </span>
        {showRegister && currentUser && (
          <button
            onClick={handleRegister}
            disabled={event.isRegistered || isRegistered || registering}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              event.isRegistered || isRegistered
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {registering ? 'Registering...' : (event.isRegistered || isRegistered) ? 'Registered' : 'Register'}
          </button>
        )}
        {showViewRegistrations && (
          <button
            onClick={() => onViewRegistrations(event)}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Registrations
          </button>
        )}
      </div>
      {event.attachmentUrl && (
        <a
          href={event.attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          View attachment
        </a>
      )}
    </div>
  );
};

export default EventCard;

