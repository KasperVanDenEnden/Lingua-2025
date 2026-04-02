const mockTeacher = {
  _id: '2',
  firstname: 'Teacher',
  lastname: 'User',
  email: 'teacher@lingua.com',
  role: 'teacher',
};

const mockCourse = {
  _id: '1',
  title: 'Bestaande cursus',
  description: 'Een bestaande beschrijving.',
  price: 99,
  maxStudents: 15,
  language: 'Dutch',
  status: 'Active',
  teachers: [mockTeacher],
  starts: '2025-01-01',
  ends: '2025-06-01',
};

function setupAndVisit(path: string) {
  cy.viewport(1280, 720);

  cy.loginAs('teacher');

 // Mock profile
  cy.intercept('GET', '**/profile**', {
    statusCode: 200,
    body: { id: 'me', firstname: 'Test', lastname: 'User', role: 'teacher' },
  }).as('getProfile');

  // Mock API calls die 401 gaven
  cy.intercept('GET', '**/api/user**', {
    statusCode: 200,
    body: [mockTeacher], // of een enkele user afhankelijk van je test
  }).as('getUser');

  cy.intercept('GET', '**/api/course**', {
    statusCode: 200,
    body: [mockCourse],
  }).as('getCourse');

  // Mock lijst van users/courses
  cy.intercept('GET', '**/user**', {
    statusCode: 200,
    body: [mockTeacher],
  }).as('getUsers');

  cy.intercept('GET', '**/course**', {
    statusCode: 200,
    body: [],
  }).as('getCourses');

  cy.visit(path);

  // Wacht op de mocks
  cy.wait('@getProfile');
  cy.wait('@getUsers');
  cy.wait('@getUser');
  cy.wait('@getCourse');
}

// ─── Navigatie ────────────────────────────────────────────────────────────────

describe('Course navigatie', () => {
  beforeEach(() => {
    setupAndVisit('/dashboard');
  });

  it('navigeert naar courses/new via navbar en New course knop', () => {
    cy.contains('Courses').click();
    cy.contains('All courses').click();

    cy.url().should('include', '/courses');
    cy.wait('@getCourses');

    cy.contains('New course').click();
    cy.url().should('include', '/courses/new');

    cy.get('form').should('be.visible');
  });
});

// ─── Course Form ───────────────────────────────────────────────────────────────

describe('Course Form', () => {
  context('New course form (create mode)', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/courses', {
        statusCode: 201,
        body: {},
      }).as('createCourse');

      setupAndVisit('/courses/new');
    });

    it('should display the form with all required fields', () => {
      cy.get('form').should('be.visible');

      cy.get('#title').should('be.visible');
      cy.get('#description').should('be.visible');
      cy.get('#price').should('be.visible');
      cy.get('#maxStudents').should('be.visible');
      cy.get('#language').should('be.visible');
      cy.get('#teacher').should('be.visible');
      cy.get('#starts').should('be.visible');

      // ❗ ends is optioneel maar moet wel bestaan
      cy.get('#ends').should('be.visible');
    });

    it('should NOT show status field in create mode', () => {
      cy.get('#status').should('not.exist');
    });

    it('should show "Submit" button in create mode', () => {
      cy.get('button[type="submit"]').should('contain.text', 'Submit');
    });

    it('should disable submit when empty', () => {
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should validate required fields', () => {
      cy.get('#title').focus().blur();
      cy.contains('title is required');

      cy.get('#description').focus().blur();
      cy.contains('Description is required');

      cy.get('#price').focus().blur();
      cy.contains('Price is required');

      cy.get('#maxStudents').focus().blur();
      cy.contains('Max Students is required');

      cy.get('#language').focus().blur();
      cy.contains('Please select a language');

      cy.get('#teacher').focus().blur();
      cy.contains('Select a teacher');
    });

    it('should validate business rules', () => {
      cy.get('#price').type('-10');
      cy.get('#maxStudents').type('0');

      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should enable submit when valid (without ends)', () => {
      cy.get('#title').type('Angular Fundamentals');
      cy.get('#description').type('Course desc');
      cy.get('#price').type('49');
      cy.get('#maxStudents').type('20');

      cy.get('#language').select('English');
      cy.get('#teacher').select('Teacher User');

      cy.get('#starts')
        .invoke('val', '2026-01-01')
        .trigger('change');

      cy.get('button[type="submit"]').should('not.be.disabled');
    });

    it('should validate end date after start date', () => {
      cy.get('#title').type('Angular Fundamentals');
      cy.get('#description').type('Course desc');
      cy.get('#price').type('49');
      cy.get('#maxStudents').type('20');

      cy.get('#language').select('English');
      cy.get('#teacher').select('Teacher User');

      cy.get('#starts').invoke('val', '2026-05-01').trigger('change');
      cy.get('#ends').invoke('val', '2026-01-01').trigger('change');

      cy.contains('End date must be after start date');
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should submit successfully', () => {
      cy.get('#title').type('Angular Fundamentals');
      cy.get('#description').type('Course desc');
      cy.get('#price').type('49');
      cy.get('#maxStudents').type('20');

      cy.get('#language').select('English');
      cy.get('#teacher').select('Teacher User');

      cy.get('#starts')
        .invoke('val', '2026-01-01')
        .trigger('change');

      cy.get('button[type="submit"]').click();
      cy.wait('@createCourse');

      cy.url().should('include', '/courses');
    });
  });

  context('Edit course form (edit mode)', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/course/1', {
        statusCode: 200,
        body: mockCourse,
      }).as('getCourse');

      cy.intercept('PUT', '**/course/1', {
        statusCode: 200,
        body: { ...mockCourse, _id: '1' },
      }).as('updateCourse');

      setupAndVisit('/courses/1/edit');

      cy.wait('@getUser');
      cy.wait('@getCourse');
    });

    it('should show Save button in edit mode', () => {
      cy.get('button[type="submit"]').should('contain.text', 'Save');
    });

    it('should prefill form correctly', () => {
      cy.get('#title').should('have.value', mockCourse.title);
      cy.get('#description').should('have.value', mockCourse.description);
      cy.get('#price').should('have.value', String(mockCourse.price));
      cy.get('#maxStudents').should('have.value', String(mockCourse.maxStudents));
      cy.get('#language').should('have.value', mockCourse.language);
    });

    it('should update course', () => {
      cy.get('#title').clear().type('Updated Course');

      cy.get('button[type="submit"]').should('not.be.disabled').click();

      cy.wait('@updateCourse');

      cy.url().should('match', /\/courses\/1$/);
    });
  });

  context('Close button', () => {
    beforeEach(() => {
      setupAndVisit('/courses/new');
    });

    it('should close the form', () => {
      cy.get('button').find('.fa-xmark').click();
      cy.get('form').should('not.exist');
      cy.pause();
    });
  });
});