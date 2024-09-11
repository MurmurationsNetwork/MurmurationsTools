import { fetchDelete, fetchGet, fetchJsonPost } from '~/utils/fetcher'
import { handleNotOK } from '~/utils/handleResponse'

export async function getNodes(searchParams) {
  try {
    let response = await fetchGet(
      `${process.env.PUBLIC_INDEX_URL}/v2/nodes?${searchParams}`
    )

    if (!response.ok && response.status !== 400) {
      const data = await handleNotOK(response)
      throw new Response(JSON.stringify(data), {
        status: response.status
      })
    }

    const nodes = await response.json()

    return {
      data: nodes,
      status: response.status
    }
  } catch (e) {
    if (e instanceof Response) {
      throw e
    } else {
      throw new Response(`Failed to load nodes: ${e.message || e}`, {
        status: 500
      })
    }
  }
}

export async function postNode(url) {
  try {
    const response = await fetchJsonPost(
      process.env.PUBLIC_INDEX_URL + '/v2/nodes-sync',
      {
        profile_url: url
      }
    )
    if (!response.ok) {
      const data = await handleNotOK(response)
      throw new Response(JSON.stringify(data), {
        status: response.status
      })
    }
    return response.json()
  } catch (e) {
    if (e instanceof Response) {
      throw e
    } else {
      throw new Response(`Failed to post node: ${e.message || e}`, {
        status: 500
      })
    }
  }
}

export async function getNodeStatus(node_id) {
  try {
    let response = await fetchGet(
      `${process.env.PUBLIC_INDEX_URL}/v2/nodes/${node_id}`
    )
    if (!response.ok) {
      const data = await handleNotOK(response)
      throw new Response(JSON.stringify(data), {
        status: response.status
      })
    }
    return response.json()
  } catch (e) {
    if (e instanceof Response) {
      throw e
    } else {
      throw new Response(`Failed to get node status: ${e.message || e}`, {
        status: 500
      })
    }
  }
}

export async function deleteNode(node_id) {
  try {
    let response = await fetchDelete(
      `${process.env.PUBLIC_INDEX_URL}/v2/nodes/${node_id}`
    )
    if (!response.ok) {
      const data = await handleNotOK(response)
      throw new Response(JSON.stringify(data), {
        status: response.status
      })
    }

    return response.json()
  } catch (e) {
    if (e instanceof Response) {
      throw e
    } else {
      throw new Response(`Failed to delete node: ${e.message || e}`, {
        status: 500
      })
    }
  }
}
