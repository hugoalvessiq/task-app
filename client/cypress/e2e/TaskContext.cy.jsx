describe("TaskContext Tests", () => {
  beforeEach(() => {
    // Clean Db and login after tests
    cy.request("POST", "http://localhost:4000/reset-database");

    cy.register("Test User", "testuser@example.com", "secure_password");
    cy.wait(2000);

    cy.visit("/login");

    cy.get("input[placeholder='Email']").type("testuser@example.com");
    cy.get("input[placeholder='Password']").type("secure_password");

    cy.get("button[type='submit']").click();

  });

  it("Should load 0 tasks when first powering on", () => {
    cy.wait(2000);

    cy.visit("/");

    // Check if the task list is loaded
    cy.get(".task-item").should("have.length", 0);
  });

  it("You must create a new task", () => {
    cy.visit("/");

    cy.get(".btn-container > :nth-child(1)").click();

    // Create new task
    cy.get("#title").type("New test task");
    cy.get('button[type="submit"]').click();

    // check if the new task appears in the list
    cy.get(".task--list").should("contain", "New test task");
  });

  it("Should update an existen task", () => {
    cy.visit("/");

    cy.get(".btn-container > :nth-child(1)").click();

    // Create Task
    cy.get("#title").type("New test task");
    cy.get('button[type="submit"]').click();

    // Update the title of the first task
    cy.get(".task-header");

    cy.get(".task-actions > :nth-child(1)").click();
    cy.wait(1000);
    cy.get(".editTask-form").should("be.visible");
    cy.get('.editTask-form > input[name="title"]')
      .clear()
      .type("Updated Task");
    cy.get(".save-changes").click();
  });

  it("Should delete a task", () => {
    cy.visit("/");

    cy.get(".btn-container > :nth-child(1)").click();

    // Create task
    cy.get("#title").type("New test task");
    cy.get('button[type="submit"]').click();

    // Delete first task
    cy.get(".task-header")
      .first()
      .within(() => {
        cy.get(".delete-task-btn").click();
      });

    cy.get(".delete-button").click();

    cy.wait(1000);

    cy.get(".no-task-description").should(
      "contain.text",
      "No Tasks Found. Create your first task!"
    );
    // Deleting task confirmation
    cy.get(".task-item").should("have.length.lessThan", 1);
  });

  it("Must seek a specific task", () => {
    cy.wait(2000);

    cy.visit("/");

    cy.get(".btn-container > :nth-child(1)").click();

    // Create Task
    cy.get("#title").type("Specific task");
    cy.get('button[type="submit"]').click();

    cy.get(".btn-container > :nth-child(2)").click();

    cy.get(".search-input").clear().type("Specific task");

    cy.get(".search-button").click();

    // checks if only the specific task appears in the results
    cy.get(".results-list > .task--list")
      .should("have.length", 1)
      .and("contain", "Specific task");
  });
});
