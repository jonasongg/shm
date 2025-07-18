describe("delete vm dialog", () => {
  const openDialog = () => {
    cy.get("button[data-slot=alert-dialog-trigger]").first().click();
    cy.get("div[role=alertdialog]").should("exist");
  };

  beforeEach(() => {
    cy.get("main>div").should("have.class", "grid-stack-static");
  });

  it("exists", () => {
    openDialog();
  });

  it("can only be closed with cancel button", () => {
    openDialog();
    cy.get("body").type("{esc}");
    cy.get("div[role=alertdialog]").should("exist");

    openDialog();
    cy.get("div[data-slot=alert-dialog-footer]>button").eq(1).click();
    cy.get("div[role=alertdialog]").should("not.exist");
  });

  it("checboxes should behave as expected", () => {
    openDialog();

    cy.get("div[role=radiogroup]>div[data-slot=form-item]")
      .first()
      .find("button")
      .should("have.attr", "aria-checked", "true");

    cy.get("div[role=radiogroup]>div[data-slot=form-item]")
      .eq(1)
      .find("button")
      .should("have.attr", "aria-checked", "false")
      .click()
      .should("have.attr", "aria-checked", "true");

    cy.get("div[role=radiogroup]>div[data-slot=form-item]")
      .first()
      .find("button")
      .should("have.attr", "aria-checked", "false");
  });
});
