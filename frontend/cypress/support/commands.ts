/// <reference types="cypress" />

import { DeleteVmRequestType } from "@/components/deleteVmDialog";
import { VmType } from "@/types/types";

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      createTestVm(index?: number): Chainable<void>;
      clearTestVms(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("createTestVm", (index: number = 1) => {
  const vm = {
    name: `Cypress Test VM ${index}`,
    autocreate: false,
  };
  cy.request("POST", "http://localhost:5043/api/vm", vm).then((response) => {
    Cypress.env("testVms", [
      ...(Cypress.env("testVms") as VmType[]),
      response.body,
    ]);
  });
});

Cypress.Commands.add("clearTestVms", () => {
  cy.request("GET", "http://localhost:5043/api/vm").then((response) => {
    const testVms: VmType[] = response.body;
    if (testVms && testVms.length) {
      testVms
        .filter((vm) => vm.name.startsWith("Cypress Test VM"))
        .forEach((vm) => {
          cy.request("DELETE", `http://localhost:5043/api/vm/${vm.id}`, {
            deleteType: "Vm",
          } satisfies DeleteVmRequestType);
        });
    }
  });

  Cypress.env("testVms", []);
});
