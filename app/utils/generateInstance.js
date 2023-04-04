export default function generateInstance(schema, data) {
  let profile = {}

  Object.keys(data)
    .filter(fieldName => data[fieldName] !== '')
    .forEach(fieldName => {
      if (fieldName === 'linked_schemas') {
        profile[fieldName] = data[fieldName].split(',').map(s => s.trim())
      } else if (fieldName.includes('[') || fieldName.includes('.')) {
        profile = parseArrayObject(fieldName, data[fieldName], schema, profile)
      } else {
        if (schema?.properties[fieldName]?.type === 'number') {
          profile[fieldName] = parseFloat(data[fieldName])
        } else {
          profile[fieldName] = data[fieldName]
        }
      }
    })
  return profile
}

function parseArrayObject(fieldName, fieldData, schema, profile) {
  let props = fieldName.split('.')
  let curr = profile
  let currSchema = schema

  for (let i = 0; i < props.length; i++) {
    let prop = props[i]
    let matches = prop.match(/(.+)\[(\d+)]/)

    if (matches) {
      let name = matches[1]
      let index = parseInt(matches[2])

      // Create the array if it doesn't exist yet
      if (!curr[name]) {
        curr[name] = []
      }

      // Create the object at the specified index if it doesn't exist yet
      if (props.length > 1 && !curr[name][index]) {
        curr[name][index] = {}
      }

      // Move the current pointer to the object at the specified index
      if (i === props.length - 1) {
        if (currSchema?.properties[name]?.items?.type === 'number') {
          fieldData = parseFloat(fieldData)
        }
        curr[name][index] = fieldData
      } else {
        curr = curr[name][index]
        currSchema = currSchema?.properties[name]?.items
      }
    } else {
      // Create the object if it doesn't exist yet
      if (!curr[prop]) {
        curr[prop] = {}
      }

      // Move the current pointer to the object
      if (i === props.length - 1) {
        if (currSchema?.properties[prop]?.type === 'number') {
          fieldData = parseFloat(fieldData)
        }
        curr[prop] = fieldData
      } else {
        curr = curr[prop]
        currSchema = currSchema?.properties[prop]
      }
    }
  }

  return profile
}
