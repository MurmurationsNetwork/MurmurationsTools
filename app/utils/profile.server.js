import crypto from 'crypto'
import cuid from 'cuid'

import { fetchDelete, fetchGet, fetchJsonPost } from '~/utils/fetcher'
import { ipnsPublish, ipfsUpload } from '~/utils/ipfs.server'
import {
  mongoConnect,
  mongoDeleteProfile,
  mongoDeleteUserProfile,
  mongoDisconnect,
  mongoGetProfile,
  mongoGetProfiles,
  mongoGetUser,
  mongoSaveProfile,
  mongoUpdateIpfs,
  mongoUpdateProfile,
  mongoUpdateUserIpfs,
  mongoUpdateUserProfile
} from '~/utils/mongo.server'
import { settings } from '~/utils/settings'

const ipfsEnabled = settings.ipfsEnabled

async function postNode(profileId) {
  const postUrl = process.env.PUBLIC_INDEX_URL + '/v2/nodes'
  const profileUrl = process.env.PUBLIC_TOOLS_URL + '/profiles/' + profileId
  const res = await fetchJsonPost(postUrl, {
    profile_url: profileUrl
  })
  try {
    return await res.json()
  } catch (err) {
    throw new Response(`postNode failed: ${err}`, {
      status: 500
    })
  }
}

async function publishProfileList(client, emailHash) {
  // get the latest profile list
  const user = await mongoGetUser(client, emailHash)
  const profileList = await mongoGetProfiles(client, user.profiles)

  // upload to IPFS and update to IPNS
  if (ipfsEnabled) {
    const ipfsProfile = await ipfsUpload(JSON.stringify(profileList))
    await mongoUpdateUserIpfs(client, emailHash, ipfsProfile.Hash)
    const path = '/ipfs/' + ipfsProfile.Hash
    ipnsPublish(path, emailHash + '_' + user.cuid)
  }

  return await mongoGetUser(client, emailHash)
}

async function deleteNode(nodeId) {
  const url = process.env.PUBLIC_INDEX_URL + '/v2/nodes/' + nodeId
  try {
    return await fetchDelete(url)
  } catch (err) {
    throw new Response(`deleteNode failed: ${err}`, {
      status: 500
    })
  }
}

export async function getProfile(profileId) {
  const client = await mongoConnect()
  try {
    return await mongoGetProfile(client, profileId)
  } catch (err) {
    return {
      success: false,
      error: err
    }
  } finally {
    await mongoDisconnect(client)
  }
}

export async function saveProfile(userEmail, profileTitle, profileData) {
  const emailHash = crypto.createHash('sha256').update(userEmail).digest('hex')
  const profileId = cuid()
  const client = await mongoConnect()
  const profileObj = JSON.parse(profileData)
  try {
    let ipfsData
    if (ipfsEnabled) {
      ipfsData = await ipfsUpload(profileData)
    }
    const body = await postNode(profileId)
    const profile = {
      cuid: profileId,
      last_updated: Date.now(),
      linked_schemas: profileObj.linked_schemas,
      profile: profileData,
      title: profileTitle,
      node_id: body?.data?.node_id ? body?.data?.node_id : ''
    }
    if (ipfsEnabled) {
      profile.ipfs = [ipfsData.Hash]
    }
    await mongoSaveProfile(client, profile)
    await mongoUpdateUserProfile(client, emailHash, profileId)
    const userData = await publishProfileList(client, emailHash)

    return {
      success: true,
      message: 'Profile saved.',
      userData: userData
    }
  } catch (err) {
    throw new Response(`saveProfile failed: ${err}`, {
      status: 500
    })
  } finally {
    await mongoDisconnect(client)
  }
}

