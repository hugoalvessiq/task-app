import React, { useState } from "react";
import { MemoryRouter } from "react-router-dom";
// import { mount } from "cypress/react";
// import UpdateUser from "../../../../src/components/Modal/UpdateUser";
import "../../../../src/components/UpdateUser/UpdateUser.css";
import UpdateUser from "../../../../src/components/UpdateUser/UpdateUser";
import { AuthContext } from "../../../../src/context/AuthContext";
import { UserContext } from "../../../../src/context/userContext";
// import { UserContext } from "../../../../src/context/userContext";

describe("UpdateUser Component", () => {
  let mockUpdateUser;
  let mockUpdateUserState;
  beforeEach(() => {
    const mockGetUser = cy
      .stub()
      .resolves({ name: "John Doe", email: "john.doe@example.com" });
    mockUpdateUser = cy.stub().resolves({ status: 200 });
    mockUpdateUserState = cy.stub();
    const mockCloseUpdateModal = cy.stub();
    const mockAuthContextValue = {
      getUser: mockGetUser,
      updateUser: mockUpdateUser,
    };

    const mockUserContextValue = {
      updateUserState: mockUpdateUserState,
    };

    cy.mount(
      <AuthContext.Provider value={mockAuthContextValue}>
        <UserContext.Provider value={mockUserContextValue}>
          <UpdateUser closeUpdateModal={mockCloseUpdateModal} />
        </UserContext.Provider>
      </AuthContext.Provider>
    );
  });

  it("should render all elements correctly", () => {
    cy.get(".update-title").should("contain", "Update User information");
    cy.get("input[name='name']").should("have.value", "John Doe");
    cy.get("input[name='email']").should("have.value", "john.doe@example.com");
    cy.get("button").contains("Update").should("exist");
    cy.get("button").contains("Cancel").should("exist");
  });

  it("should handle input changes", () => {
    cy.get("input[name='name']").clear().type("Jane Doe").should("have.value", "Jane Doe");
    cy.get("input[name='email']").clear().type("jane.doe@example.com").should("have.value", "jane.doe@example.com");
  });

  it("should call updateUser and updateUserState on valid form submission", () => {
    cy.get("input[name='name']").clear().type("Jane Doe");
    cy.get("input[name='email']").clear().type("jane.doe@example.com");
    cy.get("button").contains("Update").click();

    cy.wrap(mockUpdateUser).should("have.been.calledOnce");
    cy.wrap(mockUpdateUserState).should("have.been.calledOnceWith", {
      name: "Jane Doe",
      email: "jane.doe@example.com",
    });
  });

});
