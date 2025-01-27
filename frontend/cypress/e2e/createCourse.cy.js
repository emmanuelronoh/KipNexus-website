
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test if the error message includes 'TypeError: can't access property'
  return false
})


it('Unathenticated user is redirected to sigin route', () => {
  cy.visit(`${Cypress.env('FRONTEND_API_URL')}course/create`)
  cy.url().should('include', '/signin')
})


describe('Create Course Route', () => {
  beforeEach(() => {
    cy.setToken().then(()=> {// intercepts URL then sets the cookie with the jwt
      cy.setCookie('refresh', `${Cypress.env('REFRESH_TOKEN_TEST')}`);
      cy.setCookie('access', `${Cypress.env('ACCESS_TOKEN_TEST')}`);
    }); 
    cy.login('test', '123');
    cy.wait('@validateJWTToken')
    cy.get('.css-1t6c9ts > :nth-child(3)').should('be.visible');
    cy.get('.css-1t6c9ts > :nth-child(3)').click();
  });





  /* ==== Test Created with Cypress Studio ==== */
  it('Test Course\'s Title Textarea', function () {
    /* ==== Generated with Cypress Studio ==== */
    cy.get(':nth-child(1) > .MuiFormControl-root > .MuiInputBase-root > #demo-helper-text-aligned-no-helper').click().type('Testing my Course Title Textarea');
    cy.get(':nth-child(1) > .MuiFormControl-root > .MuiInputBase-root > #demo-helper-text-aligned-no-helper').should('be.visible');
    /* ==== End Cypress Studio ==== */
    /* ==== Generated with Cypress Studio ==== */
    cy.get(':nth-child(1) > .MuiFormControl-root > .MuiInputBase-root > #demo-helper-text-aligned-no-helper').should('have.value', 'Testing my Course Title Textarea');
    /* ==== End Cypress Studio ==== */
  });


  /* ==== Test Created with Cypress Studio ==== */
  it('Test Course\'s Description Textarea', function () {
    cy.get('.ql-editor').type(`What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.......`)


    /* ==== Generated with Cypress Studio ==== */
    cy.get('.ql-editor > :nth-child(2)').should('have.text', '    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.......');
    cy.get('.ql-toolbar').should('be.visible');
    /* ==== End Cypress Studio ==== */
  });

  it('Test Course\'s Card and Error handling', function () {
    cy.get('[data-cy="nextButton"]').click();
    cy.get('[data-cy="nextButton"]').should('be.disabled');
    cy.get('#demo-helper-text-aligned-no-helper-label').should('have.text', 'title: This field may not be blank. *');
    cy.get('.quill-fieldset > legend').should('have.text', 'description: This field may not be blank.');
    cy.get(':nth-child(2) > :nth-child(3) > .MuiTypography-root').should('have.text', 'difficulty: "" is not a valid choice.');
    cy.get(':nth-child(2) > :nth-child(4) > .MuiTypography-root').should('have.text', 'weeks: A valid integer is required.');
    cy.get('input[type=file]').selectFile('src/static/images/what.jpg', { force: true })
    cy.get('.course-thumbnail').should('have.class', 'course-thumbnail');
    cy.get('.course-thumbnail').should('be.visible');
    cy.get('#formatted-numberformat-input').should('be.visible');
    cy.get('#formatted-numberformat-input').clear('$6');
    cy.get('#formatted-numberformat-input').type('$69');
    cy.get('#formatted-numberformat-input').should('have.value', '69');
    cy.get('#demo-simple-select').should('be.visible');
    cy.get('#outlined-number').clear('6');
    cy.get('#outlined-number').type('12');
    cy.get('#outlined-number').should('be.visible');
    cy.get('#outlined-number').should('have.value', '12');
    cy.get('[data-cy="Select Difficulty"]').click();
    cy.contains('Beginner').click()
    cy.get('#demo-simple-select').should('have.text', 'Beginner');

  });

  /* ==== Test Created with Cypress Studio ==== */
  it('Test Course, Course\'s Overview and Course\'s Content Accordions without it\'s dialogs, also it\'s HTTP requests', function () {
    cy.intercept('POST', `${Cypress.env('REST_API_URL')}courses`, {
      statusCode: 201,
      body: {
        "id": 1044,
        "average_rating": null,
        "created_by_name": "test",
        "difficulty_display": "Beginner",
        "enrollee_count": 0,
        "title": "Testing my Course Title Textarea",
        "description": "Test Course",
        "thumbnail": null,
        "difficulty": "BG",
        "course_created": "2024-05-10",
        "course_updated": "2024-05-11T01:10:43.121385+08:00",
        "status": "P",
        "price": "69",
        "weeks": 12,
        "is_draft": true,
        "created_by": 2
      }
    }).as('course')
    cy.get(':nth-child(1) > .MuiFormControl-root > .MuiInputBase-root > #demo-helper-text-aligned-no-helper').click().type('Testing my Course Title Textarea');
    cy.get('.ql-editor').type('Test Course');
    cy.get('input[type=file]').selectFile('src/static/images/what.jpg', { force: true });
    cy.get('#formatted-numberformat-input').clear('$6');
    cy.get('#formatted-numberformat-input').type('$69');
    cy.get('#formatted-numberformat-input').should('have.value', '69');
    cy.get('#outlined-number').clear('6');
    cy.get('#outlined-number').type('12');
    cy.get('[data-cy="Select Difficulty"]').click();
    cy.contains('Beginner').click()
    cy.get('[data-cy="nextButton"]').click();
    cy.wait(500)
    cy.wait('@course').should(({ request, response }) => {
      // can't inspect the request because it's in FORMDATA
      expect(response.body).to.have.property('title', 'Testing my Course Title Textarea');
      expect(response.body).to.have.property('weeks', 12);
      expect(response.body).to.have.property('price', '69');
    });


    cy.intercept('POST', `${Cypress.env('REST_API_URL')}course/1044/course-content`, {
      statusCode: 400,
      body: {
        "preview": [
          "This field is required."
        ],
        "overview": [
          "This field is required."
        ]
      }
    }).as('course-content-!ok');
    for (let i = 0; i < 5; i++) {
      cy.get('[data-cy="nextButton"]').click({ force: true });
    }
    // cy.get('[data-cy="nextButton"]').click();

    cy.wait(500);
    cy.wait('@course-content-!ok');


    cy.get('.quill').should('have.class', 'ql-error');
    cy.get('.css-8atqhb > .MuiFormControl-root > .MuiInputBase-root').should('have.class', 'Mui-error');
    cy.get('.ql-editor').click().type('Testing course overview nothing much but just testing here');
    cy.get('#lecture-url').clear();
    cy.get('#lecture-url').type('https://www.youtube.com/watch?v=jfKfPfyJRdk');
    cy.get('#lecture-url').should('have.value', 'https://www.youtube.com/watch?v=jfKfPfyJRdk');

    cy.intercept('POST', `${Cypress.env('REST_API_URL')}course/1044/course-content`, {
      statusCode: 200,
      body: {
        "id": 814,
        "preview": "https://www.youtube.com/watch?v=jfKfPfyJRdk",
        "overview": "Testing course overview nothing much but just testing here",
        "course": 1044
      }
    }).as('course-content-ok');

    cy.get('[data-cy="nextButton"]').click();

    cy.wait(500);
    cy.wait('@course-content-ok').should(({ request, response }) => {
      // can't inspect the request because it's in formData

      expect(response.body).to.have.property('overview');
      expect(response.body).to.have.property('preview');
    })

    cy.intercept('PATCH', `${Cypress.env('REST_API_URL')}course/1044`, {
      statusCode: 200,
      body: {
        "id": 1044,
        "average_rating": null,
        "created_by_name": "test",
        "difficulty_display": "Beginner",
        "enrollee_count": 0,
        "title": "Testing new course title",
        "description": "there's change",
        "thumbnail": null,
        "difficulty": "BG",
        "course_created": "2024-05-10",
        "course_updated": "2024-05-11T02:01:02.032021+08:00",
        "status": "P",
        "price": "1.00",
        "weeks": 6,
        "is_draft": true,
        "created_by": 2
      }
    }).as('edit-course')
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.css-13i4rnv-MuiGrid-root > .MuiTypography-root').should('be.visible');
    cy.get('[data-cy="prevButton"]').click();
    cy.get('[data-cy="prevButton"]').click();
    cy.get(':nth-child(1) > .MuiFormControl-root > .MuiInputBase-root > #demo-helper-text-aligned-no-helper').clear().type('Testing new course title');
    cy.get('.ql-editor').clear().type('there\s a change');
    cy.get('[data-cy="nextButton"]').click();
    cy.get('[data-cy="nextButton"]').click();

    cy.wait(500);
    cy.wait('@edit-course');


    cy.intercept('PUT', `${Cypress.env('REST_API_URL')}course/1044/course-content`, {
      statusCode: 200,
      body: {
        "id": 814,
        "preview": "https://www.youtube.com/",
        "overview": "new overview",
        "course": 1044
      }
    }).as('edit-course-content');
    cy.get('.ql-editor').clear().type('new overview');
    cy.get('#lecture-url').clear().type('https://www.youtube.com/');


    cy.get('[data-cy="nextButton"]').click();

    cy.wait(500);
    cy.wait('@edit-course-content').should(({ request, response }) => {
      // can't inspect the request because it's in formData
      expect(response.body).to.have.property('preview');
      expect(response.body).to.have.property('overview');

    });


    cy.intercept('POST', `${Cypress.env('REST_API_URL')}sections/course-content/814`, {
      statusCode: 201,
      body: {
        "id": 941,
        "heading": "Add an accordion, e.g., Phase 1",
        "course_content": 814
      }
    }).as('add-accordion');

    cy.intercept('GET', `${Cypress.env('REST_API_URL')}section-items/section/941`, {
      statusCode: 200,
      body: []
    }).as('get-accordion-items')

    cy.get('.css-1yjvs5a > .MuiGrid-container > .MuiGrid-grid-xs-10 > .MuiFormControl-root > .MuiInputBase-root > #outlined-textarea').should('be.visible');
    cy.get('.css-1yjvs5a > .MuiGrid-container > .MuiGrid-grid-xs-2 > .MuiButtonBase-root > [data-testid="AddIcon"]').should('be.visible');
    cy.get('.css-1yjvs5a > .MuiGrid-container > .MuiGrid-grid-xs-2 > .MuiButtonBase-root > [data-testid="AddIcon"] > path').click();

    cy.wait(250);
    cy.wait('@add-accordion').should(({ request, response }) => {
      expect(response.body).to.have.property('heading', 'Add an accordion, e.g., Phase 1');
      expect(response.body).to.have.property('course_content', 814);
    });
    cy.wait(250);
    cy.wait('@get-accordion-items');


    cy.intercept('GET', `${Cypress.env('REST_API_URL')}section/941/course-content`, {
      statusCode: 200,
      body: {
        "id": 941,
        "heading": "Add an accordion, e.g., Phase 1",
        "course_content": 814
      }
    }).as('get-section-941');
    cy.intercept('POST', `${Cypress.env('REST_API_URL')}sections/course-content/814`, {
      statusCode: 400,
      body: {
        "heading": [
          "This field may not be blank."
        ]
      }
    }).as('empty-heading');

    cy.get('[style="min-height: 0px; height: auto; transition-duration: 300ms;"] > :nth-child(1) > :nth-child(1) > .MuiPaper-root > #panel1bh-header > .MuiAccordionSummary-content > .MuiTypography-root').should('have.text', 'Add an accordion, e.g., Phase 1');

    cy.get('[data-cy="Add Accordion Button"]').click();


    cy.wait(500);
    cy.wait('@empty-heading');

    cy.get('[data-cy="Add Accordion Input"] > #outlined-textarea-label').should('have.text', 'heading: This field may not be blank.');
    cy.get('[data-cy="Add Accordion Input"] > .MuiInputBase-root').should('have.class', 'Mui-error');
    cy.intercept('POST', `${Cypress.env('REST_API_URL')}sections/course-content/814`, {
      statusCode: 201,
      body: {
        "id": 942,
        "heading": 'Testing Inputs for Accordion / Section Heading',
        "course_content": 814
      }
    }).as('add-accordion-2');
    cy.intercept('GET', `${Cypress.env('REST_API_URL')}section-items/section/942`, {
      statusCode: 200,
      body: []
    }).as('get-accordion-items-2')
    cy.get('[data-cy="Add Accordion Input"]').type('Testing Inputs for Accordion / Section Heading');
    // // /* ==== Generated with Cypress Studio ==== */
    cy.get('[data-cy="Add Accordion Button"] > [data-testid="AddIcon"]').click();


    cy.wait(250);
    cy.wait('@add-accordion-2').should(({ request, response }) => {
      expect(response.body).to.have.property('heading');
      expect(response.body).to.have.property('course_content');
    });
    cy.wait(250);
    cy.wait('@get-accordion-items-2');

    cy.intercept('PATCH', `${Cypress.env('REST_API_URL')}section/941/course-content`, {
      statusCode: 200,
      body: {
        "id": 941,
        "heading": "New Phase 1",
        "course_content": 814
      }
    }).as('edit-heading')
    cy.get(':nth-child(3) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > #panel1bh-header > .MuiAccordionSummary-content > .MuiTypography-root').should('have.text', 'Testing Inputs for Accordion / Section Heading');
    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > #panel1bh-header > .MuiAccordionSummary-content').click();
    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > #panel1bh-header').click();
    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > #panel1bh-header > .MuiAccordionSummary-expandIconWrapper > .MuiBox-root > :nth-child(1) > .MuiButton-icon > [data-testid="EditIcon"] > path').should('be.visible');
    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > #panel1bh-header > .MuiAccordionSummary-expandIconWrapper > .MuiBox-root > :nth-child(2) > .MuiButton-icon > [data-testid="DeleteIcon"] > path').should('be.visible');
    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > #panel1bh-header > .MuiAccordionSummary-expandIconWrapper > .MuiBox-root > :nth-child(1) > .MuiButton-icon > [data-testid="EditIcon"] > path').click();
    cy.get('[data-cy="Accordion edit-941"]').click();
    cy.get('#standard-multiline-flexible').click();
    cy.get('#standard-multiline-flexible').clear();
    cy.get('#standard-multiline-flexible').type('New Phase 1');
    cy.get('[data-cy="Accordion save-btn"]').click();
    cy.wait(500);
    cy.wait('@edit-heading').should(({ request, response }) => {
      expect(response.body).to.have.property('heading', 'New Phase 1');
    })

    cy.intercept('POST', `${Cypress.env('REST_API_URL')}section-items/section/941`, {
      statusCode: 201,
      body: {
        "id": 729,
        "lecture": "https://www.youtube.com/test",
        "description": "lorem ipsum",
        "description_image": null,
        "heading": "Add an item, e.g., week 1-4: workout routine.",
        "section": 941
      }

    }).as('add-accordion-item-1')
    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > #panel1bh-content > .MuiAccordionDetails-root > .MuiBox-root > .MuiGrid-container > .MuiGrid-grid-xs-2 > [data-cy="Add Accordion Item"] > [data-testid="AddIcon"]').click();



    cy.wait(500);
    cy.wait('@get-section-941')
    cy.wait('@add-accordion-item-1').should(({ request, response }) => {
      expect(response.body).to.have.property('heading');
      expect(response.body).to.have.property('section');

    })
    /* ==== Generated with Cypress Studio ==== */
    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > #panel1bh-content > ul > .MuiAccordionDetails-root > .MuiGrid-container > .MuiGrid-grid-xs-10 > [data-cy="Accordion item 729"]').should('have.text', 'Add an item, e.g., week 1-4: workout routine.');
    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > #panel1bh-content > ul > .MuiAccordionDetails-root > .MuiGrid-container > .MuiGrid-grid-xs-10 > [data-cy="Accordion item 729"]').should('be.visible');


    cy.intercept('POST', `${Cypress.env('REST_API_URL')}section-items/section/941`, {
      statusCode: 400,
      body: {
        "heading": [
          "This field may not be blank."
        ]
      }
    }).as('empty-item-heading');
    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > #panel1bh-content > .css-15v22id-MuiAccordionDetails-root > .MuiBox-root > .MuiGrid-container > .MuiGrid-grid-xs-2 > [data-cy="Add Accordion Item"] > [data-testid="AddIcon"]').click();
    /* ==== End Cypress Studio ==== */

    cy.wait(500);
    cy.wait('@empty-item-heading');

    cy.intercept('POST', `${Cypress.env('REST_API_URL')}section-items/section/941`, {
      statusCode: 201,
      body: {
        "id": 730,
        "lecture": "https://www.youtube.com/test",
        "description": "lorem ipsum",
        "description_image": null,
        "heading": "another accordion item/detail here",
        "section": 941
      }
    }).as('add-accordion-item-2');

    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > #panel1bh-content > .css-15v22id-MuiAccordionDetails-root > .MuiBox-root > .MuiGrid-container > .MuiGrid-grid-xs-10 > .MuiFormControl-root > #outlined-textarea-label').should('have.text', 'heading: This field may not be blank.');
    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > #panel1bh-content > .css-15v22id-MuiAccordionDetails-root > .MuiBox-root > .MuiGrid-container > .MuiGrid-grid-xs-10 > .MuiFormControl-root > .MuiInputBase-root > #outlined-textarea').click().type('another accordion item/detail here');
    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > #panel1bh-content > .MuiAccordionDetails-root > .MuiBox-root > .MuiGrid-container > .MuiGrid-grid-xs-2 > [data-cy="Add Accordion Item"] > [data-testid="AddIcon"]').click();


    cy.wait(500);
    cy.wait('@add-accordion-item-2');
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[data-cy="Accordion item 730"]').should('be.visible');
    cy.get('[data-cy="Accordion item 730"]').should('have.text', 'another accordion item/detail here');


    cy.intercept('DELETE', `${Cypress.env('REST_API_URL')}section-item/729/section`, {
      statusCode: 204,
    })
    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > #panel1bh-content > ul > :nth-child(1) > .MuiGrid-container > .MuiGrid-grid-xs-2 > :nth-child(2) > .MuiButton-icon > [data-testid="DeleteIcon"]').click();
    /* ==== End Cypress Studio ==== */
    /* ==== Generated with Cypress Studio ==== */


    cy.intercept('PUT', `${Cypress.env('REST_API_URL')}section-item/730/section`, {
      "id": 730,
      "lecture": "https://www.youtube.com/test",
      "description": "lorem ipsum",
      "description_image": null,
      "heading": "Testing PUT method for item 2",
      "section": 941
    }).as('edit-accordion-item-2');

    cy.get('[data-cy="accordionItem edit-730"]').click();
    cy.get('#standard-multiline-flexible').click();
    cy.get('#standard-multiline-flexible').clear();
    cy.get('#standard-multiline-flexible').click().type('Testing PUT method for item 2');

    cy.wait(500);
    cy.wait('@edit-accordion-item-2').should(({ request, response }) => {
      expect(response.body).to.have.property('heading', 'Testing PUT method for item 2');
      expect(response.body).to.have.property('description');
      expect(response.body).to.have.property('section');
    })


    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > #panel1bh-content > ul > .MuiAccordionDetails-root > .MuiGrid-container > .MuiGrid-grid-xs-2 > .MuiButtonBase-root').click();


    cy.intercept('DELETE', `${Cypress.env('REST_API_URL')}section/942/course-content`, {
      statusCode: 204
    })
    cy.get(':nth-child(3) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > #panel1bh-header > .MuiAccordionSummary-expandIconWrapper > .MuiBox-root > :nth-child(2) > .MuiButton-icon > [data-testid="DeleteIcon"] > path').click();



    for (let i = 0; i < 10; i++) {
      cy.intercept('POST', `${Cypress.env('REST_API_URL')}sections/course-content/814`, {
        statusCode: 201,
        body: {
          "id": 943 + i,
          "heading": `Accordion, Phase ${i}`,
          "course_content": 814
        }
      }).as('add-accordion-spam');
      cy.intercept('GET', `${Cypress.env('REST_API_URL')}section-items/section/${943 + i}`, {
        statusCode: 200,
        body: []
      }).as(`get-accordion-items-${i}`)


      cy.get('[data-cy="Add Accordion Input"]').type(`Accordion, Phase ${i}`);
      // // /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-cy="Add Accordion Button"] > [data-testid="AddIcon"]').click();

      cy.wait('@add-accordion-spam').should(({ request, response }) => {
        expect(response.body).to.have.property('heading', `Accordion, Phase ${i}`);
      });
      cy.wait(`@get-accordion-items-${i}`)

    }


    let j = 12;
    while (j > 2) {
      cy.intercept('DELETE', `${Cypress.env('REST_API_URL')}section/${955 - j}/course-content`, {
        statusCode: 204
      })
      cy.get(`:nth-child(${j}) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > #panel1bh-header > .MuiAccordionSummary-expandIconWrapper > .MuiBox-root > :nth-child(2) > .MuiButton-icon > [data-testid="DeleteIcon"] > path`).click();
      j--;
    }
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.css-517uf5 > .MuiBox-root > .MuiButtonBase-root').should('be.visible');
    cy.get('.css-517uf5 > .MuiBox-root > .MuiButtonBase-root').click();
    cy.get('#alert-dialog-description').should('be.visible');
    cy.get('.MuiDialogActions-root > :nth-child(2)').should('be.enabled');
    cy.get('.MuiDialogActions-root > :nth-child(2)').click();

    cy.url().should('include', 'http://localhost:5173/');
    /* ==== End Cypress Studio ==== */
  });




  // TODO CONTINUE E2E TESTING

  /* ==== Test Created with Cypress Studio ==== */
  it('Test Course Content \'s Accordion dialogs', function () {
    cy.intercept('POST', `${Cypress.env('REST_API_URL')}courses`, {
      statusCode: 201,
      body: {
        "id": 1044,
        "average_rating": null,
        "created_by_name": "test",
        "difficulty_display": "Beginner",
        "enrollee_count": 0,
        "title": "Testing my Course Title Textarea",
        "description": "Test Course",
        "thumbnail": null,
        "difficulty": "BG",
        "course_created": "2024-05-10",
        "course_updated": "2024-05-11T01:10:43.121385+08:00",
        "status": "P",
        "price": "69",
        "weeks": 12,
        "is_draft": true,
        "created_by": 2
      }
    }).as('course')
    cy.get(':nth-child(1) > .MuiFormControl-root > .MuiInputBase-root > #demo-helper-text-aligned-no-helper').click().type('Testing my Course Title Textarea');
    cy.get('.ql-editor').type('Test Course');
    cy.get('input[type=file]').selectFile('src/static/images/what.jpg', { force: true });
    cy.get('#formatted-numberformat-input').clear('$6');
    cy.get('#formatted-numberformat-input').type('$69');
    cy.get('#formatted-numberformat-input').should('have.value', '69');
    cy.get('#outlined-number').clear('6');
    cy.get('#outlined-number').type('12');
    cy.get('[data-cy="Select Difficulty"]').click();
    cy.contains('Beginner').click()
    cy.get('[data-cy="nextButton"]').click();
    cy.wait(500)
    cy.wait('@course');

    cy.get('.ql-editor').click().type('Testing course overview nothing much but just testing here');
    cy.get('#lecture-url').clear();
    cy.get('#lecture-url').type('https://www.youtube.com/watch?v=jfKfPfyJRdk');
    cy.get('#lecture-url').should('have.value', 'https://www.youtube.com/watch?v=jfKfPfyJRdk');

    cy.intercept('POST', `${Cypress.env('REST_API_URL')}course/1044/course-content`, {
      statusCode: 200,
      body: {
        "id": 814,
        "preview": "https://www.youtube.com/watch?v=jfKfPfyJRdk",
        "overview": "Testing course overview nothing much but just testing here",
        "course": 1044
      }
    }).as('course-content-ok');

    cy.get('[data-cy="nextButton"]').click();

    cy.wait(500);
    cy.wait('@course-content-ok').should(({ request, response }) => {
      // can't inspect the request because it's in formData
      expect(response.body).to.have.property('overview');
      expect(response.body).to.have.property('preview');
    })



    cy.intercept('POST', `${Cypress.env('REST_API_URL')}sections/course-content/814`, {
      statusCode: 201,
      body: {
        "id": 941,
        "heading": "Add an accordion, e.g., Phase 1",
        "course_content": 814
      }
    }).as('add-accordion');
    cy.intercept('GET', `${Cypress.env('REST_API_URL')}/section/941/course-content`, {
      statusCode: 200,
      body: {
        "id": 941,
        "heading": "Add an accordion, e.g., Phase 1",
        "course_content": 814
      }
    }).as('get-section-941');
    cy.intercept('GET', `${Cypress.env('REST_API_URL')}section-items/section/941`, {
      statusCode: 200,
      body: []
    }).as('get-accordion-items');
    cy.get('.css-1yjvs5a > .MuiGrid-container > .MuiGrid-grid-xs-10 > .MuiFormControl-root > .MuiInputBase-root > #outlined-textarea').should('be.visible');
    cy.get('.css-1yjvs5a > .MuiGrid-container > .MuiGrid-grid-xs-2 > .MuiButtonBase-root > [data-testid="AddIcon"]').should('be.visible');
    cy.get('.css-1yjvs5a > .MuiGrid-container > .MuiGrid-grid-xs-2 > .MuiButtonBase-root > [data-testid="AddIcon"] > path').click();

    cy.wait(500);
    cy.wait('@add-accordion');
    cy.wait('@get-accordion-items')

    cy.intercept('POST', `${Cypress.env('REST_API_URL')}sections/course-content/814`, {
      statusCode: 400,
      body: {
        "heading": [
          "This field may not be blank."
        ]
      }
    }).as('empty-heading');

    cy.intercept('POST', `${Cypress.env('REST_API_URL')}section-items/section/941`, {
      statusCode: 201,
      body: {
        "id": 729,
        "lecture": "https://www.youtube.com/test",
        "description": "lorem ipsum",
        "description_image": null,
        "heading": "Add an item, e.g., week 1-4: workout routine.",
        "section": 941
      }
    }).as('add-accordion-item-1');

    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > #panel1bh-header').click();
    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > #panel1bh-content > .MuiAccordionDetails-root > .MuiBox-root > .MuiGrid-container > .MuiGrid-grid-xs-2 > [data-cy="Add Accordion Item"] > [data-testid="AddIcon"]').click();



    cy.wait(500);
    cy.wait('@get-section-941');
    cy.wait('@add-accordion-item-1').should(({ request, response }) => {
      expect(response.body).to.have.property('heading');
      expect(response.body).to.have.property('section');

    });

    cy.intercept('POST', `${Cypress.env('REST_API_URL')}section-items/section/941`, {
      statusCode: 201,
      body: {
        "id": 730,
        "lecture": "https://www.youtube.com/test",
        "description": "lorem ipsum",
        "description_image": null,
        "heading": "another accordion item/detail here",
        "section": 941
      }
    }).as('add-accordion-item-2');


    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > #panel1bh-content > .MuiAccordionDetails-root > .MuiBox-root > .MuiGrid-container > .MuiGrid-grid-xs-2 > [data-cy="Add Accordion Item"] > [data-testid="AddIcon"]').click();


    cy.wait(500);
    cy.wait('@add-accordion-item-2');
    /* ==== Generated with Cypress Studio ==== */
    // cy.get('[data-cy="Accordion item 730"]').should('be.visible');
    // cy.get('[data-cy="Accordion item 730"]').should('have.text', 'another accordion item/detail here');

    cy.intercept('PUT', `${Cypress.env('REST_API_URL')}section-item/729/section`, {
      statusCode: 200,
      body: {
        "id": 729,
        "lecture": "https://www.youtube.com/test",
        "description": "lorem ipsum",
        "description_image": null,
        "heading": "Add an item, e.g., week 1-4: workout routine.",
        "section": 941
      }
    })
    cy.get('[data-cy="Accordion item 729"]').click();

    cy.get('.MuiButtonGroup-root > .MuiButton-contained').should('be.enabled');
    cy.contains('button', 'Video Lecture / Readme').click();
    cy.get('#lecture-url').should('have.value', 'https://www.youtube.com/test');
    cy.wait(150);
    cy.get('.ql-editor').click();
    cy.get('.ql-editor').clear();

    cy.intercept('PUT', `${Cypress.env('REST_API_URL')}section-item/729/section`, {
      statusCode: 200,
      body: {
        "id": 729,
        "lecture": "https://www.youtube.com/test",
        "description": `Where can I get some?
        There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.`,
        "description_image": null,
        "heading": "Add an item, e.g., week 1-4: workout routine.",
        "section": 941
      }
    }).as('edit-description')
    cy.get('.ql-editor').click().type(`Where can I get some?
    There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.`);

    cy.wait(500);
    cy.wait('@edit-description').should(({ request, response }) => {
      expect(response.body).to.have.property('description');
    });

    cy.get('.ql-editor').should('have.class', 'ql-editor');
    cy.get('.MuiButton-outlined').click();
    cy.get('.MuiDialogActions-root > .MuiButtonBase-root').click();

    cy.intercept('PUT', `${Cypress.env('REST_API_URL')}/section-item/729/section`, {
      status: 200,
      body: {
        "id": 729,
        "lecture": "https://www.youtube.com/test",
        "description": `Where can I get some?
        There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.`,
        "description_image": null,
        "heading": "Description only (testing)",
        "section": 941
      }
    })
    cy.get('[data-cy="accordionItem edit-729"] > .MuiButton-icon > [data-testid="EditIcon"] > path').click();
    cy.get('#standard-multiline-flexible').type('Description only (testing)');
    cy.contains('button', 'Save').click();

    cy.intercept('PATCH', `${Cypress.env('REST_API_URL')}/section-item/730/section`, {
      status: 200,
      body: {
        "id": 730,
        "lecture": "https://www.youtube.com/test",
        "description": "lorem ipsum",
        "description_image": null,
        "heading": "another accordion item/detail here",
        "section": 941
      }
    });
    /* ==== Generated with Cypress Studio ==== */
    // cy.get('[data-cy="Accordion item 730"]').click();
    // cy.get('[data-cy="Add icon"] > [data-testid="AddIcon"] > path').click();
    // cy.get('[data-cy="Add icon"] > [data-testid="AddIcon"]').click();
    /* ==== End Cypress Studio ==== */
    // /* ==== End Cypress Studio ==== */
    // /* ==== Generated with Cypress Studio ==== */


    cy.get('[data-cy="Accordion item 730"]').click({ force: true });
    cy.get('.MuiButton-outlined').click();

    for (let i = 0; i < 6; i++) {
      cy.intercept('POST', `${Cypress.env('REST_API_URL')}workouts/section-item/730`, {
        statusCode: 201,
        body: {
          "id": 465 + i,
          "exercise": `
          <p>e.g., Chin Ups</p> <br>
          <p>setsXreps: 3x8 </p> <br>
          <p> tempo: 1 sec concentric (upward movement) <p> <br>
          <p>2 sec eccentric (downward movement) etc</p>
          
          `,
          "demo": "http://127.0.0.1:8000/images/workouts/chinupVecs.gif",
          "intensity": null,
          "rest_time": null,
          "sets": null,
          "reps": null,
          "excertion": null,
          "section_item": 730
        }
      }).as('add-workout-card');
      cy.intercept('PATCH', `${Cypress.env('REST_API_URL')}workout/${465 + i}/section-item`, {
        statusCode: 200,
        body: {
          "id": 465 + i,
          "exercise": `
          <p>e.g., Chin Ups</p> <br>
          <p>setsXreps: 3x8 </p> <br>
          <p> tempo: 1 sec concentric (upward movement) <p> <br>
          <p>2 sec eccentric (downward movement) etc</p>
      
          `,
          "demo": "http://127.0.0.1:8000/images/workouts/chinupVecs.gif",
          "intensity": null,
          "rest_time": null,
          "sets": null,
          "reps": null,
          "excertion": null,
          "section_item": 730
        }
      })
      cy.get('[data-cy="Add icon"] > [data-testid="AddIcon"] > path').click({ force: true });
      cy.wait(500);
      cy.wait('@add-workout-card');
    }
    cy.get('[data-cy="Workout Card"]').should('have.length', 6);





    /* ==== Generated with Cypress Studio ==== */

    cy.get('[data-cy="Add icon"] > [data-testid="AddIcon"]').click();
    cy.get(':nth-child(3) > [data-cy="Workout Card"] > .MuiCardActions-root > .MuiGrid-container > :nth-child(1) > .MuiButtonBase-root').click();
    cy.get('[data-cy="correct-form-dialog-close"]').click();
    /* ==== End Cypress Studio ==== */

    for (let i = 0; i < 6; i++) {
      cy.intercept('DELETE', `${Cypress.env('REST_API_URL')}workout/${465 + i}/section-item`, {
        statusCode: 201,
      });
    }
    cy.get(':nth-child(7) > [data-cy="Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-grid-sm-8 > .MuiButtonBase-root').click();
    cy.get(':nth-child(5) > [data-cy="Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-grid-sm-8 > .MuiButtonBase-root').click();
    cy.get(':nth-child(4) > [data-cy="Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-grid-sm-8 > .MuiButtonBase-root').click();
    cy.get(':nth-child(3) > [data-cy="Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-grid-sm-8 > .MuiButtonBase-root').click();
    cy.get(':nth-child(2) > [data-cy="Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-grid-sm-8 > .MuiButtonBase-root').click();
    cy.get('[data-cy="Workout Card"]').should('have.length', 1);

    cy.get('.ql-editor').should('be.visible');
    cy.intercept(`PATCH`, `${Cypress.env('REST_API_URL')}workout/${465}/section-item`, {
      statusCode: 200,
      body: {
        "id": 470,
        "exercise": `testing and sending PUT request With this card. Btw this is Chin ups`,
        "demo": "http://127.0.0.1:8000/images/workouts/chinupVecs.gif",
        "intensity": null,
        "rest_time": null,
        "sets": null,
        "reps": null,
        "excertion": null,
        "section_item": 730
      }
    }).as('edit-workout-card');
    cy.get('.ql-editor').clear();
    cy.get('.ql-editor').type(`testing and sending PUT request With this card. Btw this is Chin ups`);
    cy.wait(500);
    cy.wait('@edit-workout-card').should(({ request, response }) => {
      expect(response.body).to.have.property('exercise', 'testing and sending PUT request With this card. Btw this is Chin ups');
    })

    cy.get('h3').should('have.text', 'testing and sending PUT request With this card. Btw this is Chin ups');
    cy.get('.MuiCardActions-root > .MuiGrid-container > :nth-child(1) > .MuiButtonBase-root').click();
    cy.get('.css-11lq3yg-MuiGrid-root > .MuiDialogContent-root > .MuiGrid-container > .MuiGrid-root > .MuiButtonBase-root > [data-testid="AddIcon"]').should('be.visible');




    // cy.get(':nth-child(6) > .MuiDialog-container > .MuiPaper-root > .MuiDialogActions-root > .MuiButtonBase-root').click();
    for (let i = 0; i < 6; i++) {
      cy.intercept('POST', `${Cypress.env('REST_API_URL')}correct-exercises/course/workout/465`, {
        statusCode: 201,
        body: {
          "id": 20 + i,
          "demo": "http://127.0.0.1:8000/images/correct_exercise_form/pushupVecs.gif",
          "workout": 465 + i,
          "description": "Correct exercise form description: e.g., Shoulder blades are depressed downwards",
        }
      }).as('add-correct-form-workout-card');
      cy.intercept('PATCH', `${Cypress.env('REST_API_URL')}correct-exercise/${20 + i}/course/workout`, {
        statusCode: 201,
        body: {
          "id": 20 + i,
          "demo": "http://127.0.0.1:8000/images/correct_exercise_form/pushupVecs.gif",
          "workout": 465 + i,
          "description": "Correct exercise form description: e.g., Shoulder blades are depressed downwards",
        }
      });
      cy.get('[data-cy="Add Icon Correct-Dialog"] > [data-testid="AddIcon"] > path').click();
      cy.wait(500);
      cy.wait('@add-correct-form-workout-card');
    }
    cy.get('[data-cy="Correct Form Workout Card"]').should('have.length', 6);
    for (let i = 0; i < 6; i++) {
      cy.intercept('DELETE', `${Cypress.env('REST_API_URL')}correct-exercise/${20 + i}/course/workout`, {
        statusCode: 204,
      });
    }

    cy.get(':nth-child(6) > [data-cy="Correct Form Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-root > .MuiButtonBase-root').click();
    cy.get(':nth-child(5) > [data-cy="Correct Form Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-root > .MuiButtonBase-root').click();
    cy.get(':nth-child(4) > [data-cy="Correct Form Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-root > .MuiButtonBase-root').click();
    cy.get(':nth-child(3) > [data-cy="Correct Form Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-root > .MuiButtonBase-root').click();
    cy.get(':nth-child(2) > [data-cy="Correct Form Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-root > .MuiButtonBase-root').click();
    cy.get(':nth-child(1) > [data-cy="Correct Form Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-root > .MuiButtonBase-root').click();
    cy.get('[data-cy="Add Icon Correct-Dialog"] > [data-testid="AddIcon"] > path').click();
    cy.get('[data-cy="Correct Form Workout Card"]').should('have.length', 1);
    cy.get('[data-cy="Correct Form Workout Card"] > .MuiButton-outlined').click().selectFile('src/static/images/test.jpg', { force: true });
    cy.get('[data-cy="Correct Form Workout Card"] > .MuiCardContent-root > .MuiBox-root > .quill > .ql-container > .ql-editor').click();
    cy.intercept('PATCH', `${Cypress.env('REST_API_URL')}correct-exercise/25/course/workout`, {
      statusCode: 201,
      body: {
        "id": 25,
        "demo": "http://127.0.0.1:8000/images/correct_exercise_form/pushupVecs.gif",
        "workout": 25,
        "description": "Okay testing new description for this correct workout form card",
      }
    }).as('edit-description-correct-form-workout');
    cy.get('[data-cy="Correct Form Workout Card"] > .MuiCardContent-root > .MuiBox-root > .quill > .ql-container > .ql-editor').clear();
    cy.get('[data-cy="Correct Form Workout Card"] > .MuiCardContent-root > .MuiBox-root > .quill > .ql-container > .ql-editor').type('Okay testing new description for this correct workout form card');

    cy.wait(400);
    cy.wait('@edit-description-correct-form-workout');
    cy.get('.ql-editor > p').should('have.text', 'Okay testing new description for this correct workout form card');
    cy.get('[data-cy="correct-form-dialog-close"]').click();
    cy.get('[data-cy="Workout Card"] > .MuiButton-outlinedPrimary').click().selectFile('src/static/images/thirdBG.png', { force: true });
    cy.get('[data-cy="Add icon"] > [data-testid="AddIcon"]').click();
    cy.intercept('PATCH', `${Cypress.env('REST_API_URL')}workout/470/section-item`, {
      statusCode: 200,
      body: {
        "id": 470,
        "exercise": `testing and sending PUT request With this card. Btw this is Chin ups`,
        "demo": "http://127.0.0.1:8000/images/workouts/chinupVecs.gif/TEST NEW WORKOUT",
        "intensity": null,
        "rest_time": null,
        "sets": null,
        "reps": null,
        "excertion": null,
        "section_item": 730
      }

    })
    cy.get(':nth-child(2) > [data-cy="Workout Card"] > .MuiButton-outlinedPrimary').click().selectFile('src/static/images/secondBG.png', { force: true });
    cy.get(':nth-child(2) > [data-cy="Workout Card"] > .MuiCardContent-root > .MuiBox-root > .quill > .ql-container > .ql-editor').click();
    cy.get(':nth-child(2) > [data-cy="Workout Card"] > .MuiCardContent-root > .MuiBox-root > .quill > .ql-container > .ql-editor').clear();

    cy.get(':nth-child(2) > [data-cy="Workout Card"] > .MuiCardContent-root > .MuiBox-root > .quill > .ql-container > .ql-editor').click().type('TEST NEW WORKOUT');

    cy.get(':nth-child(2) > [data-cy="Workout Card"] > .MuiCardContent-root > .MuiBox-root > .quill > .ql-container > .ql-editor').should('have.text', 'TEST NEW WORKOUT');
    cy.get(':nth-child(2) > [data-cy="Workout Card"] > .MuiCardActions-root > .MuiGrid-container > :nth-child(1) > .MuiButtonBase-root').click();
    cy.get(':nth-child(1) > [data-cy="Workout Card"] > .MuiCardActions-root > .MuiGrid-container > :nth-child(2) > .MuiButtonBase-root').click({ force: true });
    // cy.get(':nth-child(6) > .MuiDialog-container > .MuiPaper-root > .MuiDialogActions-root > .MuiButtonBase-root').click({ force: true });
    for (let i = 0; i < 6; i++) {
      cy.intercept('POST', `${Cypress.env('REST_API_URL')}wrong-exercises/course/workout/465`, {
        statusCode: 201,
        body: {
          "id": 20 + i,
          "demo": "http://127.0.0.1:8000/images/correct_exercise_form/pushupVecs.gif",
          "workout": 465 + i,
          "description": "Wrong exercise form description: e.g., Shoulder blades not retracting",
        }
      }).as('add-wrong-form-workout-card');
      cy.intercept('PATCH', `${Cypress.env('REST_API_URL')}wrong-exercise/${20 + i}/course/workout`, {
        statusCode: 201,
        body: {
          "id": 20 + i,
          "demo": "http://127.0.0.1:8000/images/correct_exercise_form/pushupVecs.gif",
          "workout": 465 + i,
          "description": "Wrong exercise form description: e.g., Shoulder blades not retracting",
        }
      });
      cy.get('[data-cy="Add Icon Wrong-Dialog"] > [data-testid="AddIcon"] > path').click();
      cy.wait(500);
      cy.wait('@add-wrong-form-workout-card');
    }
    cy.get('[data-cy="Wrong Form Workout Card"]').should('have.length', 6);
    for (let i = 0; i < 6; i++) {
      cy.intercept('DELETE', `${Cypress.env('REST_API_URL')}wrong-exercise/${20 + i}/course/workout`, {
        statusCode: 204,
      });
    }
    cy.get(':nth-child(6) > [data-cy="Wrong Form Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-root > .MuiButtonBase-root').click();
    cy.get(':nth-child(5) > [data-cy="Wrong Form Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-root > .MuiButtonBase-root').click();
    cy.get(':nth-child(4) > [data-cy="Wrong Form Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-root > .MuiButtonBase-root').click();
    cy.get(':nth-child(3) > [data-cy="Wrong Form Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-root > .MuiButtonBase-root').click();
    cy.get(':nth-child(2) > [data-cy="Wrong Form Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-root > .MuiButtonBase-root').click();
    cy.get(':nth-child(1) > [data-cy="Wrong Form Workout Card"] > .MuiCardActions-root > .MuiGrid-container > .MuiGrid-root > .MuiButtonBase-root').click();
    cy.get('[data-cy="Add Icon Wrong-Dialog"] > [data-testid="AddIcon"] > path').click();
    cy.get('[data-cy="Wrong Form Workout Card"]').should('have.length', 1);
    cy.get('[data-cy="Wrong Form Workout Card"] > .MuiButton-outlined').click().selectFile('src/static/images/test.jpg', { force: true });
    cy.get('[data-cy="Wrong Form Workout Card"] > .MuiCardContent-root > .MuiBox-root > .quill > .ql-container > .ql-editor').click();
    cy.get('[data-cy="Wrong Form Workout Card"] > .MuiCardContent-root > .MuiBox-root > .quill > .ql-container > .ql-editor').clear();
    cy.get('[data-cy="Wrong Form Workout Card"] > .MuiCardContent-root > .MuiBox-root > .quill > .ql-container > .ql-editor').type('testing the wrong form workout cards textarea');





    cy.get('[data-cy="Wrong Form Workout Card"] > .MuiCardContent-root > .MuiBox-root > .quill > .ql-container > .ql-editor').should('have.text', 'testing the wrong form workout cards textarea');
    cy.get('[data-cy="Add Icon Wrong-Dialog"] > [data-testid="AddIcon"]').click();
    cy.get(':nth-child(2) > [data-cy="Wrong Form Workout Card"] > .MuiCardContent-root > .MuiBox-root > .quill > .ql-container > .ql-editor').click();
    cy.get(':nth-child(2) > [data-cy="Wrong Form Workout Card"] > .MuiCardContent-root > .MuiBox-root > .quill > .ql-container > .ql-editor').clear();
    cy.get(':nth-child(2) > [data-cy="Wrong Form Workout Card"] > .MuiCardContent-root > .MuiBox-root > .quill > .ql-container > .ql-editor').type('testing the second wrong form workout card\'s textarea');
    cy.get(':nth-child(2) > [data-cy="Wrong Form Workout Card"] > .MuiButton-outlined').click().selectFile('src/static/images/test.jpg', { force: true });


    /* ==== Generated with Cypress Studio ==== */
    cy.get(':nth-child(2) > [data-cy="Wrong Form Workout Card"] > .MuiCardContent-root > .MuiBox-root > .quill > .ql-container > .ql-editor > p').click();
    cy.get(':nth-child(2) > [data-cy="Wrong Form Workout Card"] > .MuiCardContent-root > .MuiBox-root > .quill > .ql-container > .ql-editor').should('have.text', 'testing the second wrong form workout card\'s textarea');
    cy.get(':nth-child(6) > .MuiDialog-container > .MuiPaper-elevation24 > .MuiDialogActions-root > .MuiButtonBase-root').click({ force: true});
    cy.get('.MuiDialogActions-root > .MuiButtonBase-root').click();
    cy.get('.css-517uf5 > .MuiBox-root > .MuiButtonBase-root').should('be.enabled');
    cy.get('.css-517uf5 > .MuiBox-root > .MuiButtonBase-root').click();


    cy.intercept('PATCH', `${Cypress.env('REST_API_URL')}course/1044`, {
      statusCode: 200,
      body: {
        "id": 1044,
        "average_rating": null,
        "created_by_name": "test",
        "difficulty_display": "Beginner",
        "enrollee_count": 0,
        "title": "Testing new course title",
        "description": "there's change",
        "thumbnail": null,
        "difficulty": "BG",
        "course_created": "2024-05-10",
        "course_updated": "2024-05-11T02:01:02.032021+08:00",
        "status": "P",
        "price": "1.00",
        "weeks": 6,
        "is_draft": false,
        "created_by": 2
      }
    }).as('submit-course')
    cy.get('#alert-dialog-title').should('be.visible');
    cy.get('.MuiDialogContent-root').should('be.visible');
    cy.get('.MuiDialogActions-root > :nth-child(2)').should('be.enabled');
    cy.get('.MuiDialogActions-root > :nth-child(2)').click();
    cy.wait(500);
    cy.wait('@submit-course');
    /* ==== End Cypress Studio ==== */
  });


})