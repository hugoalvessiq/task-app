import React from "react";
import LoginForm from "../../../../src/components/Login/LoginForm";
import "../../../../src/components/Login/LoginForm.css"
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../../../src/context/AuthContext";

describe("LoginForm Component", () => {
  // beforeEach(() => {
  //   cy.visit('http://localhost:5174/login'); // Assuming your login route is '/login'
  // });

  // Basic Functionality Tests
  it("renders the login form with initial state", () => {
    cy.mount(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    cy.get('input[placeholder="Email"]').should("exist");
    cy.get('input[placeholder="Password"]').should("exist");
    cy.get("button").contains("Login").should("exist");
    // expect(
    //   screen.queryByText("Please fill all fields to log in.")
    // ).not.toBeInTheDocument();
  });

  it("successfully logs in with valid credentials (mock login)", () => {
    cy.intercept("POST", "http://localhost:4000/", (req) => {
      // Mock successful login logic here (e.g., returning a token)
      req.reply({ statusCode: 200, body: { token: "valid-token" } });
    });

    cy.mount(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    cy.get('input[name="email"]').type("valid@email.com");
    cy.get('input[name="password"]').type("secure_password");
    cy.get('button[type="submit"]').click();

    // cy.get(".login-form").should("not.exist"); // Expect redirection after login
    cy.url().should("include", "/"); // Assuming successful login redirects to '/'
  });

  it("shows error message for empty fields", () => {
    cy.mount(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    cy.get('button[type="submit"]').click();

    cy.get(".error-message").should("be.visible");
    cy.get(".error-message").should(
      "contain.text",
      "Please fill all fields to log in or a valid email!"
    );
  });

  // Input Validation Tests (modify as needed)
  it("validates email format (if applicable)", () => {
    cy.mount(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    cy.get('input[name="email"]').type("invalid_email");
    cy.get('button[type="submit"]').click();

    // Expect appropriate error message for invalid email format
    cy.get(".error-message").should("be.visible");
    cy.get(".error-message").should("contain.text", "Please fill all fields to log in or a valid email!");
  });

  it("validates password length (if applicable)", () => {
    cy.mount(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    cy.get('input[name="email"]').type("valid@email.com");
    cy.get('input[name="password"]').type("short");
    cy.get('button[type="submit"]').click();

    // Expect appropriate error message for short password
    cy.get(".error-message").should("be.visible");
    cy.get(".error-message").should(
      "contain.text",
      "Password must be at least 6 characters long"
    ); // Replace X with actual minimum length
  });

  // Interaction Tests
  it("focuses the email input on component mount", () => {
    cy.mount(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    cy.get('input[name="email"]').should("be.focused");
  });

  it("clears error message on user interaction (e.g., typing in input)", () => {
    cy.mount(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    
    cy.get('input[name="email"]').type("invalid_email");
    cy.get('button[type="submit"]').click();

    cy.get(".error-message").should("be.visible");

    cy.get('input[name="email"]').clear(); // Simulate user interaction
    cy.get(".error-message").should("not.exist");
  });
});

// describe("<LoginForm />", () => {
//   it("renders", () => {
//     // see: https://on.cypress.io/mounting-react
// cy.mount(
//   <MemoryRouter>
//     <LoginForm />
//   </MemoryRouter>,
// );

//     // Verificar se os campos de email, senha e o botão de login estão presentes
// cy.get('input[placeholder="Email"]').should("exist");
// cy.get('input[placeholder="Password"]').should("exist");
// cy.get("button").contains("Login").should("exist");
//   });

//   it("should display error message on empty form submission", () => {
//     cy.mount(
//       <MemoryRouter>
//         <LoginForm />
//       </MemoryRouter>,
//     ); // Monte o componente diretamente

//     // Simular clique no botão de login sem preencher o formulário
//     cy.get("button").contains("Login").click();

//     // Verificar se uma mensagem de erro é exibida
//     cy.contains("Please fill all fields to log in.").should("exist");
//   });

//   it("should login successfully with valid credentials", () => {
//     cy.mount(
//       <MemoryRouter>
//         <LoginForm />
//       </MemoryRouter>,
//     ); // Monte o componente diretamente

//     // Preencher os campos de login
//     cy.get('input[placeholder="Email"]').type("test@example.com");
//     cy.get('input[placeholder="Password"]').type("password123");

//     // Simular clique no botão de login
//     cy.get("button").contains("Login").click();
//   });

//   it("should successfully log in and update internal state", () => {
//     const mockLogin = cy.intercept('POST', '/api/login', {
//     statusCode: 200,
//     body: {
//       token: 'fakeToken',
//       name: 'Test User',
//       userId: '12345',
//     },
//   }).as('login');

//     cy.mount(
//       <MemoryRouter>
//         <AuthContext.Provider value={{ login: mockLogin }}>
//           <LoginForm />
//         </AuthContext.Provider>
//       </MemoryRouter>,
//     );

//     // Preencher os campos do formulário
//     cy.get('input[name="email"]').type("test@example.com");
//     cy.get('input[name="password"]').type("password123");

//     // Clicar no botão de login
//     cy.get('button[type="submit"]').click();

//     // Verificar se o mock do login foi chamado com os dados corretos
//     expect(mockLogin).toHaveBeenCalledWith({
//       email: "test@example.com",
//       password: "password123",
//     });

//     // Verificar se o estado de carregamento foi atualizado para false
//     cy.get(".loading-indicator").should("not.exist"); // Assumindo que você tem um indicador de carregamento com essa classe

//     // Verificar se a mensagem de erro não está mais visível (opcional)
//     cy.contains("Please fill all fields to log in.").should("not.exist");
//     // Verificar se a requisição foi feita
//   cy.wait('@login').its('response.statusCode').should('equal', 200);
//   });
// });
