import { createContext, useContext, useState, useEffect } from "react";
import { useAuthContext } from "./AuthContext";
import api from "../api/api";

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  const { user, token } = useAuthContext();

  useEffect(() => {
    const fetchTasks = async () => {
      if (user) {
        try {
          const response = await api.get("/tasks", {
            headers: { Authorization: `${token}` },
          });
          setTasks(response.data);
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      }
    };

    fetchTasks();
  }, [token, user]);

  const createTask = async (taskData) => {
    try {
      const response = await api.post("/tasks", taskData, {
        headers: { Authorization: `${token}` },
      });
      setTasks([...tasks, response.data]);
      return { success: true, task: response.data };
    } catch (error) {
      console.error("Error creating:", error.response.data);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Error creating task",
      };
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const response = await api.patch(`/tasks/${taskId}`, updates, {
        headers: { Authorization: `${token}` },
      });
      const updatedTask = response.data;
      setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));
      return { success: true, task: updateTask };
    } catch (error) {
      console.log(error.response);
      return {
        success: false,
        message:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error updating task",
      };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`, {
        headers: { Authorization: `${token}` },
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const getTask = async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`, {
        headers: { Authorization: `${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("error fetching task:", error);
      return null;
    }
  };

  const getAllTasks = async () => {
    try {
      const response = await api.get(`/tasks/`, {
        headers: { Authorization: `${token}` },
      });

      return response.data;
    } catch (error) {
      console.error("error fetching task:", error);
      return null;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        createTask,
        updateTask,
        getTask,
        setTasks,
        getAllTasks,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => useContext(TaskContext);
export { TaskContext };
