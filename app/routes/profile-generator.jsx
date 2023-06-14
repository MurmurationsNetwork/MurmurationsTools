import { useEffect, useState } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { json, redirect } from '@remix-run/node'
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useRouteError,
  useSearchParams
} from '@remix-run/react'

import { userCookie } from '~/utils/cookie'
import { fetchGet, fetchJsonPost } from '~/utils/fetcher'
import generateInstance from '~/utils/generateInstance.server'
import parseRef from '~/utils/parseRef.server'
import {
  deleteProfile,
  getProfile,
  getProfileList,
  saveProfile,
  updateProfile
} from '~/utils/profile.server'
import { requireUserEmail, retrieveUser } from '~/utils/session.server'
import { loadSchema } from '~/utils/schema'
import { GenerateForm } from '@murmurations/jsrfg'
import HandleError from '~/components/HandleError'

export async function action({ request }) {
  let formData = await request.formData()
  let rawData = {}
  for (let key of formData.keys()) {
    const values = formData.getAll(key)

    // Deal with multiple values submitted as an array
    if (key.endsWith('[]')) {
      const keyWithoutBrackets = key.slice(0, -2)

      if (values.length === 1) {
        rawData[keyWithoutBrackets] = []
        rawData[keyWithoutBrackets].push(...values)
      } else {
        rawData[keyWithoutBrackets] = values
      }

      delete rawData[key]
    } else {
      rawData[key] = values.length > 1 ? values : values[0]
    }
  }
  let { _action, ...data } = rawData
  let schema,
    profileId,
    profileTitle,
    profileData,
    profile,
    response,
    body,
    userEmail,
    profileIpfsHash
  switch (_action) {
    case 'submit':
      schema = await parseRef(data.linked_schemas)
      profile = await generateInstance(schema, data)
      response = await fetchJsonPost(
        process.env.PUBLIC_INDEX_URL + '/v2/validate',
        profile
      )
      body = await response.json()
      if (response.status === 400) {
        return json(body, { status: 400 })
      }
      if (response.status === 404) {
        return json(body, { status: 404 })
      }
      if (!response.ok) {
        throw new Response('Profile validation error', {
          status: response.status
        })
      }
      return json(profile, { status: 200 })
    case 'select':
      return await parseRef(data.schema)
    case 'save':
      userEmail = await requireUserEmail(request, '/')
      profileData = formData.get('instance')
      profileTitle = formData.get('profile_title')
      response = await saveProfile(userEmail, profileTitle, profileData)
      if (!response.success) {
        return json({ success: response.success, message: response.message })
      }
      return json(response, {
        headers: {
          'Set-Cookie': await userCookie.serialize(response.userData)
        }
      })
    case 'modify':
      profileId = formData.get('profile_id')
      profileData = await getProfile(profileId)
      schema = await parseRef(profileData.linked_schemas)
      return json({
        schema: schema,
        profileData: JSON.parse(profileData.profile),
        profileId: profileId,
        profileTitle: profileData.title,
        profileIpfsHash: profileData.ipfs[0]
      })
    case 'update':
      userEmail = await requireUserEmail(request, '/')
      profileId = formData.get('profile_id')
      profileTitle = formData.get('profile_title')
      profileIpfsHash = formData.get('profile_ipfs_hash')
      schema = await parseRef(data.linked_schemas)
      // delete profile_id, profile_title from data
      let { profile_id, profile_title, profile_ipfs_hash, ...instanceData } =
        data
      profile = generateInstance(schema, instanceData)
      response = await fetchJsonPost(
        process.env.PUBLIC_INDEX_URL + '/v2/validate',
        profile
      )
      body = await response.json()
      if (response.status === 400) {
        return json({
          errors: body?.errors,
          schema: schema,
          profileData: profile
        })
      }
      if (response.status === 404) {
        return json({
          errors: body?.errors,
          schema: schema,
          profileData: profile
        })
      }
      if (!response.ok) {
        throw new Response('Profile validation error', {
          status: response.status
        })
      }
      response = await updateProfile(
        userEmail,
        profileId,
        profileTitle,
        JSON.stringify(profile),
        profileIpfsHash
      )
      return json(response, {
        headers: {
          'Set-Cookie': await userCookie.serialize(response.userData)
        }
      })
    case 'delete':
      userEmail = await requireUserEmail(request, '/')
      profileId = formData.get('profile_id')
      response = await deleteProfile(userEmail, profileId)
      if (!response.success) {
        return json(response)
      }
      return json(response, {
        headers: {
          'Set-Cookie': await userCookie.serialize(response.userData)
        }
      })

    default:
      return null
  }
}

