describe("add vm", () => {
  it("button exists", () => {
    cy.contains("Add VM");
  });

  const openDialog = () => {
    cy.contains("Add VM").click();
    cy.get("div[role=dialog]").should("exist");
  };

  it("dialog works as expected", () => {
    // escape and close button should close dialog
    openDialog();
    cy.get("body").type("{esc}");
    cy.get("div[role=dialog]").should("not.exist");

    openDialog();
    cy.get("button[data-slot=dialog-close]").first().click();
    cy.get("div[role=dialog]").should("not.exist");

    openDialog();
    cy.get("button[data-slot=dialog-close]").eq(1).click();
    cy.get("div[role=dialog]").should("not.exist");
  });

  it("cannot submit empty form", () => {
    openDialog();
    cy.get("button[type=submit]").click();
    cy.get("div[role=dialog]").should("exist");
    cy.contains("VM Name cannot be empty.").should("exist");
  });
});
