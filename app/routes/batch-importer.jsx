import { useEffect, useState } from 'react'
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
import parseRefServer from '~/utils/parseRef.server'
import { getUser, requireUserEmail, retrieveUser } from '~/utils/session.server'
import { loadSchema } from '~/utils/schema'
import { toast, Toaster } from 'react-hot-toast'
import {
  deleteBatch,
  editBatch,
  getBatches,
  importBatch,
  validateBatch
} from '~/utils/batch.server'
import HandleError from '~/components/HandleError'

export async function action({ request }) {
  let formData = await request.formData()
  let rawData = {}
  for (let key of formData.keys()) {
    rawData[key] = formData.getAll(key)
    rawData[key].length === 1 && (rawData[key] = rawData[key][0])
  }
  let { _action, ...data } = rawData
  let response,
    schemas,
    file,
    title,
    userEmail,
    user,
    batches,
    res,
    batchId,
    schemasString
  switch (_action) {
    case 'select':
      return await parseRefServer(data?.schema)
    case 'import':
      schemas = formData.get('schemas')
      file = formData.get('file')
      title = formData.get('title')
      // validate batch
      response = await validateBatch(file, schemas)
      if (response.status !== 200) {
        res = await response.json()
        return json({
          errors: res?.errors
        })
      }
      // get user id
      userEmail = await requireUserEmail(request, '/batch')
      user = await getUser(userEmail)
      response = await importBatch(file, schemas, title, user?.cuid)
      if (response.status !== 200) {
        res = await response.json()
        return json({
          errors: res?.errors
        })
      }
      // get batch ids
      batches = await getBatches(user?.cuid)
      return json({
        batches: batches?.data
      })
    case 'modify':
      title = formData.get('title')
      batchId = formData.get('batch_id')
      schemasString = formData.get('schemas')
      schemas = schemasString.split(',')
      return json({
        schemas: schemas,
        batchTitle: title,
        batchId: batchId
      })
    case 'edit':
      file = formData.get('file')
      schemas = formData.get('schemas')
      title = formData.get('title')
      batchId = formData.get('batch_id')
      // validate batch
      response = await validateBatch(file, schemas)
      if (response.status !== 200) {
        res = await response.json()
        return json({
          errors: res?.errors
        })
      }
      userEmail = await requireUserEmail(request, '/batch')
      user = await getUser(userEmail)
      response = await editBatch(file, title, user?.cuid, batchId)
      if (response.status !== 200) {
        res = await response.json()
        return json({
          errors: res?.errors
        })
      }
      batches = await getBatches(user?.cuid)
      return json({
        batches: batches?.data,
        requestAction: 'edit'
      })
    case 'delete':
      // get user id
      userEmail = await requireUserEmail(request, '/batch')
      user = await getUser(userEmail)
      batchId = formData.get('batch_id')
      response = await deleteBatch(batchId, user?.cuid)
      if (response.status !== 200) {
        res = await response.json()
        return json({
          errors: res?.errors
        })
      }
      batches = await getBatches(user?.cuid)
      return json({
        batches: batches?.data,
        requestAction: 'delete'
      })
  }
}

export async function loader(request) {
  const schemas = await loadSchema()
  const cookieHeader = request.request.headers.get('Cookie')
  let cookie = await userCookie.parse(cookieHeader)
  let loginSession = cookieHeader
    ? cookieHeader.indexOf('murmurations_session=')
    : -1
  let userWithProfile
  // If user is not login or logout, return empty user
  if (loginSession === -1 || cookieHeader.includes('murmurations_session=;')) {
    return json({
      schemas: schemas,
      user: userWithProfile
    })
  }
  const user = await retrieveUser(request)
  if (!cookie || cookie === '{}' || user?.email_hash !== cookie?.email_hash) {
    return redirect('/batch', {
      headers: {
        'Set-Cookie': await userCookie.serialize(user)
      }
    })
  }
  const batches = await getBatches(user.cuid)
  return json({
    schemas: schemas,
    user: user,
    batches: batches?.data
  })
}

