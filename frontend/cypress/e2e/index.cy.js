
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test if the error message includes 'TypeError: can't access property'
  return false
})


describe("Testing the Index Route", () => {
  beforeEach(() => {
    cy.setToken().then(() => {
      // intercepts URL then sets the cookie with the jwt
      cy.setCookie("refresh", `${Cypress.env("REFRESH_TOKEN_TEST")}`);
      cy.setCookie("access", `${Cypress.env("ACCESS_TOKEN_TEST")}`);
    });
    cy.login("test", "123");
    cy.wait("@validateJWTToken");
  });

  it ('Test the homepage and redirections', ()=> {

    cy.url().should('include', '');
    cy.get('.second-image').should('be.visible');
    cy.get('.second-image').should('have.class', 'background-image');
    cy.get('#\\:r9\\:').should('be.visible');


    cy.get('.css-f3ma9a-MuiGrid-root > .MuiGrid-root > .MuiTypography-root').should('have.text', 'Explore Courses');
    cy.get(':nth-child(1) > .MuiPaper-root > .MuiButtonBase-root > .courses-link > .MuiCardMedia-root').should('be.visible');
    cy.get(':nth-child(1) > .MuiPaper-root > .MuiButtonBase-root > .courses-link').should('be.visible');
    cy.get(':nth-child(1) > .MuiPaper-root > .MuiButtonBase-root > .courses-link > .MuiCardContent-root > .MuiTypography-root').click();
    cy.url().should('include', '/course');


    cy.get('.courses-link > .MuiButtonBase-root').click();
    cy.url().should('include', '#courses')

  });

  it('Test the pagination', ()=> {
    cy.get('[data-cy="index-pagination"]').scrollIntoView().should('be.visible');
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.MuiPagination-ul > :nth-child(2) > .MuiButtonBase-root').should('be.enabled');
    cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();
    cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').should('be.enabled');
    cy.get('[data-testid="NavigateNextIcon"]').click();
    cy.get(':nth-child(4) > .MuiButtonBase-root').should('be.enabled');
    cy.get('.MuiPagination-ul > :nth-child(2) > .MuiButtonBase-root').click();
    cy.get('.MuiPagination-ul > :nth-child(2) > .MuiButtonBase-root').should('be.enabled');
    /* ==== End Cypress Studio ==== */
  });

  it('Test the testimony or results section', ()=> {
    cy.get('[data-cy="index-pagination"]').scrollIntoView();

    /* ==== Generated with Cypress Studio ==== */
    cy.get('.css-ggq0th > .MuiTypography-h2').should('have.text', 'The Results');
    /* ==== End Cypress Studio ==== */
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('http://localhost:5173/');
    cy.get('[src="https://pbs.twimg.com/media/E1W13KnX0AEJeIb.jpg"]').should('be.visible');
    cy.get('[src="https://pbs.twimg.com/media/E1W13KnX0AEJeIb.jpg"]').should('be.visible');
    cy.get('[aria-hidden="false"] > .MuiGrid-container > :nth-child(1) > .MuiPaper-root > .MuiCardContent-root > .MuiTypography-gutterBottom > .MuiTypography-root').should('have.text', 'I became the mightest disciple');
    cy.get('[aria-hidden="false"] > .MuiGrid-container > :nth-child(1) > .MuiPaper-root > .MuiCardContent-root > .MuiTypography-gutterBottom > .MuiTypography-root').should('have.text', 'Thanks to this app i became ripped af');
    cy.get('[aria-hidden="true"] > .MuiGrid-container > :nth-child(2) > .MuiPaper-root > .MuiCardContent-root > .MuiTypography-gutterBottom > .MuiTypography-root').should('have.text', 'Okay i was able to become stronger than before and defeat muzan thanks to this app');
    cy.get('[aria-hidden="false"] > .MuiGrid-container > :nth-child(3) > .MuiPaper-root > .MuiCardContent-root > .MuiTypography-gutterBottom > .MuiTypography-root').should('have.text', 'I was depressed before I started doing any workouts and lost my confidence. Now I\'ve become a better person thanks to this app.');
    cy.get('.css-1h16bbz-MuiGrid-root > .MuiPaper-root').should('be.visible');
    /* ==== End Cypress Studio ==== */
  })



});
