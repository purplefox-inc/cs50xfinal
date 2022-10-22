/* eslint-disable no-undef */

describe('Route Optimizer', function() {
  it('web app launches and logs-in', function() {
    cy.visit('http://localhost:3000')
    cy.contains('MENU').click()
    cy.contains('LOGIN').click()
    cy.get('input').first().type('adrianaris')
    cy.get('input').last().type('admin')
    cy.get('button').contains('Login').click()
    cy.contains('Welcome adrianaris')
  })

  it('add location', function() {
    cy.get('[id=mainGeocoder]').within(() => {
      cy.get('input').type('brus')
    })
    cy.contains('Brussels').eq(0).click()
    cy.contains('Brussels')
    cy.contains('Locations-count').within(() => {
      cy.get('b').then($b => {
        expect($b.text()).to.equal('1')
      })
    })
  })

  it('jobDone', function() {
    cy.contains('jobDone').click()
    cy.contains('Undo jobDone').click()
    cy.contains('jobDone')
  })

  it('removing location', function() {
    cy.contains('Locations-count:').within(() => {
      return cy.get('b').then($b => {
        cy.wrap($b.text()).as('count')
      })
    })
    cy.get('[id=remove]').eq(0).click()
    cy.contains('Locations-count').within(() => {
      cy.get('b').then($b => {
        cy.get('@count').then(count => {
          expect(Number.parseInt($b.text())).to.equal(count - 1)
        })
      })
    })
  })

  it('DEPOT gets initialized, new route created and saved', function() {
    const months = ['jan', 'feb', 'march', 'april',
      'mai', 'june', 'july', 'aug',
      'sept', 'oct', 'nov', 'dec']
    const date = new Date()
    const routeName = `route ${date.getDate()}/${months[date.getMonth()]}/${date.getFullYear()}`

    cy.contains(routeName)
    cy.contains('MENU').click()
    cy.contains('USERPANEL').click()
    cy.contains(routeName)
  })

  it('reuse route', function() {
    cy.contains('route Test 21/2/2022').click()
    cy.get('button').contains('Reuse this route').click()
    cy.contains('route Test 21/2/2022')
  })
})