describe("configuring vm dependencies", () => {
  const openDialog = () => {
    cy.contains("Configure VM dependencies").click();
    cy.get("div[role=dialog]").should("exist");
  };

  it("opens dialog", () => {
    openDialog();
  });

  it("can be closed", () => {
    openDialog();
    cy.get("button[data-slot=dialog-close]").eq(1).click();
    cy.get("div[role=dialog]").should("not.exist");

    openDialog();
    cy.get("body").type("{esc}");
    cy.get("div[role=dialog]").should("not.exist");
  });

  it("buttons should be disabled without changes", () => {
    openDialog();
    cy.get('div[data-slot="dialog-footer"] button').should("be.disabled");
  });
});
