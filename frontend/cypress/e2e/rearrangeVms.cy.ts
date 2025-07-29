describe("rearrange vms header button", () => {
  it("exists", () => {
    cy.contains("Rearrange VMs").should("exist");
  });

  it("toggles rearranging", () => {
    // handle should not exist before, and grid stack should be static
    cy.get("main>div").should("have.class", "grid-stack-static");
    cy.get("div.ui-resizable-handle").should("not.exist");

    cy.contains("Rearrange VMs").click();

    // handle should exist after, grid stack should be enabled
    cy.get("main>div").should("have.class", "grid-stack-animate");
    cy.get("div.ui-resizable-handle").should("exist");

    // check that the VM card is correctly greyed out
    cy.get("div[data-slot=card]")
      .first()
      .then(($card) => {
        expect(
          window.getComputedStyle($card[0], "::after").backgroundColor,
        ).to.not.equal("rgba(0, 0, 0, 0)");
      });

    // toggle
    cy.contains("Stop rearranging VMs").should("exist").click();

    // handle should not exist after, and grid stack should be static
    cy.get("main>div").should("have.class", "grid-stack-static");
    cy.get("div.ui-resizable-handle").should("not.exist");

    // check that the VM card is no longer greyed out
    cy.get("div[data-slot=card]")
      .first()
      .then(($card) => {
        expect(
          window.getComputedStyle($card[0], "::after").backgroundColor,
        ).to.equal("rgba(0, 0, 0, 0)");
      });
  });

  it("can be cancelled with escape button", () => {
    // handle should not exist before, and grid stack should be static
    cy.get("main>div").should("have.class", "grid-stack-static");
    cy.get("div.ui-resizable-handle").should("not.exist");

    cy.contains("Rearrange VMs").click();

    // handle should exist after, grid stack should be enabled
    cy.get("main>div").should("have.class", "grid-stack-animate");
    cy.get("div.ui-resizable-handle").should("exist");

    cy.get("body").type("{esc}");

    // handle should not exist after, and grid stack should be static
    cy.get("main>div").should("have.class", "grid-stack-static");
    cy.get("div.ui-resizable-handle").should("not.exist");
  });

  it("rearranging changes the position of card", () => {
    cy.contains("Rearrange VMs").click();

    cy.get("div[data-slot=card]")
      .first()
      .then(($card1) => {
        const pos1 = $card1[0].getBoundingClientRect();
        $card1[0].dispatchEvent(new MouseEvent("mousedown", { button: 0 }));

        cy.get("div[data-slot=card]")
          .eq(1)
          .then(($card2) => {
            cy.window().then((win) => {
              const pos2 = $card2[0].getBoundingClientRect();

              // cache old window scroll
              const scroll = { x: win.scrollX, y: win.scrollY };

              $card1[0].dispatchEvent(
                new MouseEvent("mousemove", {
                  button: 0,
                  clientX: pos1.left + pos1.width / 2,
                  clientY: pos1.top + pos1.height / 2,
                }),
              );
              $card1[0].dispatchEvent(
                new MouseEvent("mousemove", {
                  button: 0,
                  clientX: pos2.left + pos2.width / 2,
                  clientY: pos2.top + pos2.height / 2,
                }),
              );
              cy.wrap($card2).trigger("mouseup", { force: true });

              // should have swapped positions
              cy.contains("Stop rearranging VMs")
                .click()
                .then(() => {
                  const nPos1 = $card1[0].getBoundingClientRect();
                  const nPos2 = $card2[0].getBoundingClientRect();

                  // new window scroll
                  const { scrollX, scrollY } = win;
                  expect(nPos1.x + scrollX).to.be.closeTo(pos2.x + scroll.x, 1);
                  expect(nPos1.y + scrollY).to.be.closeTo(pos2.y + scroll.y, 1);
                  expect(nPos2.x + scrollX).to.be.closeTo(pos1.x + scroll.x, 1);
                  expect(nPos2.y + scrollY).to.be.closeTo(pos1.y + scroll.y, 1);
                });
            });
          });
      });
  });
});
