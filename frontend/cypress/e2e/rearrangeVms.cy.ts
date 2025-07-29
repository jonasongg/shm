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

  it("allows drag and drop which changes the position of card", () => {
    cy.contains("Rearrange VMs").click();

    cy.get("div[data-slot=card]")
      .first()
      .then(($card1) => {
        const pos1 = $card1.offset();
        $card1[0].dispatchEvent(new MouseEvent("mousedown", { button: 0 }));

        cy.get("div[data-slot=card]")
          .eq(1)
          .then(($card2) => {
            cy.window().then(({ scrollX, scrollY }) => {
              const pos2 = $card2.offset();
              if (!pos1 || !pos2)
                throw new Error("Could not get card positions");

              // must dispatch like this for gridstack to register the event
              $card1[0].dispatchEvent(
                new MouseEvent("mousemove", {
                  button: 0,
                  clientX: pos1.left,
                  clientY: pos1.top,
                }),
              );
              $card1[0].dispatchEvent(
                new MouseEvent("mousemove", {
                  button: 0,
                  clientX: pos2.left,
                  clientY: pos2.top,
                }),
              );
              cy.wrap($card2).trigger("mouseup", { force: true });

              // should have swapped positions
              cy.contains("Stop rearranging VMs").click();
              cy.window()
                .scrollTo(scrollX, scrollY)
                .then(() => {
                  const nPos1 = $card1.offset()!;
                  const nPos2 = $card2.offset()!;

                  expect(nPos1.left).to.be.closeTo(pos2.left, 5);
                  expect(nPos1.top).to.be.closeTo(pos2.top, 5);
                  expect(nPos2.left).to.be.closeTo(pos1.left, 5);
                  expect(nPos2.top).to.be.closeTo(pos1.top, 5);
                });
            });
          });
      });
  });

  it("allows resizing", () => {
    cy.contains("Rearrange VMs").click();

    cy.get("div[data-slot=card]")
      .first()
      .trigger("mouseover")
      .then(($card) => {
        const initialWidth = $card.width();
        const initialHeight = $card.height();

        if (!initialWidth || !initialHeight)
          throw new Error("Could not get initial card dimensions");

        // Resize the card
        cy.wrap($card)
          .siblings("div.ui-resizable-handle")
          .then(($handle) => {
            const position = $handle.offset();
            if (!position) throw new Error("Could not get handle position");

            // must dispatch like this for gridstack to register the event
            $handle[0].dispatchEvent(
              new MouseEvent("mousedown", { button: 0 }),
            );

            $handle[0].dispatchEvent(
              new MouseEvent("mousemove", {
                button: 0,
                clientX: position.left + initialWidth,
                clientY: position.top + initialHeight,
              }),
            );
            $handle[0].dispatchEvent(
              new MouseEvent("mousemove", {
                button: 0,
                clientX: position.left + initialWidth,
                clientY: position.top + initialHeight,
              }),
            );
            cy.wrap($handle).trigger("mouseup", { force: true });
          });

        // Check that the card has been resized
        cy.contains("Stop rearranging VMs").click();
        cy.get("div[data-slot=card]")
          .first()
          .then(($resizedCard) => {
            expect($resizedCard.width()).to.be.at.least(initialWidth * 2);
            expect($resizedCard.height()).to.be.at.least(initialHeight * 2);
          });
      });
  });
});
