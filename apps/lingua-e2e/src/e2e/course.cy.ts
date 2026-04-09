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
  students: [],
  starts: '2025-01-01',
  ends: '2025-06-01',
};

// renamed setup function
function setupCoursePage(path: string) {
  cy.viewport(1280, 720);
  cy.loginAs('teacher');

  cy.intercept('GET', '**/profile**', {
    statusCode: 200,
    body: { id: 'me', firstname: 'Test', lastname: 'User', role: 'teacher' },
  }).as('getProfile');

  cy.intercept('GET', '**/course/**', {
    statusCode: 200,
    body: mockCourse,
  }).as('getCourse');

  cy.intercept('GET', '**/user**', {
    statusCode: 200,
    body: [mockTeacher],
  }).as('getUsers');

  cy.visit(path);

  cy.wait('@getProfile');
}

describe('Course Detail', () => {
  beforeEach(() => {
    setupCoursePage('/courses/1');
  });

  it('should load course and teachers', () => {
    cy.wait('@getCourse');

    cy.contains(mockCourse.title).should('be.visible');
    cy.contains(mockTeacher.firstname).should('be.visible');
  });
});

describe('Course Form (basic)', () => {
  beforeEach(() => {
    setupCoursePage('/courses/new');
  });

  it('should render form', () => {
    cy.get('form').should('be.visible');
    cy.get('#title').should('be.visible');
    cy.get('#description').should('be.visible');
  });
});