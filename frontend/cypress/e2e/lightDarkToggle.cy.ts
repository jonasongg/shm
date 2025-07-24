describe("light/dark toggle", () => {
  it("defaults to light mode", () => {
    cy.contains("Toggle theme").find(".lucide-sun").should("be.visible");
    cy.contains("Toggle theme").find(".lucide-moon").should("not.be.visible");
  });

  it("toggles between light and dark mode", () => {
    cy.contains("Toggle theme").click();

    cy.contains("Toggle theme").find(".lucide-sun").should("not.be.visible");
    cy.contains("Toggle theme").find(".lucide-moon").should("be.visible");

    cy.contains("Toggle theme").click();

    cy.contains("Toggle theme").find(".lucide-sun").should("be.visible");
    cy.contains("Toggle theme").find(".lucide-moon").should("not.be.visible");
  });
});
