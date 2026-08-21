import React, { useEffect, useState } from "react";
import { getEvents } from "../../services/plannerApi";
import EventForm from "./EventForm";

const EventCalendar = () => {
  const [events, setEvents] = useState([]);

  // Load events from backend
  useEffect(() => {
    getEvents().then(setEvents);
  }, []);

  // Handle new event creation
  const handleEventCreated = (newEvent) => {
    setEvents([...events, newEvent]);
  };

  return (
    <div>
      <h2>📅 Group Events</h2>

      {/* Event creation form */}
      <EventForm onEventCreated={handleEventCreated} />

      {/* Event list */}
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <strong>{event.title}</strong> —{" "}
            {new Date(event.start_at).toLocaleString()} to{" "}
            {new Date(event.end_at).toLocaleString()}
            {event.location && <p>📍 {event.location}</p>}
            {event.group && <small>Group ID: {event.group}</small>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventCalendar;
