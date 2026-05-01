describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to the login page', () => {
    cy.contains('Login').click();
    cy.url().should('include', '/login');
  });

  it('should show error on invalid login', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid credentials').should('be.visible');
  });
});
