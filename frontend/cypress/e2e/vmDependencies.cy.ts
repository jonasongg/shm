describe("configuring vm dependencies header button", () => {
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

  const createDep = () => {
    const [test1, test2] = Cypress.env("testVms");
    openDialog();

    // drag right handle of VM1 to left handle of VM2
    cy.get("div.react-flow__nodes")
      .find(`div[data-id=${test1.id}]`)
      .should("exist")
      .find("div[data-handlepos=right")
      .trigger("mousedown", { button: 0 });

    cy.get("div.react-flow__nodes")
      .find(`div[data-id=${test2.id}]`)
      .should("exist")
      .find("div[data-handlepos=left")
      .trigger("mousemove")
      .trigger("mouseup");

    // edge should then exist
    cy.get("div.react-flow__edges")
      .find(`g[data-id=xy-edge__${test1.id}-${test2.id}]`)
      .should("exist");

    // save changes and dialog should disappear
    cy.get("div[data-slot=dialog-footer]")
      .find("button[data-slot=button]")
      .click();
    cy.get("div[role=dialog]").should("not.exist");

    // wait for refresh of VMs
    cy.intercept("GET", "").as("getVms");
    cy.wait("@getVms")
      .wait(500)
      .then(() => {
        openDialog();
        cy.get("div.react-flow__edges")
          .find(`g[data-id=${test1.id}-${test2.id}]`)
          .should("exist");
      });

    return [test1, test2];
  };

  it("can create dependency", () => {
    createDep();
  });

  it("can delete dependency", () => {
    const [test1, test2] = createDep();

    // click the delete button
    cy.get("div.react-flow__edgelabel-renderer")
      .find(`button[data-id=${test1.id}-${test2.id}]`)
      .should("exist")
      .click();

    // edge should no longer exist
    cy.get("div.react-flow__edges")
      .find(`g[data-id=${test1.id}-${test2.id}]`)
      .should("not.exist");

    // save changes and dialog should disappear
    cy.get("div[data-slot=dialog-footer]")
      .find("button[data-slot=button]")
      .click();
    cy.get("div[role=dialog]").should("not.exist");

    // wait for refresh of VMs
    cy.intercept("GET", "").as("getVms");
    cy.wait("@getVms")
      .wait(500)
      .then(() => {
        openDialog();
        cy.get("div.react-flow__edges")
          .find(`g[data-id=${test1.id}-${test2.id}]`)
          .should("not.exist");
      });
  });

  it("cannot create cyclical dependencies", () => {
    const [test1, test2] = Cypress.env("testVms");
    openDialog();

    // VM1 -> VM2 -> VM1 should not be allowed
    cy.get("div.react-flow__nodes")
      .find(`div[data-id=${test1.id}]`)
      .should("exist")
      .then(($test1) => {
        cy.get("div.react-flow__nodes")
          .find(`div[data-id=${test2.id}]`)
          .should("exist")
          .then(($test2) => {
            cy.wrap($test1)
              .find("div[data-handlepos=right")
              .trigger("mousedown", { button: 0 });
            cy.wrap($test2)
              .find("div[data-handlepos=left")
              .trigger("mousemove")
              .trigger("mouseup");

            cy.wrap($test2)
              .find("div[data-handlepos=right")
              .trigger("mousedown", { button: 0 });
            cy.wrap($test1)
              .find("div[data-handlepos=left")
              .trigger("mousemove")
              .trigger("mouseup");
          });
      });

    cy.get("div.react-flow__edges")
      .find(`g[data-id=xy-edge__${test1.id}-${test2.id}]`)
      .should("exist");

    cy.get("div.react-flow__edges")
      .find(`g[data-id=xy-edge__${test2.id}-${test1.id}]`)
      .should("exist");

    cy.get("div[data-slot=dialog-footer]")
      .find("button[data-slot=button]")
      .click();
    cy.get("div[role=dialog]").should("exist");
    cy.contains("There is a cycle in the VM dependencies!").should("exist");
  });
});
