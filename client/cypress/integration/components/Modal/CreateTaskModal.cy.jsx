import React, { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import CreateTaskModal from "../../../../src/components/Modal/CreateTaskModal";
import "../../../../src/index.css";
import "../../../../src/components/Tasks/TaskList.css";
import "../../../../src/components/Modal/Modal.css";
import "../../../../src/components/Login/LoginForm.css"

describe("CreateTaskModal Component", () => {
  let mockSetIsCreating;
  let mockHandleCreateTask;

  beforeEach(() => {
    mockSetIsCreating = cy.stub();
    mockHandleCreateTask = cy.stub();

    // Função auxiliar para montar o componente com estado interno
    const MountComponent = () => {
      const [task, setTask] = useState({ title: "", description: "" });

      const handleNewTaskChange = (event) => {
        const { name, value } = event.target;
        setTask((prev) => ({ ...prev, [name]: value }));
      };

      return (
        <MemoryRouter>
          <CreateTaskModal
            newTask={task}
            handleNewTaskchange={handleNewTaskChange}
            handleCreateTask={mockHandleCreateTask}
            errorMessage=""
            setIsCreating={mockSetIsCreating}
          />
        </MemoryRouter>
      );
    };

    cy.mount(<MountComponent />);
  });

  it("should render correctly", () => {
    cy.get(".create-task-form").should("exist");
    cy.get("input#title").should(
      "have.attr",
      "placeholder",
      "Title (Max 30 Characters)",
    );
    cy.get("textarea#description").should(
      "have.attr",
      "placeholder",
      "Description (Max 180 Characters)",
    );
    cy.get('button[type="submit"]').should("contain", "Create Task");
    cy.get('button[type="reset"]').should("contain", "Cancel");
  });

  it("should handle title input correctly", () => {
    const title = "New Task Title";

    // Digita no input e verifica se o valor é atualizado corretamente
    cy.get("input#title")
      .should("be.visible")
      .type(title)
      .should("have.value", title);
  });

  it("should handle description input correctly", () => {
    const description = "Task description here...";
    cy.get("textarea#description")
      .should("be.visible")
      .type(description)
      .should("have.value", description);
  });
});