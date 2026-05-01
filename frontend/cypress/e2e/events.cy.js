describe('Events Flow', () => {
  beforeEach(() => {
    cy.visit('/explore');
  });

  it('should display the list of events', () => {
    cy.get('h1').contains('Explore Events').should('be.visible');
    cy.get('.event-card').should('have.length.at.least', 1);
  });

  it('should filter events by category', () => {
    cy.contains('Categories').click();
    cy.contains('Music').click();
    cy.url().should('include', 'category=music');
  });
});
