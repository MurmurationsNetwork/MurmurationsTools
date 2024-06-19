import { fetchGet } from '~/utils/fetcher'
import { handleNotOK } from '~/utils/handleResponse'

export async function loadCountries() {
  try {
    let response = await fetchGet(
      `${process.env.PUBLIC_LIBRARY_URL}/v2/countries`
    )
    if (!response.ok) {
      const data = await handleNotOK(response)
      throw new Response(JSON.stringify(data), {
        status: response.status
      })
    }
    let countries = await response.json()
    return Object.keys(countries).map(country => ({ name: country }))
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
