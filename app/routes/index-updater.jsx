import {
  Form,
  useActionData,
  useRouteError,
  useNavigation
} from '@remix-run/react'
import { json } from '@remix-run/node'
import crypto from 'crypto'

import { deleteNode, getNodeStatus, postNode } from '~/utils/index-api'
import HandleError from '~/components/HandleError'

export async function action({ request }) {
  let formData = await request.formData()
  let rawData = {}
  for (let key of formData.keys()) {
    rawData[key] = formData.getAll(key)
    rawData[key].length === 1 && (rawData[key] = rawData[key][0])
  }
  let { _action, ...data } = rawData
  let nodeId = crypto
    .createHash('sha256')
    .update(data.profile_url)
    .digest('hex')
  switch (_action) {
    case 'post':
      let postResponse = await postNode(data.profile_url)
      if (postResponse.errors) {
        return json({
          postErrors: postResponse.errors
        })
      }
      if (postResponse.data) {
        return json({
          postResponse: postResponse.data
        })
      }
      return json({
        postErrors:
          'There was an error when attempting to post the profile. Please check your network connection and try again.'
      })
    case 'check':
      let checkResponse = await getNodeStatus(nodeId)
      if (checkResponse.errors) {
        return json({
          checkErrors: checkResponse.errors
        })
      }
      if (checkResponse.data) {
        return json({
          checkResponse: checkResponse.data
        })
      }
      return json({
        checkErrors:
          "There was an error when attempting to get the profile's status. Please check your network connection and try again."
      })
    case 'delete':
      let deleteResponse = await deleteNode(nodeId)
      if (deleteResponse.errors) {
        return json({
          deleteErrors: deleteResponse.errors
        })
      }
      if (deleteResponse.meta) {
        return json({
          deleteResponse: deleteResponse.meta
        })
      }
      return json({
        deleteErrors:
          'There was an error when attempting to delete the profile. Please check your network connection and try again.'
      })
    default:
      return null
  }
}

export default function Tools() {
  let navigation = useNavigation()
  let data = useActionData()
  return (
    <div>
      <div className="mb-2 flex h-12 flex-row items-center justify-between bg-gray-50 px-2 py-1 md:mb-4 md:h-20 md:px-4 md:py-2 dark:bg-gray-800">
        <h1 className="text-xl md:contents md:text-3xl">Index Updater</h1>
      </div>
      <div className="mx-1 md:mx-4">
        <Form method="post">
          <label>
            <h2 className="mb-2 text-lg font-bold md:mb-4 md:text-2xl">
              Add/Update Profile in Index
            </h2>
            <p className="mb-2 text-sm md:mb-4">
              Post your profile to your website then add your profile, and
              always update the Index every time you change it to enable data
              aggregators to learn about your recent changes.
            </p>
            <input
              className="form-input w-full md:mr-2 md:w-1/2 dark:bg-gray-700"
              type="text"
              name="profile_url"
              required="required"
              placeholder="https://your.site/directory/profile.json"
            />
          </label>
          <button
            className="mt-2 w-full bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-400 disabled:opacity-75 md:mt-0 md:w-1/3 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100"
            type="submit"
            name="_action"
            value="post"
            disabled={
              navigation.state !== 'idle' &&
              navigation.formData?.get('_action') === 'post'
            }
          >
            {navigation.state === 'submitting' &&
            navigation.formData?.get('_action') === 'post'
              ? 'Posting...'
              : 'Post Profile'}
          </button>
        </Form>
        <div className="flex flex-auto">
          {data?.postResponse ? (
            <div className="my-2 overflow-auto rounded-xl bg-green-100 p-2 text-sm md:my-4 md:p-4 dark:bg-green-700">
              <pre>{JSON.stringify(data.postResponse, null, 2)}</pre>
            </div>
          ) : null}
          {data?.postErrors ? (
            <div className="my-2 overflow-auto rounded-xl bg-red-200 p-2 text-sm md:my-4 md:p-4 dark:bg-red-700">
              <pre>{JSON.stringify(data.postErrors, null, 2)}</pre>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mx-1 mt-4 md:mx-4 md:mt-8">
        <Form method="post">
          <label>
            <h2 className="mb-2 text-lg font-bold md:mb-4 md:text-2xl">
              Check Profile Status in Index
            </h2>
            <p className="mb-2 text-sm md:mb-4">
              Get status and other information about your profile from the
              Index.
            </p>
            <input
              className="form-input w-full md:mr-2 md:w-1/2 dark:bg-gray-700"
              type="text"
              name="profile_url"
              required="required"
              placeholder="https://your.site/directory/profile.json"
            />
          </label>
          <button
            className="mt-2 w-full bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-400 disabled:opacity-75 md:mt-0 md:w-1/3 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100"
            type="submit"
            name="_action"
            value="check"
            disabled={
              navigation.state !== 'idle' &&
              navigation.formData?.get('_action') === 'check'
            }
          >
            {navigation.state === 'submitting' &&
            navigation.formData?.get('_action') === 'check'
              ? 'Checking...'
              : 'Check Status'}
          </button>
        </Form>
        <div className="flex flex-auto">
          {data?.checkResponse ? (
            <div className="my-2 overflow-auto rounded-xl bg-green-100 p-2 text-sm md:my-4 md:p-4 dark:bg-green-700">
              <pre>{JSON.stringify(data.checkResponse, null, 2)}</pre>
            </div>
          ) : null}
          {data?.checkErrors ? (
            <div className="my-2 overflow-auto rounded-xl bg-red-200 p-2 text-sm md:my-4 md:p-4 dark:bg-red-700">
              <pre>{JSON.stringify(data.checkErrors, null, 2)}</pre>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mx-1 mt-4 md:mx-4 md:mt-8">
        <Form method="post">
          <label>
            <h2 className="mb-2 text-lg font-bold md:mb-4 md:text-2xl">
              Delete Profile from Index
            </h2>
            <p className="mb-2 text-sm md:mb-4">
              Remove your profile from your website first (it should return a{' '}
              <code>404 Not Found</code> status code) and then submit it here to
              delete it from the Index.
            </p>
            <input
              className="form-input w-full md:mr-2 md:w-1/2 dark:bg-gray-700"
              type="text"
              name="profile_url"
              required="required"
              placeholder="https://your.site/directory/profile.json"
            />
          </label>
          <button
            className="mt-2 w-full bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-400 disabled:opacity-75 md:mt-0 md:w-1/3 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100"
            type="submit"
            name="_action"
            value="delete"
            disabled={
              navigation.state !== 'idle' &&
              navigation.formData?.get('_action') === 'delete'
            }
          >
            {navigation.state === 'submitting' &&
            navigation.formData?.get('_action') === 'delete'
              ? 'Deleting...'
              : 'Delete Profile'}
          </button>
        </Form>
        <div className="flex flex-auto">
          {data?.deleteResponse ? (
            <div className="my-2 overflow-auto rounded-xl bg-green-100 p-2 text-sm md:my-4 md:p-4 dark:bg-green-700">
              <pre>{JSON.stringify(data.deleteResponse, null, 2)}</pre>
            </div>
          ) : null}
          {data?.deleteErrors ? (
            <div className="my-2 overflow-auto rounded-xl bg-red-200 p-2 text-sm md:my-4 md:p-4 dark:bg-red-700">
              <pre>{JSON.stringify(data.deleteErrors, null, 2)}</pre>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  return HandleError(error)
}