export async function updateProfile(
  userEmail,
  profileId,
  profileTitle,
  profileData,
  profileIpfsHash
) {
  const emailHash = crypto.createHash('sha256').update(userEmail).digest('hex')
  const client = await mongoConnect()
  try {
    let user = await mongoGetUser(client, emailHash)
    if (!user?.profiles.includes(profileId)) {
      return {
        success: false,
        error: "You cannot modify other people's data."
      }
    }

    if (ipfsEnabled) {
      const ipfsData = await ipfsUpload(profileData)
      if (ipfsData.Hash !== profileIpfsHash) {
        await mongoUpdateIpfs(client, profileId, ipfsData.Hash)
      }
    }
    const profileObj = JSON.parse(profileData)
    const profile = {
      linked_schemas: profileObj.linked_schemas,
      profile: profileData,
      title: profileTitle
    }
    await mongoUpdateProfile(client, profileId, profile)
    const userData = await publishProfileList(client, emailHash)

    // update the node after the profile is updated
    await postNode(profileId)

    return {
      success: true,
      message: 'Profile updated.',
      userData: userData
    }
  } catch (err) {
    throw new Response(`updateProfile failed: ${err}`, {
      status: 500
    })
  } finally {
    await mongoDisconnect(client)
  }
}

export async function deleteProfile(userEmail, profileId) {
  const emailHash = crypto.createHash('sha256').update(userEmail).digest('hex')
  const client = await mongoConnect()
  try {
    let user = await mongoGetUser(client, emailHash)
    if (!user?.profiles.includes(profileId)) {
      return {
        success: false,
        error: "You cannot delete other people's data."
      }
    }

    const profile = await mongoGetProfile(client, profileId)
    await mongoDeleteProfile(client, profileId)
    const res = await deleteNode(profile.node_id)
    if (res.status !== 200) {
      await mongoSaveProfile(client, profile)
      return {
        success: false,
        error: 'Cannot delete the node from the Murmurations Index.'
      }
    }
    await mongoDeleteUserProfile(client, emailHash, profileId)
    const userData = await publishProfileList(client, emailHash)

    return {
      success: true,
      message: 'Profile deleted.',
      userData: userData
    }
  } catch (err) {
    throw new Response(`deleteProfile failed: ${err}`, {
      status: 500
    })
  } finally {
    await mongoDisconnect(client)
  }
}

async function getProfiles(emailHash) {
  const client = await mongoConnect()
  try {
    const user = await mongoGetUser(client, emailHash)
    return await mongoGetProfiles(client, user.profiles)
  } catch (err) {
    throw new Response(`getProfiles failed: ${err}`, {
      status: 500
    })
  } finally {
    await mongoDisconnect(client)
  }
}

export async function getProfileList(user) {
  try {
    // if users have IPNS, make sure the IPNS can be connected, because IPNS will be expired after a while
    if (ipfsEnabled && user?.ipns && user?.ipfs) {
      const url = process.env.PUBLIC_IPNS_GATEWAY_URL + '/' + user.ipns
      const path = '/ipfs/' + user.ipfs
      fetch(url, { timeout: 3000 })
        .then(res => {
          if (res.status !== 200) {
            ipnsPublish(path, user.email_hash + '_' + user.cuid)
          }
        })
        .catch(err => {
          ipnsPublish(path, user.email_hash + '_' + user.cuid)
        })
    }

    let mongoPromise = new Promise((resolve, reject) => {
      resolve(getProfiles(user.email_hash))
      reject('reject from mongo')
    })

    let promise
    if (ipfsEnabled && (user?.ipns || user?.ipfs)) {
      let url
      if (user?.ipfs) {
        url = process.env.PUBLIC_IPFS_GATEWAY_URL + '/' + user.ipfs
      } else {
        url = process.env.PUBLIC_IPNS_GATEWAY_URL + '/' + user.ipns
      }
      let ipnsPromise = new Promise((resolve, reject) => {
        resolve(fetchGet(url))
        reject('reject from IPFS')
      })
      promise = Promise.any([mongoPromise, ipnsPromise])
    } else {
      promise = Promise.any([mongoPromise])
    }

    let profiles, source
    const value = await promise
    if (value?.status) {
      profiles = await value.json()
      source = 'IPFS'
    } else {
      profiles = value
      source = 'DB'
    }

    user.profiles = profiles
    user.source = source
    return user
  } catch (err) {
    throw new Response(`getProfileList failed: ${err}`, {
      status: 500
    })
  }
}
