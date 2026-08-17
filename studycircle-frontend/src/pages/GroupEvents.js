import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles.css';

function GroupEvents() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_at: '',
    end_at: '',
    location: ''
  });
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get(`groups/${groupId}/events/`);
        console.log("Events response:", res.data); // Debugging
        setEvents(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events.');
        setLoading(false);
      }
    };
    fetchEvents();
  }, [groupId]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`groups/${groupId}/events/`, newEvent);
      setEvents([...events, res.data]);
      setNewEvent({ title: '', description: '', start_at: '', end_at: '', location: '' });
      alert('✅ Event created successfully!');
    } catch (err) {
      console.error('Error creating event:', err);
      alert('❌ Failed to create event.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`groups/${groupId}/events/${eventId}/`);
      setEvents(events.filter(e => e.id !== eventId));
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('❌ Failed to delete event.');
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`groups/${groupId}/events/${editingEvent.id}/`, editingEvent);
      setEvents(events.map(ev => ev.id === editingEvent.id ? res.data : ev));
      setEditingEvent(null);
      alert('✅ Event updated successfully!');
    } catch (err) {
      console.error('Error updating event:', err);
      alert('❌ Failed to update event.');
    }
  };

  return (
    <div className="events-container">
      <h2>📅 Group Events</h2>
      <p>You are viewing events for group ID: <strong>{groupId}</strong></p>

      {/* Back button */}
      <button className="back-btn" onClick={() => navigate('/groups')}>
        ← Back to Groups
      </button>

      {loading && <p>Loading events...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          {events.length > 0 ? (
            <ul className="event-list">
              {events.map(event => (
                <li key={event.id} className="event-card">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <p><strong>Start:</strong> {new Date(event.start_at).toLocaleString()}</p>
                  <p><strong>End:</strong> {new Date(event.end_at).toLocaleString()}</p>
                  {event.location && <p><strong>Location:</strong> {event.location}</p>}
                  <div className="event-actions">
                    <button onClick={() => setEditingEvent(event)}>Edit</button>
                    <button onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No events scheduled yet.</p>
          )}

          {/* Create Event Form */}
          <div className="create-event-form">
            <h3>Create New Event</h3>
            <form onSubmit={handleCreateEvent}>
              <input
                type="text"
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
              <input
                type="datetime-local"
                value={newEvent.start_at}
                onChange={(e) => setNewEvent({ ...newEvent, start_at: e.target.value })}
                required
              />
              <input
                type="datetime-local"
                value={newEvent.end_at}
                onChange={(e) => setNewEvent({ ...newEvent, end_at: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
              <button type="submit" className="create-event-btn">Create Event</button>
            </form>
          </div>

          {/* Edit Event Form */}
          {editingEvent && (
            <div className="edit-event-form">
              <h3>Edit Event</h3>
              <form onSubmit={handleUpdateEvent}>
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  required
                />
                <textarea
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                />
                <input
                  type="datetime-local"
                  value={editingEvent.start_at}
                  onChange={(e) => setEditingEvent({ ...editingEvent, start_at: e.target.value })}
                  required
                />
                <input
                  type="datetime-local"
                  value={editingEvent.end_at}
                  onChange={(e) => setEditingEvent({ ...editingEvent, end_at: e.target.value })}
                  required
                />
                <input
                  type="text"
                  value={editingEvent.location}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                />
                <button type="submit">Update Event</button>
                <button type="button" onClick={() => setEditingEvent(null)}>Cancel</button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default GroupEvents;
