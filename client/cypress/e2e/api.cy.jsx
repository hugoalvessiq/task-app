describe("API without authentication", () => {
  it("should return HTML response when accessed with login", () => {
    cy.request({
      method: "GET",
      url: "localhost:4000",
      failOnStatusCode: false, // To prevent the test from failing on status codes other than 2xx
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.headers["content-type"]).to.include("text/html");
      expect(response.body).to.include(
        "<h1>Bem vindo à sua aplicação TaskApp</h1>"
      );
    });
  });
});
