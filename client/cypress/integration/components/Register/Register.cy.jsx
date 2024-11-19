import React from "react";
// import { mount } from "cypress/react";
import RegisterForm from "../../../../src/components/Register/RegisterForm";
import "../../../../src/components/Register/RegisterForm.css";
import { MemoryRouter } from "react-router-dom";

describe("RegisterFrom Component", () => {
  beforeEach(() => {
    // Monta o componente antes de teste
    cy.mount(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );
  });

  it("should render all elements with correct attributes and classes", () => {
    // Verifica título
    cy.get("h2").should("contain", "Register");

    // Verifiva o formulário e os inputs
    cy.get("form").should("exist");
    cy.get("label[for='name']").should("contain", "Name");
    cy.get("input#name").should("exist").and("have.attr", "required");
    // cy.get("input#name").should("exist").and("have.attr", "required");

    cy.get("label[for='email'").should("contain", "Email:");
    cy.get("input#email").should("exist").and("have.attr", "required");

    cy.get("label[for='password']").should("contain", "Password:");
    cy.get("input#password")
      .should("exist")
      .and("have.attr", "type", "password")
      .and("have.attr", "required");
    cy.get(".password span").should("contain", "Min length 6 characters!");

    // Verifica o botão de registro
    cy.get("button[type='submit']").should("exist").and("contain", "Register");
  });

  it("should focus on the name input by default", () => {
    // Verifica se o input de nome recebe o foco por padrão
    cy.focused().should("have.attr", "id", "name");
  });

  it("should update input values when typed", () => {
    // Simula a digitação nos campos
    const testData = {
      name: "Test User",
      email: "testuser@example.com",
      password: "pasword123",
    };

    cy.get("input#name")
      .type(testData.name)
      .should("have.value", testData.name);

    cy.get("input#email")
      .type(testData.email)
      .should("have.value", testData.email);

    cy.get("input#password")
      .type(testData.password)
      .should("have.value", testData.password);
  });

  it("should show the browser's required field validation for empty inputs", () => {
    // Simula o clique no botão de envio sem preencher os campos
    cy.get("button[type='submit']").click();

    // Verifica se o formulário não foi enviado, ou seja, a página não recarregou
    cy.url().should("include", "/"); // Certifica que ainda está na mesma página

    // Verifica se os inputs vazios têm o atributo required
    cy.get("input#name").then(($input) => {
      expect($input[0].checkValidity()).to.be.false; // Validação falha
      expect($input[0].validationMessage).to.equal("Preencha este campo."); // Mensagem do navegador
    });

    cy.get("input#email").then(($input) => {
      expect($input[0].checkValidity()).to.be.false; // Validação falha
      expect($input[0].validationMessage).to.equal("Preencha este campo."); // Mensagem do navegador
    });

    cy.get("input#password").then(($input) => {
      expect($input[0].checkValidity()).to.be.false; // Validação falha
      expect($input[0].validationMessage).to.equal("Preencha este campo."); // Mensagem do navegador
    });
  });

  // it("should deisable form inputs and show loading state during submission", () => {
  //   cy.intercept("POST", "http://localhost:4000/", (req) => {
  //     // Mock successful login logic here (e.g., returning a token)
  //     req.reply({ statusCode: 200, body: { token: "valid-token" } });
  //   });
    
  //   // digita valores válidos
  //   cy.get("input#name").type("Test User");
  //   cy.get("input#email").type("testuser@example.com");
  //   cy.get("input#password").type("password123");

  //   // Simula o envio do formulário
  //   cy.get("button[type='submit']").click();

  //   // Verifica se os inputs estão desativados e o componente de loading é exibido
  //   // cy.get("input").should("be.disabled");
  //   // cy.get("button[type='submit']").should("be.disabled");
  //   cy.get(".register-form").should("not.exist");
  //   cy.get(".loading").should("exist");
  // });
});
