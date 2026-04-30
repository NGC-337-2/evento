describe('EventO App Smoke Test', () => {
  it('should load the home page successfully', () => {
    cy.visit('http://localhost:5173');
    cy.contains('EventO').should('be.visible');
    cy.contains('Discover Amazing Events').should('be.visible');
  });

  it('should navigate to login page', () => {
    cy.visit('http://localhost:5173');
    cy.contains('Log in').click();
    cy.url().should('include', '/login');
    cy.contains('Welcome back').should('be.visible');
  });

  it('should navigate to register page', () => {
    cy.visit('http://localhost:5173');
    cy.contains('Sign up').click();
    cy.url().should('include', '/register');
    cy.contains('Create an account').should('be.visible');
  });
});
