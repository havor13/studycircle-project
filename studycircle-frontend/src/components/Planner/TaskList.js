import React, { useEffect, useState } from "react";
import { getTasks } from "../../services/plannerApi";
import TaskForm from "./TaskForm";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);

  // Load tasks from backend
  useEffect(() => {
    getTasks().then(setTasks);
  }, []);

  // Handle new task creation
  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  return (
    <div>
      <h2>My Tasks</h2>
      {/* Task creation form */}
      <TaskForm onTaskCreated={handleTaskCreated} />

      {/* Task list */}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <strong>{task.title}</strong> —{" "}
            {task.completed ? "✅ Done" : "⏳ Pending"}
            {task.description && <p>{task.description}</p>}
            {task.due_date && (
              <small>📅 Due: {new Date(task.due_date).toLocaleString()}</small>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