export async function loader(request) {
  const schema = await loadSchema()
  const cookieHeader = request.request.headers.get('Cookie')
  let cookie = await userCookie.parse(cookieHeader)
  let loginSession = cookieHeader
    ? cookieHeader.indexOf('murmurations_session=')
    : -1
  const ipfsGatewayUrl = process.env.PUBLIC_IPFS_GATEWAY_URL
  const profilePostUrl = process.env.PUBLIC_INDEX_URL + '/v2/nodes'
  let userWithProfile
  // If user is not login or logout, return empty user
  if (loginSession === -1 || cookieHeader.includes('murmurations_session=;')) {
    return json({
      schema: schema,
      user: userWithProfile,
      ipfsGatewayUrl: ipfsGatewayUrl,
      profilePostUrl: profilePostUrl
    })
  }
  const user = await retrieveUser(request)
  if (!cookie || cookie === '{}' || user?.email_hash !== cookie?.email_hash) {
    return redirect('/profile-generator', {
      headers: {
        'Set-Cookie': await userCookie.serialize(user)
      }
    })
  }
  userWithProfile = await getProfileList(cookie)
  return json({
    schema: schema,
    user: userWithProfile,
    ipfsGatewayUrl: ipfsGatewayUrl,
    profilePostUrl: profilePostUrl
  })
}

export const unstable_shouldReload = () => true

