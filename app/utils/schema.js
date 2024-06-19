import { fetchGet } from '~/utils/fetcher'
import { handleNotOK } from '~/utils/handleResponse'

export async function loadSchema() {
  try {
    let res = await fetchGet(process.env.PUBLIC_LIBRARY_URL + '/v2/schemas')
    if (!res.ok) {
      const data = await handleNotOK(res)
      throw new Response(JSON.stringify(data), {
        status: res.status
      })
    }
    let schema = await res.json()
    return schema.data
      .filter(s => {
        return !s.name.startsWith('default-v')
      })
      .filter(s => {
        return !s.name.startsWith('test_schema-v')
      })
  } catch (e) {
    if (e instanceof Response) {
      throw e
    } else {
      throw new Response(`loadSchemas error: ${e.message || e}`, {
        status: 500
      })
    }
  }
}
