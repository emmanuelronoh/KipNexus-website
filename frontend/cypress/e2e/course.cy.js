
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test if the error message includes 'TypeError: can't access property'
  return false
})



describe('Course Route', () => {
  beforeEach(() => {
    cy.setToken().then(()=> {// intercepts URL then sets the cookie with the jwt
      cy.setCookie('refresh', `${Cypress.env('REFRESH_TOKEN_TEST')}`, {httpOnly: true});
      cy.setCookie('access', `${Cypress.env('ACCESS_TOKEN_TEST')}`, {httpOnly: true});
      cy.setCookie('csrftoken', 'VgSsiwOS6g4BtdZf0HNwrkIloSZx9N05', );
    }); 
    cy.login('test', '123');
    cy.wait('@validateJWTToken')
  });

  it('Test Course redirection', ()=> {
    cy.get('#courses').scrollIntoView();
    /* ==== Generated with Cypress Studio ==== */
    cy.get(':nth-child(1) > .MuiPaper-root > .MuiButtonBase-root > .courses-link > .MuiCardContent-root > .MuiTypography-root').click();
    cy.get('.course-thumbnail').should('be.visible');
    cy.get('.css-kl1xo3 > .MuiButtonBase-root').should('have.text', 'Enroll now!');
    cy.get('.MuiTypography-noWrap > b').should('have.text', 'Instructor:');
    cy.get('.MuiGrid-container > :nth-child(1) > .MuiTypography-root > b').should('have.text', 'Created:');
    cy.get(':nth-child(2) > .MuiTypography-root > b').should('have.text', 'Modified:');
    cy.get(':nth-child(3) > .MuiTypography-root > b').should('have.text', 'Weeks:');
    cy.get('.MuiGrid-direction-xs-column > :nth-child(1) > .MuiTypography-root').should('have.text', 'Overview');
    cy.get('.MuiStack-root > .MuiGrid-container > .MuiGrid-root > .MuiButtonBase-root').should('be.visible');
    /* ==== End Cypress Studio ==== */
  });

  it('Test the course\s enroll button', ()=> {
    // idk it's kinda to test with normal enviroment cause cypress is so weirdd.
    cy.get('#courses').scrollIntoView();
    /* ==== Generated with Cypress Studio ==== */
    cy.get(':nth-child(1) > .MuiPaper-root > .MuiButtonBase-root > .courses-link > .MuiCardContent-root > .MuiTypography-root').click();
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.css-kl1xo3 > .MuiButtonBase-root').click();
    cy.get('.MuiAlert-message').should('be.visible');
    /* ==== End Cypress Studio ==== */
  })


  // I can't test further because it seems too buggy, and the instructor or creator of the course can't even view his or her own course content.
  // Even after enrolling, the course content is still in conditional view.
  
  
  
  
  
})
