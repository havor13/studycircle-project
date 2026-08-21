import React, { useState, useEffect } from "react";
import { createEvent } from "../../services/plannerApi"; // ✅ import createEvent

const EventForm = ({ onEventCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [location, setLocation] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState([]);

  // ✅ Fetch groups from backend
  useEffect(() => {
    fetch("http://localhost:8000/groups/")
      .then((res) => res.json())
      .then(setGroups)
      .catch((err) => console.error("Failed to fetch groups:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newEvent = {
      title,
      description,
      start_at: startAt,
      end_at: endAt,
      location,
      group: groupId,
      created_by: 1, // ⚠️ Replace with logged-in user ID
    };

    try {
      const savedEvent = await createEvent(newEvent);
      onEventCreated(savedEvent);

      // ✅ Reset form
      setTitle("");
      setDescription("");
      setStartAt("");
      setEndAt("");
      setLocation("");
      setGroupId("");
    } catch (err) {
      console.error("Failed to create event:", err);
      alert("❌ Failed to create event.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Group Event</h3>
      <input
        type="text"
        placeholder="Event title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="datetime-local"
        value={startAt}
        onChange={(e) => setStartAt(e.target.value)}
        required
      />
      <input
        type="datetime-local"
        value={endAt}
        onChange={(e) => setEndAt(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <select
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
        required
      >
        <option value="">Select Group</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>
      <button type="submit">Add Event</button>
    </form>
  );
};

export default EventForm;
