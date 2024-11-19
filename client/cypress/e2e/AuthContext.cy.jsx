describe("AuthContext - Fluxo de Autenticação", () => {
  beforeEach(() => {
    cy.request("POST", "http://localhost:4000/reset-database");
    cy.wait(2000)
  });


  afterEach(() => {
    cy.request("POST", "http://localhost:4000/reset-database");
  });

  it("Should redirect unauthenticated users to the welcome page", () => {
    cy.window().then((win) => win.localStorage.removeItem("token"));
    cy.visit("http://localhost:5173/");
    cy.url().should("include", "/welcome");
  });

  it("Must allow login and update authentication status", () => {
    cy.register("Test User", "testuser@example.com", "secure_password");
    cy.wait(2000)
    
    cy.login("testuser@example.com", "secure_password");

    cy.window().its("localStorage.token").should("exist");
    cy.url().should("include", "/");

    cy.visit("http://localhost:5173/user_info");
    cy.get(".delete-button").click();
    cy.get(".btn-container-delete-task > .delete-button").click();
  });

  it("Must allow registration, authentication and profile updates", () => {
    cy.register("New User", "newuser@example.com", "new_secure_password");

    cy.window().its("localStorage.token").should("exist");
    cy.visit("http://localhost:5173/user_info");

    cy.get(".update-user").click()

    cy.wait(2000)

    cy.get("input[name='name']").clear({ force: true }).type("Updated User");
    cy.get(".update").click();
    cy.get(".user-data").should("contain.text", "Updated user");

    cy.get(".delete-button").click();
    cy.get(".btn-container-delete-task > .delete-button").click();
  });
});
