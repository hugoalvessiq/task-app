import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";

/* eslint-disable react/prop-types */
const CreateTaskModal = ({
  newTask,
  handleNewTaskchange,
  handleCreateTask,
  errorMessage,
  setIsCreating,
}) => {
  const sanitizedTitle = DOMPurify.sanitize(newTask.title);
  const sanitizedDescription = DOMPurify.sanitize(newTask.description);

  const [errorLength, setErrorLength] = useState("");

  const handleDescriptionChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setErrorLength("");
    if (value.length <= 180) {
      handleNewTaskchange(e);
    } else {
      setErrorLength("Very long text!");
    }
  };

  const titleInputRef = useRef(null);
  useEffect(() => {
    titleInputRef.current.focus();
  }, []);

  return (
    <div className="create-task-form">
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {errorLength && <p className="error-message">{errorLength}</p>}
      <h1>Task List</h1>
      <h2>Create New Task</h2>
      <form onSubmit={handleCreateTask}>
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Title (Max 30 Characters)"
          value={sanitizedTitle}
          onChange={handleNewTaskchange}
          aria-selected
          ref={titleInputRef}
          maxLength={30}
        />
        <textarea
          name="description"
          id="description"
          placeholder="Description (Max 180 Characters)"
          value={sanitizedDescription}
          onChange={handleDescriptionChange}
          maxLength={180}
        />
        <span className="description-counter-create">
          {180 - sanitizedDescription.length}/180
        </span>
        <div className="btn-container-create">
          <button type="submit">Create Task</button>
          <button
            className="reset"
            type="reset"
            onClick={() => setIsCreating(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
export default CreateTaskModal;
