import React, { useState, useEffect, useMemo } from 'react';
import { fetchUpcomingAlumniEvents, registerForEvent, fetchUserRegistrations, fetchPosts } from '../services/api';
import EventCard from '../components/EventCard';
import PostCard from '../components/PostCard';

const isWebinar = (event) => {
  const text = `${event.title || ''} ${event.description || ''}`;
  return (
    event.mode?.toLowerCase() === 'online' ||
    /webinar/i.test(text)
  );
};

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all');

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUser = user;

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetchUpcomingAlumniEvents();
        const eventsData = response.data?.data || [];

        if (localStorage.getItem('token')) {
          try {
            const registrationsResponse = await fetchUserRegistrations();
            const registeredEventIds = registrationsResponse.data?.data || [];
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

      try {
        const postsResponse = await fetchPosts();
        setPosts(postsResponse.data?.data || []);
      } catch (postError) {
        console.error('Error fetching posts:', postError);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadEvents();
  }, []);

  const handleRegister = async (eventId) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (!currentUser || !currentUser.id) {
      alert('Please login first');
      return;
    }

    try {
      await registerForEvent({ event_id: eventId });
      alert('Registered successfully!');

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

      setRegisteredEvents((prev) => new Set([...prev, eventId]));
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  const webinarEvents = useMemo(
    () => events.filter(isWebinar),
    [events]
  );

  const otherEvents = useMemo(
    () => events.filter((event) => !isWebinar(event)),
    [events]
  );

  const displayedEvents = useMemo(() => {
    if (activeTab === 'webinars') return webinarEvents;
    if (activeTab === 'events') return otherEvents;
    return events;
  }, [activeTab, events, webinarEvents, otherEvents]);

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">Loading alumni-hosted events...</div>
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
          <h2 className="text-2xl font-semibold text-gray-900">Events & Webinars</h2>
          <p className="text-sm text-gray-600">
            Discover alumni-hosted events, webinars, and informative posts.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
          {[
            { key: 'all', label: 'All' },
            { key: 'events', label: 'Events' },
            { key: 'webinars', label: 'Webinars' },
            { key: 'posts', label: 'Posts' }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors mb-2 ${
                activeTab === tab.key
                  ? 'bg-[#F37021] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'posts' ? (
          <section className="card p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="card-title">Alumni Posts</h3>
              <span className="text-sm text-gray-500">
                {posts.length} post{posts.length !== 1 && 's'} available
              </span>
            </div>
            
            {loadingPosts ? (
              <p className="mt-2 text-sm text-gray-600">Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="mt-2 text-sm text-gray-600">No posts available right now.</p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="card p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="card-title">
                {activeTab === 'webinars'
                  ? 'Webinars'
                  : activeTab === 'events'
                  ? 'Events'
                  : 'All Alumni Hosted Sessions'}
              </h3>
              <span className="text-sm text-gray-500">
                {displayedEvents.length} {activeTab === 'webinars' ? 'webinar' : 'event'}{displayedEvents.length !== 1 && 's'} available
              </span>
            </div>

            {displayedEvents.length === 0 ? (
              <p className="mt-2 text-sm text-gray-600">
                No alumni-hosted {activeTab === 'webinars' ? 'webinars' : activeTab === 'events' ? 'events' : 'sessions'} are available right now.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedEvents.map((event) => (
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
        )}
      </div>
    </div>
  );
};

export default StudentEvents;