export default function Index() {
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const defaultSchema = searchParams.get('schema')
    ? searchParams.get('schema').split(',')
    : undefined
  let loaderData = useLoaderData()
  let schemas = loaderData.schema
  let user = loaderData.user
  let ipfsGatewayUrl = loaderData.ipfsGatewayUrl
  let profilePostUrl = loaderData.profilePostUrl
  let data = useActionData()
  let [schema, setSchema] = useState('')
  let [profileData, setProfileData] = useState('')
  let [profileTitle, setProfileTitle] = useState('')
  let [instance, setInstance] = useState('')
  let [errors, setErrors] = useState([])
  useEffect(() => {
    if (data?.$schema) {
      setSchema(data)
      setProfileData('')
      setInstance('')
      setErrors([])
    }
    if (data?.linked_schemas) {
      setInstance(data)
      setErrors([])
    }
    if (data?.profileData) {
      setSchema(data.schema)
      setProfileData(data.profileData)
      setInstance('')
      setErrors([])
    }
    if (data?.success) {
      setSchema('')
      setProfileData('')
      setInstance('')
      toast.success(data.message)
      setErrors([])
    }
    if (data?.error) {
      toast.error(data.error)
    }
    if (data?.errors) {
      // errors needs to be string array
      let errs = []
      for (let key in data.errors) {
        let obj = data.errors[key]
        let str =
          'Title: ' +
          obj?.title +
          ',Source: ' +
          obj?.source?.pointer +
          ',Detail: ' +
          obj?.detail
        errs.push(str)
      }
      setErrors(errs)
    }
    setProfileTitle(data?.profileTitle)
  }, [data])
  return (
    <div>
      <div className="mb-2 flex h-12 flex-row items-center justify-between bg-gray-50 px-2 py-1 dark:bg-gray-800 md:mb-4 md:h-20 md:px-4 md:py-2">
        <h1 className="text-xl md:contents md:text-3xl">Profile Generator</h1>
        {user ? (
          <div>
            <form action="/logout" method="post">
              <button
                type="submit"
                className="mx-0 my-2 inline-block h-6 rounded-full bg-red-500 px-4 py-0 font-bold text-white hover:scale-110 hover:bg-red-400 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100 md:my-8 md:h-8"
              >
                Logout
              </button>
            </form>
          </div>
        ) : (
          <div>
            <Link
              to="/login"
              className="mx-0 my-2 inline-block h-6 rounded-full bg-red-500 px-4 py-0 font-bold text-white hover:scale-110 hover:bg-red-400 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100 md:my-8 md:h-8"
              reloadDocument
            >
              Login
            </Link>
          </div>
        )}
      </div>
      <div className="box-border flex flex-col md:flex-row">
        <div className="inset-0 basis-full md:sticky md:top-0 md:h-screen md:basis-1/2 md:overflow-y-auto">
          <div className="px-2 md:px-4">
            {user?.source ? <span>Data source: {user.source}</span> : null}
            {user || schema ? null : (
              <div>
                <p>Login first if you want to save your profile here.</p>
                <p className="mt-2 md:mt-4">
                  Or just create a profile by selecting a schema from the list.{' '}
                  <a
                    className="text-red-500 dark:text-purple-200"
                    target="_blank"
                    rel="noreferrer"
                    href="https://docs.murmurations.network/guides/create-a-profile.html#_1-hosted-by-our-profile-generator"
                    onClick={e =>
                      window.goatcounter.count({
                        path: p => p + '?docs',
                        title: 'MPG docs',
                        event: true
                      })
                    }
                  >
                    See our documentation for details
                  </a>
                </p>
              </div>
            )}

            <div>
              <Toaster
                toastOptions={{
                  className: 'dark:text-gray-100 dark:bg-purple-500',
                  duration: 5000
                }}
              />
              {instance && !errors[0] ? (
                <>
                  <p className="mb-2 md:mb-4 md:text-xl">
                    Your profile preview has been generated:
                  </p>
                  <pre className="overflow-x-auto bg-slate-200 px-4 py-2 dark:bg-slate-800">
                    {JSON.stringify(instance, null, 2)}
                  </pre>
                  {user && (
                    <Form method="post">
                      <input
                        type="hidden"
                        name="instance"
                        defaultValue={JSON.stringify(instance)}
                      />
                      <label>
                        <div className="mt-4 font-bold">
                          Profile Title
                          <span className="text-red-500 dark:text-red-400">
                            *
                          </span>
                          :
                        </div>
                        <input
                          className="form-input mt-2 w-full dark:bg-gray-700 focus:dark:bg-gray-500"
                          type="text"
                          name="profile_title"
                          required="required"
                          placeholder="Enter a memorable title"
                        />
                      </label>
                      <button
                        className="mt-4 w-full bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-400 disabled:opacity-75 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100"
                        type="submit"
                        name="_action"
                        value="save"
                        disabled={navigation.state !== 'idle'}
                      >
                        {navigation.state === 'submitting' &&
                        navigation.formData?.get('_action') === 'save'
                          ? 'Saving...'
                          : navigation.state === 'loading' &&
                            navigation.formData?.get('_action') === 'save'
                          ? 'Saved!'
                          : 'Save to Index'}
                      </button>
                    </Form>
                  )}
                </>
              ) : null}
              {errors[0] ? (
                <div className="mb-4">
                  <p className="text-xl text-red-500 dark:text-red-400">
                    There were errors in your submission:
                  </p>
                  <ul className="list-disc px-4">
                    {errors.map(error => (
                      <li
                        className="text-lg text-red-500 dark:text-red-400"
                        key={error}
                      >
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {user?.profiles ? (
                <div className="md:mt-4">
                  <h1 className="hidden md:contents md:text-2xl">
                    My Profiles
                  </h1>
                  {user.profiles.map((_, index) => (
                    <ProfileItem
                      profile={user.profiles[index]}
                      ipfsGatewayUrl={ipfsGatewayUrl}
                      profilePostUrl={profilePostUrl}
                      navigation={navigation}
                      key={index}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mx-2 basis-full px-2 py-4 md:basis-1/2 md:px-4">
          <Form className="mb-2" method="post">
            <select
              className="block w-full border-2 border-gray-400 bg-white px-4 py-2 dark:bg-gray-700 md:w-96"
              id="schema"
              name="schema"
              multiple={true}
              required={true}
              size={6}
              defaultValue={defaultSchema}
            >
              {schemas.map(schema => (
                <option
                  className="mb-1 border-gray-50 px-2 py-0 text-sm"
                  value={schema.name}
                  key={schema.name}
                >
                  {schema.name}
                </option>
              ))}
            </select>
            <button
              className="mt-4 rounded-full bg-red-500 px-4 py-2 font-bold text-white hover:scale-110 hover:bg-red-400 disabled:opacity-75 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100"
              type="submit"
              name="_action"
              value="select"
              disabled={navigation.state !== 'idle'}
            >
              {navigation.state === 'submitting' &&
              navigation.formData?.get('_action') === 'select'
                ? 'Loading...'
                : navigation.state === 'loading' &&
                  navigation.formData?.get('_action') === 'select'
                ? 'Loaded!'
                : 'Select'}
            </button>
          </Form>
          {schema && profileData ? (
            <Form method="post">
              <h3 className="mt-8">
                Schemas selected:{' '}
                <ol>
                  {schema.metadata.schema.map((schemaName, index) => (
                    <li key={index}>
                      <code>{schemaName}</code>
                    </li>
                  ))}
                </ol>
              </h3>
              <label>
                <div className="mt-4 font-bold">
                  Profile Title
                  <span className="text-red-500 dark:text-red-400">*</span>:
                </div>
                <input
                  className="form-input mt-2 w-full dark:bg-gray-700 focus:dark:bg-gray-500"
                  type="text"
                  name="profile_title"
                  required="required"
                  placeholder="Enter a memorable title"
                  value={profileTitle}
                  onChange={e => setProfileTitle(e.target.value)}
                />
              </label>
              <input
                type="hidden"
                name="profile_id"
                defaultValue={data.profileId}
              />
              <input
                type="hidden"
                name="profile_ipfs_hash"
                defaultValue={data?.profileIpfsHash}
              />
              <GenerateForm schema={schema} profileData={profileData} />
              <button
                className="mt-4 w-full bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-400 disabled:opacity-75 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100"
                type="submit"
                name="_action"
                value="update"
                disabled={navigation.state !== 'idle'}
              >
                {navigation.state === 'submitting' &&
                navigation.formData?.get('_action') === 'update'
                  ? 'Updating...'
                  : navigation.state === 'loading' &&
                    navigation.formData?.get('_action') === 'update'
                  ? 'Updated!'
                  : 'Update Profile'}
              </button>
            </Form>
          ) : schema ? (
            <Form method="post">
              <h3 className="mt-8">
                Schemas selected:{' '}
                <ol>
                  {schema.metadata.schema.map((schemaName, index) => (
                    <li key={index}>
                      <code>{schemaName}</code>
                    </li>
                  ))}
                </ol>
              </h3>
              <GenerateForm schema={schema} />
              <button
                className="mt-4 w-full bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-400 disabled:opacity-75 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100"
                type="submit"
                name="_action"
                value="submit"
                disabled={navigation.state !== 'idle'}
              >
                {navigation.state === 'submitting' &&
                navigation.formData?.get('_action') === 'submit'
                  ? 'Processing...'
                  : navigation.state === 'loading' &&
                    navigation.formData?.get('_action') === 'submit'
                  ? 'Done!'
                  : 'Preview'}
              </button>
            </Form>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ProfileItem({ ipfsGatewayUrl, profile, profilePostUrl, navigation }) {
  const [status, setStatus] = useState(null)
  const [timer, setTimer] = useState(1000)
  const [deleteModal, setDeleteModal] = useState(false)

  useEffect(() => {
    if (status === 'posted') return
    if (status === 'deleted') {
      setStatus('Status Not Found - Node not found in Index')
      return
    }
    if (timer > 32000) {
      setStatus('Index Not Responding - Try again later')
      return
    }
    const interval = setTimeout(() => {
      let url = profilePostUrl + '/' + profile.node_id
      fetchGet(url)
        .then(res => {
          return res.json()
        })
        .then(res => {
          if (res?.status === 404) {
            setStatus('deleted')
          } else {
            setStatus(res.data?.status)
          }
        })
      setTimer(timer * 2)
    }, timer)

    return () => clearTimeout(interval)
  }, [profile.node_id, profile.status, profilePostUrl, status, timer])

  return (
    <>
      <div className="my-2 w-full overflow-hidden rounded-lg bg-gray-50 dark:bg-purple-800 md:my-4 md:w-96">
        <div className="px-6 py-4">
          <div className="mb-2 text-lg">
            Title:{' '}
            <button
              onClick={e =>
                window.goatcounter.count({
                  path: p => p + '?db-link',
                  title: 'DB link',
                  event: true
                })
              }
            >
              <Link
                to={{ pathname: `/profiles/${profile?.cuid}` }}
                target="_blank"
                className="text-yellow-600 no-underline hover:underline dark:text-green-300"
              >
                {profile?.title}
              </Link>
            </button>
            <br />
            {profile?.ipfs[0] ? (
              <>
                IPFS Address:{' '}
                <a
                  href={`${ipfsGatewayUrl}/${profile.ipfs[0]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-yellow-600 no-underline hover:underline dark:text-green-300"
                  onClick={e =>
                    window.goatcounter.count({
                      path: p => p + '?ipfs-link',
                      title: 'IPFS link',
                      event: true
                    })
                  }
                >
                  {profile.ipfs[0].substring(0, 6) +
                    '...' +
                    profile.ipfs[0].substr(53, 10)}
                </a>
              </>
            ) : (
              ''
            )}
          </div>
          <p>
            Murmurations Index Status:{' '}
            {status ? (
              <span className="font-bold">{status}</span>
            ) : (
              'Checking index...'
            )}
          </p>
          <p>
            Last Updated:{' '}
            {profile?.last_updated
              ? new Date(profile.last_updated).toDateString()
              : ''}
          </p>
          <p>
            Schema List:{' '}
            {profile?.linked_schemas ? profile?.linked_schemas.join(', ') : ''}
          </p>
          <div className="flex flex-row justify-between">
            <Form method="post" className="flex-none">
              <input
                type="hidden"
                name="profile_id"
                defaultValue={profile?.cuid}
              />
              <button
                className="mt-4 rounded-full bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-400 enabled:hover:scale-110 disabled:opacity-75 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100"
                type="submit"
                name="_action"
                value="modify"
                disabled={
                  navigation.state !== 'idle' &&
                  navigation.formData?.get('profile_id') === profile?.cuid
                }
              >
                {(navigation.state === 'submitting' ||
                  navigation.state === 'loading') &&
                navigation.formData?.get('_action') === 'modify' &&
                navigation.formData?.get('profile_id') === profile?.cuid
                  ? 'Loading...'
                  : 'Modify'}
              </button>
            </Form>
            <button
              className="mt-4 rounded-full bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-400 disabled:opacity-75 dark:bg-green-200 dark:text-gray-800 dark:hover:bg-green-100"
              type="button"
              disabled={
                navigation.state !== 'idle' &&
                navigation.formData?.get('profile_id') === profile?.cuid
              }
              onClick={() => setDeleteModal(true)}
            >
              {(navigation.state === 'submitting' ||
                navigation.state === 'loading') &&
              navigation.formData?.get('_action') === 'delete' &&
              navigation.formData?.get('profile_id') === profile?.cuid
                ? 'Deleting...'
                : 'Delete'}
            </button>
          </div>
        </div>
      </div>
      {deleteModal ? (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
            <div className="relative mx-auto my-6 w-auto max-w-xs md:max-w-md">
              <div className="relative flex w-full flex-col rounded-lg border-0 bg-white text-black shadow-lg outline-none focus:outline-none dark:bg-gray-900 dark:text-gray-50">
                <div className="relative flex-auto p-6">
                  <p className="my-4 text-lg leading-relaxed">
                    Are you sure you want to delete this profile?
                  </p>
                </div>
                <div className="flex items-center justify-center rounded-b border-t border-solid border-slate-200 p-6 dark:border-gray-700">
                  <Form method="post" onSubmit={() => setDeleteModal(false)}>
                    <input
                      type="hidden"
                      name="profile_id"
                      defaultValue={profile?.cuid}
                    />
                    <button
                      className="mt-4 rounded-full bg-red-500 px-4 py-2 font-bold text-white hover:scale-110 hover:bg-red-400 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100"
                      type="submit"
                      name="_action"
                      value="delete"
                    >
                      Confirm Delete
                    </button>
                  </Form>
                  <div className="flex-none pl-4 md:pl-8">
                    <button
                      className="mt-4 rounded-full bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-400 dark:bg-green-200 dark:text-gray-800 dark:hover:bg-green-100"
                      type="button"
                      onClick={() => setDeleteModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="fixed inset-0 z-40 bg-black opacity-75"></div>
        </>
      ) : null}
    </>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  return HandleError(error)
}
