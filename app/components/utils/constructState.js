/*
 * This function is used for generating the initial state of the form using the schema
 * @param {Object} schema - The schema of the form
 * @returns {Object} - The initial state of the form
 */
export const constructState = schema => {
  if (
    schema?.type === 'string' ||
    schema?.type === 'number' ||
    schema?.type === 'boolean'
  ) {
    return ''
  } else if (schema?.type === 'array') {
    return [constructState(schema?.items)]
  } else if (schema?.type === 'object' && schema?.properties) {
    const data = {}
    Object?.keys(schema?.properties).map(property => {
      // we don't need to put linked_schemas in the state
      if (property !== 'linked_schemas') {
        data[property] = constructState(schema?.properties[property])
      }
      return null
    })
    return data
  }
}
