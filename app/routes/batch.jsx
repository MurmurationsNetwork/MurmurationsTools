import { useEffect, useRef, useState } from 'react'
import { json, redirect } from '@remix-run/node'
import {
  Form,
  Link,
  useActionData,
  useCatch,
  useLoaderData,
  useSearchParams,
  useTransition
} from '@remix-run/react'

import { userCookie } from '~/utils/cookie'
import parseRef from '~/utils/parseRef'
import { getUser, requireUserEmail, retrieveUser } from '~/utils/session.server'
import { loadSchema } from '~/utils/schema'
import { Toaster } from 'react-hot-toast'
import {
  deleteBatch,
  editBatch,
  getBatches,
  importBatch,
  validateBatch
} from '~/utils/batch.server'
import { fetchGet } from '~/utils/fetcher'

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
    fileName,
    userEmail,
    user,
    batches,
    res,
    batchId,
    schemasString
  switch (_action) {
    case 'select':
      return await parseRef(data?.schema)
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
      userEmail = await requireUserEmail(request, '/')
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
        success: true,
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
      title = formData.get('title')
      batchId = formData.get('batch_id')
      userEmail = await requireUserEmail(request, '/')
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
        success: true,
        batches: batches?.data
      })
    case 'delete':
      // get user id
      userEmail = await requireUserEmail(request, '/')
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
        success: true,
        batches: batches?.data
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
  if (
    loginSession === -1 ||
    cookieHeader.substring(loginSession, 22) === 'murmurations_session=;'
  ) {
    return json({
      schemas: schemas,
      user: userWithProfile
    })
  }
  const user = await retrieveUser(request)
  if (!cookie || cookie === '{}' || user?.email_hash !== cookie?.email_hash) {
    return redirect('/', {
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
  const transition = useTransition()

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
  let [isSuccess, setIsSuccess] = useState(false)
  let [batches, setBatches] = useState(loaderData.batches || [])
  let [errors, setErrors] = useState([])
  const [submitType, setSubmitType] = useState('')

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
    if (data?.success) {
      setErrors([])
      setSchema('')
      setBatchTitle('')
      setBatchId('')
    }
    if (data?.batches) {
      setBatches(data.batches)
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
    }
  }, [data])

  return (
    <div>
      <div className="flex flex-row justify-between items-center bg-gray-50 dark:bg-gray-800 py-1 px-2 md:py-2 md:px-4 h-12 md:h-20 mb-2 md:mb-4">
        <h1 className="text-xl md:hidden">Batch Import</h1>
        <h1 className="hidden md:contents md:text-3xl">
          Murmurations Batch Import
        </h1>
        {user ? (
          <div>
            <form action="/logout" method="post">
              <button
                type="submit"
                className="inline-block rounded-full bg-red-500 dark:bg-purple-200 hover:bg-red-400 dark:hover:bg-purple-100 text-white dark:text-gray-800 font-bold py-0 px-4 hover:scale-110 mx-0 my-2 md:my-8 h-6 md:h-8"
              >
                Logout
              </button>
            </form>
          </div>
        ) : (
          <div>
            <Link
              to="/login"
              className="inline-block rounded-full bg-red-500 dark:bg-purple-200 hover:bg-red-400 dark:hover:bg-purple-100 text-white dark:text-gray-800 font-bold py-0 px-4 hover:scale-110 mx-0 my-2 md:my-8 h-6 md:h-8"
            >
              Login
            </Link>
          </div>
        )}
      </div>
      <div className="flex flex-col md:flex-row box-border">
        <div className="basis-full md:basis-1/2 inset-0 md:overflow-y-scroll md:h-screen md:sticky md:top-0">
          <div className="px-2 md:px-4">
            {user || schema ? null : (
              <div>
                <p>
                  Login first if you want to upload your batch profile here.
                </p>
                <p className="mt-2 md:mt-4">
                  Only support cvs with comma separator now.
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
                    <BatchItem batch={batch} key={batch?.batch_id} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="basis-full md:basis-1/2 mx-2 py-4 px-2 md:px-4">
          <Form className="mb-2" method="post">
            <select
              className="bg-white dark:bg-gray-700 block w-full md:w-96 border-gray-400 border-2 py-2 px-4"
              id="schema"
              name="schema"
              multiple={true}
              required={true}
              size={6}
              defaultValue={defaultSchema}
            >
              {schemas.map(schema => (
                <option
                  className="text-sm mb-1 border-gray-50 py-0 px-2"
                  value={schema.name}
                  key={schema.name}
                >
                  {schema.name}
                </option>
              ))}
            </select>
            <button
              className="rounded-full bg-red-500 dark:bg-purple-200 hover:bg-red-400 dark:hover:bg-purple-100 text-white dark:text-gray-800 font-bold py-2 px-4 mt-4 hover:scale-110"
              type="submit"
              name="_action"
              value="select"
            >
              Select
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
                <div className="font-bold mt-4">
                  Batch Title
                  <span className="text-red-500 dark:text-red-400">*</span>:
                </div>
                <input
                  className="form-input w-full dark:bg-gray-700 mt-2"
                  type="text"
                  name="title"
                  defaultValue={batchTitle}
                  key={batchTitle}
                  required="required"
                  placeholder="Enter a memorable title"
                />
              </label>
              <div className="mt-8">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Upload your batch profile here
                </label>
                <input type="file" name="file" required="required" />
              </div>
              {batchTitle ? (
                <button
                  className="bg-red-500 dark:bg-purple-200 hover:bg-red-400 dark:hover:bg-purple-100 text-white dark:text-gray-800 font-bold py-2 px-4 w-full mt-4"
                  type="submit"
                  name="_action"
                  value="edit"
                  onClick={() => setSubmitType('edit')}
                >
                  {transition.state === 'submitting' && submitType === 'edit'
                    ? 'Processing...'
                    : transition.state === 'loading' && submitType === 'edit'
                    ? 'Done!'
                    : 'Edit'}
                </button>
              ) : (
                <button
                  className="bg-red-500 dark:bg-purple-200 hover:bg-red-400 dark:hover:bg-purple-100 text-white dark:text-gray-800 font-bold py-2 px-4 w-full mt-4"
                  type="submit"
                  name="_action"
                  value="import"
                  onClick={() => setSubmitType('import')}
                >
                  {transition.state === 'submitting' && submitType === 'import'
                    ? 'Processing...'
                    : transition.state === 'loading' && submitType === 'import'
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

function BatchItem({ batch }) {
  const [deleteModal, setDeleteModal] = useState(false)
  const transition = useTransition()

  return (
    <>
      <div className="w-full md:w-96 rounded-lg overflow-hidden bg-gray-50 dark:bg-purple-800 my-2 md:my-4">
        <div className="px-6 py-4">
          <div className="text-lg mb-2">
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
                className="rounded-full bg-red-500 dark:bg-purple-200 hover:bg-red-400 dark:hover:bg-purple-100 text-white dark:text-gray-800 hover:scale-110 font-bold py-2 px-4 mt-4"
                type="submit"
                name="_action"
                value="modify"
              >
                Modify
              </button>
            </Form>
            <div className="flex-none pl-16 md:pl-32">
              <button
                className="rounded-full bg-yellow-500 dark:bg-green-200 hover:bg-yellow-400 dark:hover:bg-green-100 text-white dark:text-gray-800 font-bold py-2 px-4 mt-4"
                type="button"
                onClick={() => setDeleteModal(true)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      {deleteModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-xs md:max-w-md">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white dark:bg-gray-900 text-black dark:text-gray-50 outline-none focus:outline-none">
                <div className="relative p-6 flex-auto">
                  <p className="my-4 text-lg leading-relaxed">
                    Are you sure you want to delete this batch?
                  </p>
                </div>
                <div className="flex items-center justify-center p-6 border-t border-solid border-slate-200 dark:border-gray-700 rounded-b">
                  <Form method="post">
                    <input
                      type="hidden"
                      name="batch_id"
                      defaultValue={batch?.batch_id}
                    />
                    <button
                      className="rounded-full bg-red-500 dark:bg-purple-200 hover:bg-red-400 dark:hover:bg-purple-100 text-white dark:text-gray-800 hover:scale-110 font-bold py-2 px-4 mt-4"
                      type="submit"
                      name="_action"
                      value="delete"
                    >
                      {transition.state === 'submitting'
                        ? 'Processing...'
                        : transition.state === 'loading'
                        ? 'Deleted!'
                        : 'Confirm Delete'}
                    </button>
                  </Form>
                  <div className="flex-none pl-4 md:pl-8">
                    <button
                      className="rounded-full bg-yellow-500 dark:bg-green-200 hover:bg-yellow-400 dark:hover:bg-green-100 text-white dark:text-gray-800 font-bold py-2 px-4 mt-4"
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
          <div className="opacity-75 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  console.error(caught)
  return (
    <div className="container mx-auto px-4 h-screen flex items-center flex-col">
      <span className="text-5xl mb-8">💥🤬</span>
      <h1 className="text-xl font-bold mb-8">An error has occurred</h1>
      <h2 className="text-lg mb-4">
        {caught.status} - {caught.statusText}
      </h2>
      <code className="text-md">{caught.data}</code>
    </div>
  )
}
