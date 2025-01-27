import Chance from "chance";
const chance = new Chance();


// NOTICE !
// Please change the ENVIROMENT VARIABLE in root directory TO 127.0.0.1 for Server Responses
// Localhost causes a CORS error 

describe('User Signs In', () => {
    const username = chance.first();
    const password = '123'

    beforeEach(() => {
        cy.visit(`${Cypress.env('FRONTEND_API_URL')}signin`);
    });

    it('has a title', () => {
        cy.contains('Sign in');
    });

    it('has a link to Sign Up', ()=> {
        cy.contains("Don't have an account? Sign Up");
    }) ;

    it('should be able to input and submits with invalid credentials', () => {
    // get me the username form and type the random username
    cy.get('input[name=username]').type(username);

    // get me the password form and type the password
    cy.get('input[name=password]').type(password);

    // stub a response to POST login
    cy.intercept('POST', `${Cypress.env('REST_API_URL')}login`, {
        statusCode: 401,
        body: {'invalid': 'incorrect username and password'},
    }).as('postLogin');

    // when sign in button is clicked
    cy.contains('button', 'Sign In').click();

    cy.wait('@postLogin');

    // then assert
    cy.contains('p', 'Invalid Username and Password').should('be.visible')

    });

    it('should be able to input and submits with valid credentials', ()=> {

        // get the username form and type 'test'
        cy.get('input[name=username]').type('test');

        // get the password form and type '123'
        cy.get('input[name=password]').type('123');

        // when sign in button is clicked
        cy.contains('button', 'Sign In').click();

        // then assert
        cy.url().should('include', '/');

    });

    it('can click the SignUp link, which redirects them.', () => {
        cy.contains("Don't have an account? Sign Up").click();

        cy.url().should('include', '/signup');
    })
 
})