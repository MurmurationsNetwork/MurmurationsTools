import { generateSchemaInstance } from '@murmurations/jsig'

export default async function generateInstance(schema, data) {
  try {
    return await generateSchemaInstance(schema, data)
  } catch (err) {
    throw new Response(`Schema Generate Instance error: ${err}`, {
      status: 500
    })
  }
}
