describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should present login form', () => {
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should login with valid credentials', () => {
    cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: { access_token: 'fake-jwt-token' },
    }).as('loginRequest');

    cy.intercept('GET', '**/auth/profile', {
        statusCode: 200,
        body: {
        _id: '1',
        firstname: 'Test',
        lastname: 'Admin',
        email: 'admin@lingua.com',
        role: 'admin'
      }
    }).as('profileRequest');
    cy.visit('/login');

    cy.get('input[type="email"]').type('admin@lingua.com');
    cy.get('input[type="password"]').type('test1234');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.wait('@profileRequest');

    cy.url().should('not.include', '/login');
  });

  it('shows error message with invalid credentials', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { message: 'Ongeldige inloggegevens' }
    }).as('loginFailed');

    cy.get('input[type="email"]').type('fout@lingua.com');
    cy.get('input[type="password"]').type('foutpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFailed');
    cy.contains('Ongeldige inloggegevens').should('be.visible');
  });

  it('shows validation error when email is empty', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').click().blur();
    cy.contains('Email is required').should('be.visible');
  });

  it('shows validation error when email has invalid format', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('geengeldigemail').blur();
    cy.contains('Invalid email format').should('be.visible');
  });

 it('shows error toastr with invalid credentials', () => {
    cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: { message: 'Ongeldige inloggegevens' }  
    }).as('loginFailed');

    cy.visit('/login');

    cy.get('input[type="email"]').type('fout@lingua.com');
    cy.get('input[type="password"]').type('foutpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFailed');
    cy.get('.toast-error')
        .should('be.visible')
        .and('contain', 'Ongeldige inloggegevens');
    });
});