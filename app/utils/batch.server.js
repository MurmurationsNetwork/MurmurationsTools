import { fetchJsonPostWithFile } from '~/utils/fetcher'

export async function validateBatch(file, schemas) {
  const validateUrl = process.env.PUBLIC_DATA_PROXY_URL + '/batch/validate'
  let formData = new FormData()
  formData.append('file', file)
  formData.append('schemas', '[' + schemas + ']')
  console.log('[' + schemas + ']')
  try {
    return await fetchJsonPostWithFile(validateUrl, formData)
  } catch (err) {
    throw new Response(`validateBatch failed: ${err}`, {
      status: 500
    })
  }
}
