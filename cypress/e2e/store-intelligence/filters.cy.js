const { storeIntel } = require('../../fixtures/endpoints')
const categories = require('../../fixtures/mappings/category-ids.json')

describe('Store Intelligence Filters Tests', () => {
  const measureTypes = {
    downloads: 'units',
    revenue: 'revenue',
  }
  const comparisonAttributes = {
    absolute: 'absolute',
    delta: 'delta',
    transformed_delta: 'transformed_delta',
    revenue_absolute: 'revenue_absolute',
  }
  const deviceTypes = {
    ios: {
      iphone: 'iphone',
      ipad: 'ipad',
      total: 'total',
    },
    android: '',
    total: 'total',
  }

  const token = Cypress.env('token')
  const queryUrl = (platform) =>
    `${storeIntel.topApps(platform)}?auth_token=${token}`
  const getRequestBody = (
    comparisonAttr,
    category,
    deviceType,
    measure,
    ...rest
  ) => {
    return {
      category,
      measure,
      comparison_attribute: comparisonAttr,
      device_type: deviceType,
      time_range: 'week',
      date: '2021-01-01',
      ...rest,
    }
  }
  const incorrectValue = 'incorrect!'
  const missingValue = null
  const errors = {
    compAttrNotIncluded: 'Comparison attribute is not included in the list',
    invalidCategory: 'Invalid category',
    missingCategory: 'Required parameter: category is missing',
  }

  it('returns 200 status code - ios', () => {
    cy.request({
      url: queryUrl('ios'),
      form: true,
      body: getRequestBody(
        comparisonAttributes.absolute,
        categories.ios.Books,
        deviceTypes.ios.iphone,
        measureTypes.downloads
      ),
    })
      .its('status')
      .should('eql', 200)
  })

  it('returns 422 status code for incorrect comparison attribute - ios', () => {
    cy.request({
      url: queryUrl('ios'),
      form: true,
      body: getRequestBody(
        incorrectValue,
        categories.ios.Books,
        deviceTypes.ios.ipad,
        measureTypes.downloads
      ),
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eql(422)
      expect(resp.body).to.eql(errors.compAttrNotIncluded)
    })
  })

  //I find it inconsistent that category errors are returned in errors object but
  //comparison attribute errors are just in the body object
  it('returns 422 status code for incorrect category - ios', () => {
    cy.request({
      url: queryUrl('ios'),
      form: true,
      body: getRequestBody(
        comparisonAttributes.absolute,
        incorrectValue,
        deviceTypes.ios.iphone,
        measureTypes.downloads
      ),
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eql(422)
      expect(resp.body.errors[0].title).to.eql(errors.invalidCategory)
    })
  })

  it('returns 422 status code for missing comparison attribute - ios', () => {
    cy.request({
      url: queryUrl('ios'),
      form: true,
      body: getRequestBody(
        missingValue,
        categories.ios.Books,
        deviceTypes.ios.iphone,
        measureTypes.downloads
      ),
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eql(422)
      expect(resp.body).to.eql(errors.compAttrNotIncluded)
    })
  })

  it('return 422 status code for missing category - ios', () => {
    cy.request({
      url: queryUrl('ios'),
      form: true,
      body: getRequestBody(
        comparisonAttributes.delta,
        missingValue,
        deviceTypes.ios.iphone,
        measureTypes.downloads
      ),
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eql(422)
      expect(resp.body.errors[0].title).to.eql(errors.missingCategory)
    })
  })


  //Bugged? Returns also "Reference" category entities
  it('should filter apps by category - ios', () => {
    cy.request({
      url: queryUrl('ios'),
      form: true,
      body: getRequestBody(
        comparisonAttributes.absolute,
        categories.ios.Books,
        deviceTypes.ios.iphone,
        measureTypes.downloads
      ),
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eql(200)

      
      cy.wrap(resp.body).each((el) =>
        expect(el.custom_tags['Primary Category']).to.eql('Books')
      )
    })
  })

  it('should chart apps by absolute downloads - ios', () => {
    cy.request({
      url: queryUrl('ios'),
      form: true,
      body: getRequestBody(
        comparisonAttributes.absolute,
        categories.ios.Books,
        deviceTypes.ios.iphone,
        measureTypes.downloads
      ),
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eql(200)

      cy.wrap(resp.body).each(
        (el, idx, list) =>
          expect(idx === 0 || el.absolute < list[idx - 1].absolute).to.be.true
      )
    })
  })

  it('should chart apps by growth in downloads - ios', () => {
    cy.request({
      url: queryUrl('ios'),
      form: true,
      body: getRequestBody(
        comparisonAttributes.delta,
        categories.ios.Books,
        deviceTypes.ios.iphone,
        measureTypes.downloads
      ),
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eql(200)

      cy.wrap(resp.body).each(
        (el, idx, list) =>
          expect(idx === 0 || el.delta < list[idx - 1].delta).to.be.true
      )
    })
  })

  it('should chart apps by growth percentage in downloads - ios', () => {
    cy.request({
      url: queryUrl('ios'),
      form: true,
      body: getRequestBody(
        comparisonAttributes.transformed_delta,
        categories.ios.Books,
        deviceTypes.ios.iphone,
        measureTypes.downloads
      ),
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eql(200)

      cy.wrap(resp.body).each(
        (el, idx, list) =>
          expect(
            idx === 0 || el.transformed_delta < list[idx - 1].transformed_delta
          ).to.be.true
      )
    })
  })

  it('should chart apps by absolute revenue - ios', () => {
    cy.request({
      url: queryUrl('ios'),
      form: true,
      body: getRequestBody(
        comparisonAttributes.absolute,
        categories.ios.Books,
        deviceTypes.ios.iphone,
        measureTypes.revenue
      ),
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eql(200)

      cy.wrap(resp.body).each(
        (el, idx, list) =>
          expect(
            idx === 0 || el.revenue_absolute < list[idx - 1].revenue_absolute
          ).to.be.true
      )
    })
  })

  it('should chart apps by growth in revenue - ios', () => {
    cy.request({
      url: queryUrl('ios'),
      form: true,
      body: getRequestBody(
        comparisonAttributes.delta,
        categories.ios.Books,
        deviceTypes.ios.iphone,
        measureTypes.revenue
      ),
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eql(200)

      cy.wrap(resp.body).each(
        (el, idx, list) =>
          expect(idx === 0 || el.revenue_delta < list[idx - 1].revenue_delta).to
            .be.true
      )
    })
  })

  it('should chart apps by growth percentage in revenue - ios', () => {
    cy.request({
      url: queryUrl('ios'),
      form: true,
      body: getRequestBody(
        comparisonAttributes.transformed_delta,
        categories.ios.Books,
        deviceTypes.ios.iphone,
        measureTypes.revenue
      ),
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eql(200)

      cy.wrap(resp.body).each(
        (el, idx, list) =>
          expect(
            idx === 0 ||
              el.revenue_transformed_delta <
                list[idx - 1].revenue_transformed_delta
          ).to.be.true
      )
    })
  })
})
