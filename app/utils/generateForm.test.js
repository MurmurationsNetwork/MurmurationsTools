import '@testing-library/jest-dom'
import { screen, render } from '@testing-library/react'

import generateForm from './generateForm'
import { test_schema_1 } from './test_schemas'

/**
 * @vitest-environment jsdom
 */

// describe('generateForm tests', () => {
//   it('Schema with no properties should return null', () => {
//     expect(generateForm(schemaHeader)).toBe(null)
//   })
// })

describe('render form tests', () => {
  it('Should render string and number input fields', () => {
    render(generateForm(test_schema_1))

    expect(
      screen.getByRole('textbox', { name: /name/i, type: /string/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('spinbutton', {
        name: /geolocation.lat/i,
        type: /number/i
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('spinbutton', {
        name: /geolocation.lon/i,
        type: /number/i
      })
    ).toBeInTheDocument()
  })

  // it('Should render input fields from object and Add button for array', () => {
  //   const renderer = render(generateForm(test_schema_2))
  //
  //   console.log(prettyDOM(renderer.container.firstChild))
  //
  //   expect(
  //     screen.getByRole('textbox', { name: /urls[0].name/i, type: /string/i })
  //   ).toBeInTheDocument()
  //   expect(
  //     screen.getByRole('textbox', { name: /urls[0].url/i, type: /string/i })
  //   ).toBeInTheDocument()
  //   expect(
  //     screen.getByRole('button', { name: /add/i, type: /button/i })
  //   ).toBeInTheDocument()
  // })
})
