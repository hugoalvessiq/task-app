describe("UserContext Tests", () => {
  beforeEach(() => {
    // Cleaning the database for each test
    cy.request("POST", "http://localhost:4000/reset-database");

    cy.register("Test User", "testuser@example.com", "secure_password");
    cy.wait(2000)

    // Programmatically log in before each test
    cy.visit("/login");
    cy.get("input[placeholder='Email'").type("testuser@example.com");
    cy.get("input[placeholder='Password'").type("secure_password");
    cy.get("button[type='submit']").click();

    // Wait to ensure user is logged in
    cy.wait(2000);
  });

  it("Should load user state after login", () => {
    cy.visit("/user_info");

    // Checks if user data is loaded in context
    cy.get(".user-data").should("contain", "Test user");
  });

  it("Must update user state when modifying profile data", () => {
    cy.visit("/user_info");

    cy.get(".update-user").click();

    cy.wait(2000);

    // Update username
    cy.get("input[name='name']").clear().type("Updated User");
    cy.get(".update").click();

    // checks if the status has been updated
    cy.get(".user-data").should("contain.text", "Updated user");
  });

  it("Should clear state and redirect when deleting user", () => {
    cy.visit("/user_info");

    // Execute the deleteUser function
    cy.get(".delete-button").click();
    cy.get(".btn-container-delete-task > .delete-button").click();

    // Check if redirection happened
    cy.url().should("include", "/welcome");

    // checks if the user state has been cleared in the context
    cy.window().its("localStorage.token").should("not.exist");
  });
});