export default function Batch() {
  const navigation = useNavigation()

  const [searchParams] = useSearchParams()
  const defaultSchema = searchParams.get('schema')
    ? searchParams.get('schema').split(',')
    : undefined

  let loaderData = useLoaderData()
  let schemas = loaderData.schemas
  let user = loaderData.user

  let data = useActionData()
  let [schema, setSchema] = useState('')
  let [batchTitle, setBatchTitle] = useState('')
  let [batchId, setBatchId] = useState('')
  let [batches, setBatches] = useState(loaderData.batches || [])
  let [errors, setErrors] = useState([])

  useEffect(() => {
    if (data?.$schema) {
      setSchema(data?.metadata?.schema)
      setBatchTitle('')
      setBatchId('')
    }
    if (data?.schemas) {
      setSchema(data.schemas)
      setBatchTitle('')
      setBatchId('')
    }
    if (data?.batchTitle) {
      setBatchTitle(data.batchTitle)
    }
    if (data?.batchId) {
      setBatchId(data.batchId)
    }
    if (data?.batches) {
      setBatches(data.batches)
      setSchema('')
      setBatchTitle('')
      setBatchId('')
      setErrors([])
      if (data.requestAction === 'delete') {
        toast.success('Batch deleted successfully')
      } else if (data.requestAction === 'edit') {
        toast.success('Batch modified successfully')
      } else {
        toast.success('Batch imported successfully')
      }
    }
    if (data?.errors) {
      // errors needs to be string array
      let errs = []
      for (let key in data.errors) {
        let obj = data.errors[key]
        let str = 'Title: ' + obj?.title + ',Detail: ' + obj?.detail
        errs.push(str)
      }
      setErrors(errs)
      toast.error('Batch import failed')
    }
  }, [data])

  return (
    <div>
      <div className="mb-2 flex h-12 flex-row items-center justify-between bg-gray-50 px-2 py-1 dark:bg-gray-800 md:mb-4 md:h-20 md:px-4 md:py-2">
        <h1 className="text-xl md:hidden">Batch Import</h1>
        <h1 className="hidden md:contents md:text-3xl">Batch Importer</h1>
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
            {user || schema ? null : (
              <div>
                <p>Login first to upload a batch of profiles.</p>
                <p className="mt-2 md:mt-4">
                  Only CSV files with comma separators are supported.{' '}
                  <a
                    className="text-red-500 dark:text-purple-200"
                    target="_blank"
                    rel="noreferrer"
                    href="https://docs.murmurations.network/guides/import-networks.html#spreadsheet"
                    onClick={e =>
                      window.goatcounter.count({
                        path: p => p + '?docs',
                        title: 'Batch docs',
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
              {errors[0] ? (
                <div className="mb-4 p-2">
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
              {batches.length > 0 ? (
                <div className="md:mt-4">
                  <h1 className="hidden md:contents md:text-2xl">My Batches</h1>
                  {batches.map(batch => (
                    <BatchItem
                      batch={batch}
                      navigation={navigation}
                      key={batch?.batch_id}
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
          {schema ? (
            <Form method="post" encType="multipart/form-data">
              <h3 className="mt-8">
                Schemas selected:{' '}
                <ol>
                  {schema.map((schemaName, index) => (
                    <li key={index}>
                      <code>{schemaName}</code>
                    </li>
                  ))}
                </ol>
              </h3>
              <input type="hidden" name="schemas" defaultValue={schema} />
              {batchId ? (
                <input type="hidden" name="batch_id" defaultValue={batchId} />
              ) : null}
              <label>
                <div className="mt-4 font-bold">
                  Batch Title
                  <span className="text-red-500 dark:text-red-400">*</span>:
                </div>
                <input
                  className="form-input mt-2 w-full dark:bg-gray-700 focus:dark:bg-gray-500"
                  type="text"
                  name="title"
                  defaultValue={batchTitle}
                  key={batchTitle}
                  required="required"
                  placeholder="Enter a memorable title"
                />
              </label>
              <div className="mt-8">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Upload your batch profile here
                </label>
                <input type="file" name="file" required="required" />
              </div>
              {batchTitle ? (
                <button
                  className="mt-4 w-full bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-400 disabled:opacity-75 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100"
                  type="submit"
                  name="_action"
                  value="edit"
                  disabled={navigation.state !== 'idle'}
                >
                  {navigation.state === 'submitting' &&
                  navigation.formData?.get('_action') === 'edit'
                    ? 'Processing...'
                    : navigation.state === 'loading' &&
                      navigation.formData?.get('_action') === 'edit'
                    ? 'Done!'
                    : 'Modify'}
                </button>
              ) : (
                <button
                  className="mt-4 w-full bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-400 disabled:opacity-75 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100"
                  type="submit"
                  name="_action"
                  value="import"
                  disabled={navigation.state !== 'idle'}
                >
                  {navigation.state === 'submitting' &&
                  navigation.formData?.get('_action') === 'import'
                    ? 'Processing...'
                    : navigation.state === 'loading' &&
                      navigation.formData?.get('_action') === 'import'
                    ? 'Done!'
                    : 'Import'}
                </button>
              )}
            </Form>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function BatchItem({ batch, navigation }) {
  const [deleteModal, setDeleteModal] = useState(false)

  return (
    <>
      <div className="my-2 w-full overflow-hidden rounded-lg bg-gray-50 dark:bg-purple-800 md:my-4 md:w-96">
        <div className="px-6 py-4">
          <div className="mb-2 text-lg">
            Title: {batch?.title}
            <br />
            Batch ID: {batch?.batch_id}
            <br />
            Schemas: {batch?.schemas?.toString()}
          </div>
          <div className="flex flex-row">
            <Form method="post" className="flex-none">
              <input type="hidden" name="title" defaultValue={batch?.title} />
              <input
                type="hidden"
                name="batch_id"
                defaultValue={batch?.batch_id}
              />
              <input
                type="hidden"
                name="schemas"
                defaultValue={batch?.schemas}
              />
              <button
                className="mt-4 rounded-full bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-400 enabled:hover:scale-110 disabled:opacity-75 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100"
                type="submit"
                name="_action"
                value="modify"
                disabled={
                  navigation.state !== 'idle' &&
                  navigation.formData?.get('batch_id') === batch?.batch_id
                }
              >
                {(navigation.state === 'submitting' ||
                  navigation.state === 'loading') &&
                navigation.formData?.get('_action') === 'modify' &&
                navigation.formData?.get('batch_id') === batch?.batch_id
                  ? 'Loading...'
                  : 'Modify'}
              </button>
            </Form>
            <div className="flex-none pl-16 md:pl-32">
              <button
                className="mt-4 rounded-full bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-400 enabled:hover:scale-110 disabled:opacity-75 dark:bg-green-200 dark:text-gray-800 dark:hover:bg-green-100"
                type="button"
                disabled={
                  navigation.state !== 'idle' &&
                  navigation.formData?.get('batch_id') === batch?.batch_id
                }
                onClick={() => setDeleteModal(true)}
              >
                {(navigation.state === 'submitting' ||
                  navigation.state === 'loading') &&
                navigation.formData?.get('_action') === 'delete' &&
                navigation.formData?.get('batch_id') === batch?.batch_id
                  ? 'Deleting...'
                  : 'Delete'}
              </button>
            </div>
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
                    Are you sure you want to delete this batch?
                  </p>
                </div>
                <div className="flex items-center justify-center rounded-b border-t border-solid border-slate-200 p-6 dark:border-gray-700">
                  <Form method="post" onSubmit={() => setDeleteModal(false)}>
                    <input
                      type="hidden"
                      name="batch_id"
                      defaultValue={batch?.batch_id}
                    />
                    <button
                      className="mt-4 rounded-full bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-400 enabled:hover:scale-110 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100"
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
