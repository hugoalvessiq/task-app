describe("App Routing", () => {
  let userId;
  let token;

  beforeEach(() => {
    cy.request("POST", "http://localhost:4000/reset-database");

    cy.request("POST", "localhost:4000/users", {
      name: "Test User",
      email: "testuser@example.com",
      password: "secure_password",
    }).then((response) => {
      userId = response.body.userId;
    });

    cy.wait(2000);

    // Login to get token
    cy.request("POST", "localhost:4000/users/login", {
      email: "testuser@example.com",
      password: "secure_password",
    }).then((response) => {
      token = response.body.token;
    });
  });

  it("should display LoginForm on '/login' route", () => {
    cy.visit("localhost:5173/login");

    cy.get("input[placeholder='Email']").should("be.visible"); // or any unique selector
  });

  it("should redirect unauthenticate users away from protect route", () => {
    cy.visit("localhost:5173/");
    cy.url().should("include", "/welcome");
  });

  it("should display NoPage on unknown route", () => {
    cy.visit("localhost:5173/unknown");
    cy.wait(2000);
    cy.get(".nopage-container").should("be.visible");
  });

  it("should allow access to protect route when authenticated", () => {
    cy.request("POST", "http://localhost:4000/users/login", {
      email: "testuser@example.com",
      password: "secure_password",
    }).then((response) => {
      const token = response.body.token;
      const usename = response.body.username;
      const userId = response.body.userId;

      cy.window().then((win) => {
        win.localStorage.setItem("token", token);
        win.localStorage.setItem("username", usename);
        win.localStorage.setItem("userId", userId);
      });

      cy.visit("localhost:5173/");
      cy.get(".task-list-container").should("be.visible");
    });
  });

  afterEach(() => {
    // Deletes the user created using the token for authentication
    cy.request({
      method: "DELETE",
      url: `http://localhost:4000/users/`,
      headers: { Authorization: `${token}` },
      body: { id: userId },
    });
  });
});
