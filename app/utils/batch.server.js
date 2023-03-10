import { fetchGet, fetchJsonPostWithFile } from '~/utils/fetcher'

export async function getBatches(userId) {
  const url =
    process.env.PUBLIC_DATA_PROXY_URL + '/batch/user?user_id=' + userId
  const response = await fetchGet(url)
  try {
    return await response.json()
  } catch (err) {
    throw new Response(`getBatches failed: ${err}`, {
      status: 500
    })
  }
}

export async function validateBatch(file, schemas) {
  const validateUrl = process.env.PUBLIC_DATA_PROXY_URL + '/batch/validate'
  let formData = new FormData()
  formData.append('file', file)
  formData.append('schemas', '[' + schemas + ']')
  try {
    return await fetchJsonPostWithFile(validateUrl, formData)
  } catch (err) {
    throw new Response(`validateBatch failed: ${err}`, {
      status: 500
    })
  }
}

export async function importBatch(file, schemas, title, userId) {
  const uploadUrl = process.env.PUBLIC_DATA_PROXY_URL + '/batch/import'
  let formData = new FormData()
  formData.append('file', file)
  formData.append('schemas', '[' + schemas + ']')
  formData.append('title', title)
  formData.append('user_id', userId)
  try {
    return await fetchJsonPostWithFile(uploadUrl, formData)
  } catch (err) {
    throw new Response(`importBatch failed: ${err}`, {
      status: 500
    })
  }
}
