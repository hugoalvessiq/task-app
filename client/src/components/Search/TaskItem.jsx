/* eslint-disable react/prop-types */
import { FaEdit, FaTrash } from "react-icons/fa";
import DOMPurify from "dompurify";
import capitalizeFirstLetter from "../../hook/capitalizerFirstLetter";

const TaskItem = ({
  task,
  handleTaskCompletionToggle,
  handleEditClick,
  openDeleteModal,
  toggleDescription,
  expandedTaskId,
  setErrorMessage,
}) => {
  return (
    <li
      key={task._id}
      onClick={() => toggleDescription(task._id)}
      className="task--list"
    >
      <div className="task-header">
        <div>
          <input
            type="checkbox"
            name="completed-list"
            id="completed-lis"
            value={task.completed}
            onChange={(e) =>
              handleTaskCompletionToggle(task._id, e.target.checked)
            }
            checked={task.completed}
          />
          <span
            className={task.completed ? `task-completed` : ""}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(capitalizeFirstLetter(task.title)),
            }}
          ></span>
        </div>
        <div className="task-actions">
          <button
            onClick={() => {
              setErrorMessage("");
              handleEditClick(task);
            }}
          >
            <FaEdit />
          </button>
          <button
            onClick={() => openDeleteModal(task._id)}
            className="delete-task-btn"
          >
            <FaTrash className="delete-svg" />
          </button>
          <button className="description-toggle">
            {expandedTaskId === task._id ? "-" : "+"}
          </button>
        </div>
      </div>
      {expandedTaskId === task._id && (
        <div className="task-description">
          <p
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                capitalizeFirstLetter(task.description)
              ),
            }}
          ></p>
        </div>
      )}
    </li>
  );
};
export default TaskItem;
