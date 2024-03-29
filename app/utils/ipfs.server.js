import { fetchFilePostWithAuth, fetchPostWithAuth } from '~/utils/fetcher'

const url = process.env.PRIVATE_IPFS_URL
const lifetime = process.env.PUBLIC_IPNS_LIFETIME || '24h'

export async function ipnsKeyGen(arg) {
  const res = await fetchPostWithAuth(`${url}/key/gen?arg=${arg}`)
  return await res.json()
}

export function ipnsPublish(arg, key) {
  fetchPostWithAuth(
    `${url}/name/publish?arg=${arg}&key=${key}&lifetime=${lifetime}`
  )
}

export async function ipfsUpload(fileData) {
  let formData = new FormData()
  formData.append('file', fileData)
  const res = await fetchFilePostWithAuth(`${url}/add?cid-version=1`, formData)
  return await res.json()
}
