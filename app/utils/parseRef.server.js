import { parseSchemas } from '@murmurations/jsig'

export default async function parseRef(schemaName) {
  const url = `${process.env.PUBLIC_LIBRARY_URL}/v2/schemas`
  try {
    if (typeof schemaName === 'string') {
      schemaName = [schemaName]
    }
    return await parseSchemas(url, schemaName)
  } catch (err) {
    throw new Response(`Schema Parse error: ${err}`, {
      status: 500
    })
  }
}
