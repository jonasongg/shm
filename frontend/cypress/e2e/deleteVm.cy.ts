describe("delete vm dialog", () => {
  const openDialog = () => {
    cy.get("button[data-slot=alert-dialog-trigger]").first().click();
    cy.get("div[role=alertdialog]").should("exist");
  };

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

    // first checkbox should be checked
    cy.get("div[role=radiogroup]>div[data-slot=form-item]")
      .first()
      .find("button")
      .should("have.attr", "aria-checked", "true");

    // second checkbox should be unchecked, and clicking it should check it
    cy.get("div[role=radiogroup]>div[data-slot=form-item]")
      .eq(1)
      .find("button")
      .should("have.attr", "aria-checked", "false")
      .click()
      .should("have.attr", "aria-checked", "true");

    // then, first checkbox should be unchecked
    cy.get("div[role=radiogroup]>div[data-slot=form-item]")
      .first()
      .find("button")
      .should("have.attr", "aria-checked", "false");
  });

  it("should delete vm properly", () => {
    // delete the test vm
    cy.contains(Cypress.env("testVms")[0].name)
      .siblings("button[data-slot=alert-dialog-trigger]")
      .click();

    // vm only, not docker
    cy.get("div[role=radiogroup]>div[data-slot=form-item]")
      .eq(1)
      .find("button")
      .should("have.attr", "aria-checked", "false")
      .click()
      .should("have.attr", "aria-checked", "true");

    // then it should no longer exist
    cy.get("div[data-slot=alert-dialog-footer]>button").first().click();
    cy.get("div[role=alertdialog]").should("not.exist");
    cy.contains("div[data-slot=card]", Cypress.env("testVms")[0].name).should(
      "not.exist",
    );
  });
});
