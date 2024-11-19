import React, { useState } from "react";
import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";
// import UpdatePassword from "../../../../src/components/Modal/UpdatePassword";
import "../../../../src/index.css";
import "../../../../src/components/UpdatePassword/UpdatePassword.css";
import "../../../../src/components/Tasks/TaskList.css";
import UpdatePassword from "../../../../src/components/UpdatePassword/UpdatePassword";

describe("UpdatePassword Component", () => {
  beforeEach(() => {
    cy.mount(
      <MemoryRouter>
        <UpdatePassword />
      </MemoryRouter>
    );
  });

  it("should render all elements with correct attributes and classes", () => {
    cy.get(".update-password-container").should("exist");

    cy.get("h2").should("contain", "Change Password");

    cy.get("input[name='currentPassword']")
      .should("exist")
      .and("have.value", "");

    cy.get("input[name='newPassword']").should("exist").and("have.value", "");

    cy.get(".btn-container").within(() => {
      cy.get("button.update").should("exist").and("contain", "Update");
      cy.get("button.close").should("exist").and("contain", "Cancel");
    });
  });

  it("should update input fields as the user types", () => {
    const currentPassword = "oldPassword123";
    const newPassword = "newSecurePassword!";

    cy.get("input[name='currentPassword']")
      .type(currentPassword)
      .should("have.value", currentPassword);

    cy.get("input[name='newPassword']")
      .type(newPassword)
      .should("have.value", newPassword);
  });

  it("should display error message on failed update", () => {
    const currentPassword = "wrongPassword";
    const newPassword = "short";

    // Simular falha no backend
    // mockUpdatePassword.rejects(new Error("Error updating password"));

    cy.get("input[name='currentPassword']").type(currentPassword);
    cy.get("input[name='newPassword']").type(newPassword);

    cy.get("button.update").click();

    cy.get(".error-message").should("contain", "Error updating password");
  });
});
