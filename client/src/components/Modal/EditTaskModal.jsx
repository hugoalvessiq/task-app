import DOMPurify from "dompurify";

/* eslint-disable react/prop-types */
const EditTaskModal = ({
  errorMessage,
  selectedTask,
  handleInputChangeTitle,
  handleDescriptionLength,
  setSelectedTask,
  handleUpdateTask,
  setIsEditing,
}) => {
  const sanitizedTitle = DOMPurify.sanitize(selectedTask.title);
  const sanitizedDescription = DOMPurify.sanitize(selectedTask.description);

  return (
    <form className="editTask-form" onSubmit={handleUpdateTask}>
      {errorMessage && (
        <p className="error-message-task-edit">{errorMessage}</p>
      )}
      <h2>Edit Task</h2>
      <input
        type="text"
        name="title"
        value={sanitizedTitle}
        onChange={handleInputChangeTitle}
      />
      <textarea
        type="text"
        id="description"
        name="description"
        // placeholder={selectedTask.description}
        value={sanitizedDescription}
        onChange={handleDescriptionLength}
        maxLength={180}
      />
      <span className="description-counter-edit">
        {180 - selectedTask.description.length}/180
      </span>
      <label htmlFor="completed" className="edit-label">
        <input
          type="checkbox"
          name="completed"
          id="completed"
          value={selectedTask.completed}
          onChange={(e) =>
            setSelectedTask((prev) => ({
              ...prev,
              completed: e.target.checked,
            }))
          }
          checked={selectedTask.completed}
        />
        {selectedTask.completed === true ? (
          <p className="text-completed">Completed</p>
        ) : (
          <p className="text-completed">Incomplete</p>
        )}
      </label>
      <div className="btn-container">
        <button className="primary-btn save-changes" type="submit">
          Save Changes
        </button>
        <button className="primary-btn" onClick={() => setIsEditing(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
};
export default EditTaskModal;
