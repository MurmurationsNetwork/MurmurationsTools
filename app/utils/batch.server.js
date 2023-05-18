import {
  fetchDeleteWithBody,
  fetchGet,
  fetchJsonPostWithFile,
  fetchPutWithFile
} from '~/utils/fetcher'

export async function getBatches(userId) {
  const url =
    process.env.PUBLIC_DATA_PROXY_URL + '/v1/batch/user?user_id=' + userId
  console.log(url)
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
  const validateUrl = process.env.PUBLIC_DATA_PROXY_URL + '/v1/batch/validate'
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
  const importUrl = process.env.PUBLIC_DATA_PROXY_URL + '/v1/batch/import'
  let formData = new FormData()
  formData.append('file', file)
  formData.append('schemas', '[' + schemas + ']')
  formData.append('title', title)
  formData.append('user_id', userId)
  try {
    return await fetchJsonPostWithFile(importUrl, formData)
  } catch (err) {
    throw new Response(`importBatch failed: ${err}`, {
      status: 500
    })
  }
}

export async function editBatch(file, title, userId, batchId) {
  const editUrl = process.env.PUBLIC_DATA_PROXY_URL + '/v1/batch/import'
  let formData = new FormData()
  formData.append('file', file)
  formData.append('title', title)
  formData.append('user_id', userId)
  formData.append('batch_id', batchId)
  try {
    return await fetchPutWithFile(editUrl, formData)
  } catch (err) {
    throw new Response(`importBatch failed: ${err}`, {
      status: 500
    })
  }
}

export async function deleteBatch(batchId, userId) {
  const deleteUrl = process.env.PUBLIC_DATA_PROXY_URL + '/v1/batch/import'
  let formData = new FormData()
  formData.append('batch_id', batchId)
  formData.append('user_id', userId)
  let response = await fetchDeleteWithBody(deleteUrl, formData)
  try {
    return response
  } catch (err) {
    throw new Response(`deleteBatch failed: ${err}`, {
      status: 500
    })
  }
}
