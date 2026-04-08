// 🔹 support/commands.ts
export {}; // Zorgt dat het een module is

declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(role: 'admin' | 'teacher' | 'student'): void;
    }
  }
}

Cypress.Commands.add('loginAs', (role: 'admin' | 'teacher' | 'student') => {
  const users = {
    admin: {
      _id: '1',
      firstname: 'Admin',
      lastname: 'User',
      email: 'admin@lingua.com',
      role: 'admin',
    },
    teacher: {
      _id: '2',
      firstname: 'Teacher',
      lastname: 'User',
      email: 'teacher@lingua.com',
      role: 'teacher',
    },
    student: {
      _id: '3',
      firstname: 'Student',
      lastname: 'User',
      email: 'student@lingua.com',
      role: 'student',
    },
  };

  const user = users[role];
  if (!user) {
    throw new Error(`User with role '${role}' not found`);
  }

  cy.session(
    role,
    () => {
      cy.window().then((win) => {
        win.localStorage.setItem('currentuser', JSON.stringify(user));
        win.localStorage.setItem('JWT', 'fake-jwt-token');
      });
    },
    {
      validate() {
        cy.window()
          .its('localStorage')
          .invoke('getItem', 'JWT')
          .should('exist');
      },
    },
  );

  // Auth profile altijd mocken buiten de session
  cy.intercept('GET', '**/auth/profile', {
    statusCode: 200,
    body: user,
  }).as('getProfile');
});