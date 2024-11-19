/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useTaskContext } from "../../context/TaskContext";
import { useAuthContext } from "../../context/AuthContext";
import api from "../../api/api";

import "./TaskSearch.css";
import TaskItem from "./TaskItem";

const TaskSearch = ({
  handleTaskCompletionToggle,
  handleEditClick,
  openDeleteModal,
  toggleDescription,
  expandedTaskId,
  setIsSearching,
  setErrorMessage,
}) => {
  const [searchTitle, setSearchTitle] = useState("");
  const [searchCompleted, setSearchCompleted] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [displayTask, setDisplayTask] = useState([]);
  const [message, setMessage] = useState("");
  const { tasks, setTasks } = useTaskContext();
  const { token } = useAuthContext();

  // Clear suggestions and displayed tasks when the input is cleared
  useEffect(() => {
    if (searchTitle) {
      fetchSuggestions(searchTitle);
    } else {
      setSuggestions([]);
      setDisplayTask([]);
      setTasks([]);
    }
  }, [searchTitle]);

  const fetchSuggestions = async (query) => {
    try {
      const response = await api.get(`/tasks/search?title=${query}`, {
        headers: { Authorization: `${token}` },
      });
      setSuggestions(response.data);
      setMessage("");
      if (suggestions.length === 0) {
        setDisplayTask([]);
      }
    } catch (error) {
      console.log(error.response.data);

      setSuggestions([]);
      setDisplayTask([]);

      setMessage("No tasks found with that title.");
    }
  };

  const handleSearch = async () => {
    try {
      const queryParams = [];
      if (searchTitle) queryParams.push(`title=${searchTitle}`);
      if (searchCompleted) queryParams.push(`completed=${searchCompleted}`);

      const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";

      const response = await api.get(`/tasks/search${queryString}`, {
        headers: { Authorization: `${token}` },
      });

      setDisplayTask(response.data);

      setTasks(response.data);
      setMessage("");
      setSuggestions([]);
    } catch (error) {
      setTasks([]);
      setDisplayTask([]);
      setMessage("No tasks found with this search term.");
    }
  };

  const handleSelectSuggestion = async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`, {
        headers: { Authorization: `${token}` },
      });

      setDisplayTask([response.data]);

      setTasks([response.data]);

      setMessage("");
      setSuggestions([]);
    } catch (error) {
      setMessage("Error fetching task.");
    }
  };

  return (
    <div className="task-search">
      <div className="section-input">
        <input
          type="text"
          placeholder="Search by title"
          value={searchTitle}
          onChange={(e) => {
            setSearchTitle(e.target.value);
          }}
          className="search-input"
        />
        <select
          value={searchCompleted}
          onChange={(e) => setSearchCompleted(e.target.value)}
          onClick={() => handleSearch()}
          className="completion-select"
        >
          <option value="">All</option>
          <option value="true">Completed</option>
          <option value="false">Not Completed</option>
        </select>
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
        <button
          onClick={() => setIsSearching(false)}
          className="cancel-search-button"
        >
          Cancel
        </button>
      </div>

      {/* Render suggestions */}
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((task) => (
            <li
              key={task._id}
              onClick={() => handleSelectSuggestion(task._id)}
              className="suggestion-item"
            >
              {task.title}
            </li>
          ))}
        </ul>
      )}

      {/* Message for no results */}
      {message && <p className="message">{message}</p>}
      <ul className="results-list">
        {displayTask.length > 0 &&
          tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              handleTaskCompletionToggle={handleTaskCompletionToggle}
              handleEditClick={handleEditClick}
              openDeleteModal={openDeleteModal}
              toggleDescription={toggleDescription}
              expandedTaskId={expandedTaskId}
              setErrorMessage={setErrorMessage}
            />
          ))}
      </ul>
    </div>
  );
};

export default TaskSearch;
