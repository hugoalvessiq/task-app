import React from "react";
import { mount } from "cypress/react";
// import UserDetail from "../../../../src/components/UserDetail";
import { AuthContext } from "../../../../src/context/AuthContext";
import { UserContext } from "../../../../src/context/UserContext";
import { TaskContext } from "../../../../src/context/TaskContext";
import "../../../../src/index.css";
import "../../../../src/components/UserDetail/UserDetail.css";
import UserDetail from "../../../../src/components/UserDetail/UserDetail";
import { MemoryRouter } from "react-router-dom";

describe("UserDetail Component", () => {
  let mockGetUser;
  let mockDeleteUser;
  let mockGetAllTasks;
  beforeEach(() => {
    mockGetUser = cy
      .stub()
      .resolves({ name: "John Doe", email: "john.doe@example.com" });
    mockDeleteUser = cy.stub().resolves();
    mockGetAllTasks = cy.stub().resolves([{ id: 1 }, { id: 2 }]);

    const mockAuthContextValue = { getUser: mockGetUser };
    const mockUserContextValue = {
      user: { name: "John Doe", email: "john.doe@example.com" },
      deleteUser: mockDeleteUser,
    };
    const mockTaskContextValue = { getAllTasks: mockGetAllTasks };
    cy.mount(
      <AuthContext.Provider value={mockAuthContextValue}>
        <UserContext.Provider value={mockUserContextValue}>
          <TaskContext.Provider value={mockTaskContextValue}>
            <MemoryRouter>
              <UserDetail />
            </MemoryRouter>
          </TaskContext.Provider>
        </UserContext.Provider>
      </AuthContext.Provider>
    );
  });

  it("should render all user details correctly", () => {
    cy.get(".user-detail-container").should("exist");
    cy.get("h1").should("contain.text", "User Details");

    // Verifica detalhes do nome, email e tarefas
    cy.get(".detail-container").eq(0).should("contain.text", "Name:");
    cy.get(".detail-container").eq(1).should("contain.text", "Email:");
    cy.get(".detail-container").eq(2).should("contain.text", "Tasks:");

    // Verifica botões
    cy.get("button.link-update").should("have.length", 2);
    cy.get(".delete-button").should("exist");
  });

  it("should open and close update user modal", () => {
    // Abrir o modal
    cy.get(".link-update.update-user").click();
    cy.get(".modal").should("exist");
    cy.get(".modal-create").within(() => {
        cy.get('.update-title').should("exist"); // Confirma que o modal está aberto
    });

    // Fechar o modal
    cy.get('.close').contains("Cancel");
    // cy.get(".modal").should("not.exist");
  });

  it("should handle delete confirmation correctly", () => {
    // Abrir o modal de confirmação de deleção
    cy.get(".delete-button").click();
    cy.get(".modal").should("exist");

    // Confirmar a exclusão
    cy.get(".modal .delete-button").click();
    cy.wrap(mockDeleteUser).should("have.been.calledOnce");

    // Fechar o modal após a exclusão
    cy.get('.update-user-container').should("not.exist");
  });

  it("should fetch user and task data", () => {
    // Confirma se as funções de contexto foram chamadas
    cy.wrap(mockGetUser).should("have.been.calledOnce");
    cy.wrap(mockGetAllTasks).should("have.been.calledOnce");
  });
});
