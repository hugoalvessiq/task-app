import React, { useState } from "react";
import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";
import EditTaskModal from "../../../../src/components/Modal/EditTaskModal";
import DOMPurify from "dompurify";
import "../../../../src/components/Modal/Modal.css";
import "../../../../src/index.css";
import "../../../../src/components/Tasks/TaskList.css";

describe("EditTaskModal Component", () => {
  let mockSetIsEditing;
  beforeEach(() => {
    mockSetIsEditing = cy.stub();
    // Função auxiliar para montar o componente comestado interno
    const MountComponent = () => {
      const [task, setTask] = useState({
        title: "Initial Title",
        description: "Initial Description",
        completed: false,
      });
      const [errorMessage, setErrorMessage] = useState("");

      const handleInputChangeTitle = (event) => {
        const { value } = event.target;
        setTask((prev) => ({ ...prev, title: value }));
      };

      const handleDescriptionLength = (event) => {
        const { value } = event.target;
        if (value.length <= 180) {
          setTask((prev) => ({ ...prev, description: value }));
        } else {
          setErrorMessage("Descrição muito longa!");
        }
      };

      const handleUpdateTask = (event) => {
        event.preventDefault();
        if (!task.title.trim() || !task.description.trim()) {
          setErrorMessage("Title and description are required");
        } else {
          setErrorMessage("");
        }
      };

      return (
        <MemoryRouter>
          <EditTaskModal
            errorMessage={errorMessage}
            selectedTask={task}
            handleInputChangeTitle={handleInputChangeTitle}
            handleDescriptionLength={handleDescriptionLength}
            setSelectedTask={setTask}
            handleUpdateTask={handleUpdateTask}
            setIsEditing={mockSetIsEditing}
          />
        </MemoryRouter>
      );
    };

    cy.mount(<MountComponent />);
  });

  it("should render all elements with correct attributes and classes", () => {
    cy.get(".editTask-form").should("exist");
    cy.get("input[name='title'")
      .should("exist")
      .and("have.value", DOMPurify.sanitize("Initial Title"));

    cy.get("textarea[name='description']")
      .should("exist")
      .and("have.value", DOMPurify.sanitize("Initial Description"));

    cy.get("input#completed").should("exist").and("not.be.checked");
    cy.get(".description-counter-edit").should("contain", "161/180");

    cy.get(".btn-container").within(() => {
      cy.get("button.save-changes").should("contain", "Save Changes");
      cy.get("button").contains("Cancel").should("exist");
    });
  });

  it("should update title when input is changed", () => {
    const newTitle = "Updated Task Title";

    cy.get("input[name='title']")
      .clear()
      .type(newTitle)
      .should("have.value", DOMPurify.sanitize(newTitle));
  });

  it("should update description and reflect character count", () => {
    const newDescription = "This is a new description";

    cy.get("textarea[name='description']")
      .clear()
      .type(newDescription)
      .should("have.value", DOMPurify.sanitize(newDescription));

    cy.get(".description-counter-edit").should(
      "contain",
      `${180 - newDescription.length}/180`,
    );
  });

  it("should toggle completed checkbox", () => {
    cy.get("input#completed").check().should("be.checked");
    cy.get(".text-completed").should("contain", "Completed");

    cy.get("input#completed").uncheck().should("not.be.checked");
    cy.get(".text-completed").should("contain", "Incomplete");
  });

  it("should show an error message when submitting invalid data", () => {
    cy.get("input[name='title']").clear();
    cy.get("textarea[name='description']").clear();

    cy.get("button.save-changes").click();

    cy.get(".error-message-task-edit").should(
      "contain",
      "Title and description are required",
    );
  });

  it("should call cancel button action correctly", () => {
    cy.get("button").contains("Cancel").click();
  });
});
