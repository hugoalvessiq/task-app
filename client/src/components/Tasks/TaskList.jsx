import { useEffect, useState } from "react";
import { useTaskContext } from "../../context/TaskContext";
import { FaPlus } from "react-icons/fa";
import { LiaSearchSolid } from "react-icons/lia";
import "./TaskList.css";
import "../Modal/Modal.css";
import CreateTaskModal from "../Modal/CreateTaskModal";
import EditTaskModal from "../Modal/EditTaskModal";
import DOMPurify from "dompurify";
import TaskSearch from "../Search/TaskSearch";
import TaskItem from "../Search/TaskItem";

const TaskList = () => {
  const { createTask, updateTask, getAllTasks, deleteTask } = useTaskContext();
  const [taskData, setTaskData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    completed: false,
  });
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isReordering, setIsReordering] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskIdDelete, setTaskIdDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = taskData.slice(indexOfFirstTask, indexOfLastTask);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(taskData.length / tasksPerPage);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const openDeleteModal = (taskId) => {
    setTaskIdDelete(taskId);
    setIsDeleteModalOpen(true);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getAllTasks();

        setTaskData(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [getAllTasks]);

  useEffect(() => {
    // triggers reordering when taskData is updated
    if (taskData.length > 0) {
      setIsReordering(true);
      const timer = setTimeout(() => {
        setIsReordering(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [taskData]);

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setIsEditing(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    const santizedTitle = DOMPurify.sanitize(selectedTask.title);
    const santizedDescription = DOMPurify.sanitize(selectedTask.description);

    if (selectedTask) {
      const response = await updateTask(selectedTask._id, {
        title: santizedTitle,
        description: santizedDescription,
        completed: selectedTask.completed,
      });
      if (!response.success) {
        setErrorMessage(response.message);
      } else {
        setIsEditing(false);
        setSelectedTask(null);
        setErrorMessage("");
      }
    }
  };

  const handleDeleteClick = async (taskId) => {
    try {
      await deleteTask(taskIdDelete);
      setTaskData((prev) => prev.filter((task) => task._id !== taskId));
      setTimeout(() => {
        setIsDeleteModalOpen(false);
      }, 0);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleDescriptionLength = (e) => {
    const value = e.target.value;
    if (value.length <= 180) {
      handleInputChangeDescription(e);
    } else {
      setErrorMessage("Description too long!");
    }
  };

  const handleInputChangeTitle = (e) => {
    const { name, value } = e.target;
    setSelectedTask((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };
  const handleInputChangeDescription = (e) => {
    const { name, value } = e.target;
    setSelectedTask((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleNewTaskchange = (e) => {
    // e.preventDefault();
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    const santizedTitle = DOMPurify.sanitize(newTask.title);
    const santizedDescription = DOMPurify.sanitize(newTask.description);

    setNewTask({
      title: santizedTitle,
      description: santizedDescription,
      completed: newTask.completed,
    });

    const response = await createTask(newTask);
    if (response.success) {
      setTimeout(() => {
        setIsCreating(false);
      }, 0);
    }

    if (!response.success) {
      setErrorMessage(response.message);
    } else {
      setNewTask({ title: "", description: "", completed: false });
      setErrorMessage("");
    }
  };

  const toggleDescription = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const handleTaskCompletionToggle = async (taskId, completed) => {
    try {
      await updateTask(taskId, { completed });
      setTaskData((prev) =>
        prev.map((task) =>
          task._id === taskId ? { ...task, completed } : task
        )
      );
    } catch (error) {
      console.error("Error updating task completion:", error);
    }
  };

  return (
    <div className="task-list-container">
      <div className="btn-container">
        {isSearching && (
          <div className="modal">
            <div className="search-modal">
              <TaskSearch
                handleTaskCompletionToggle={handleTaskCompletionToggle}
                handleEditClick={handleEditClick}
                openDeleteModal={openDeleteModal}
                toggleDescription={toggleDescription}
                expandedTaskId={expandedTaskId}
                setErrorMessage={setErrorMessage}
                setIsSearching={setIsSearching}
              />
            </div>
          </div>
        )}
        <button
          className="btn-modal"
          onClick={() => {
            setErrorMessage("");
            setIsCreating(true);
          }}
        >
          <FaPlus /> Add Task
        </button>
        <button
          className="btn-modal"
          onClick={() => {
            setErrorMessage("");
            setIsSearching(true);
          }}
        >
          <LiaSearchSolid className="search-icon" /> Search
        </button>
      </div>

      {isCreating && (
        <div className="modal">
          <CreateTaskModal
            newTask={newTask}
            handleNewTaskchange={handleNewTaskchange}
            handleCreateTask={handleCreateTask}
            setIsCreating={setIsCreating}
            errorMessage={errorMessage}
          />
        </div>
      )}

      <ul className={`task-list ${isReordering ? "task-reordering" : ""}`}>
        {currentTasks.length > 0 ? (
          currentTasks
            .sort((a, b) => a.completed - b.completed)
            .map((task) => (
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
            ))
        ) : (
          <p className="no-task-description">
            No Tasks Found. Create your first task!
          </p>
        )}
      </ul>
      <div className="pagination">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={currentPage === number ? "active" : ""}
          >
            {number}
          </button>
        ))}
      </div>
      {isDeleteModalOpen && (
        <div className="modal">
          <div className="modal-layout">
            <h3>Are you sure want ot delete this task?</h3>
            <div className="btn-container-delete-task">
              <button
                className="delete-button"
                onClick={() => handleDeleteClick()}
              >
                Deletar
              </button>
              <button
                className="primary-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {isEditing && selectedTask && (
        <div className="modal">
          <div className="modal-layout">
            <EditTaskModal
              errorMessage={errorMessage}
              selectedTask={selectedTask}
              handleInputChangeTitle={handleInputChangeTitle}
              handleDescriptionLength={handleDescriptionLength}
              setSelectedTask={setSelectedTask}
              handleUpdateTask={handleUpdateTask}
              setIsEditing={setIsEditing}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default TaskList;
