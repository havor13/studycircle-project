import React from "react";
import TaskList from "../components/Planner/TaskList";
import EventCalendar from "../components/Planner/EventCalendar";
import "../PlannerPage.css"; // import CSS for styling

const Planner = () => {
  return (
    <div className="planner-page">
      <header className="planner-header">
        <h1>📘 Study Planner</h1>
        <p>Manage your personal tasks and group study events in one place.</p>
      </header>

      <main className="planner-grid">
        {/* Tasks Section */}
        <section className="planner-section">
          <h2>📝 Tasks</h2>
          <TaskList />
        </section>

        {/* Events Section */}
        <section className="planner-section">
          <h2>📅 Events</h2>
          <EventCalendar />
        </section>
      </main>
    </div>
  );
};

export default Planner;
