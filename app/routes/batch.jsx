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
import {
  getUserId,
  requireUserEmail,
  retrieveUser
} from '~/utils/session.server'
import { loadSchema } from '~/utils/schema'
import { Toaster } from 'react-hot-toast'
import { importBatch, validateBatch } from '~/utils/batch.server'

export async function action({ request }) {
  let formData = await request.formData()
  let rawData = {}
  for (let key of formData.keys()) {
    rawData[key] = formData.getAll(key)
    rawData[key].length === 1 && (rawData[key] = rawData[key][0])
  }
  let { _action, ...data } = rawData
  let response, schemas, file, title, fileName, userEmail, userId
  switch (_action) {
    case 'select':
      return await parseRef(data?.schema)
    case 'validate':
      schemas = formData.get('schemas')
      file = formData.get('file')
      response = await validateBatch(file, schemas)
      if (response.status !== 200) {
        const res = await response.json()
        return json({
          errors: res?.errors
        })
      }
      return json({
        schemas: schemas,
        fileName: file?._name
      })
    case 'upload':
      schemas = formData.get('schemas')
      file = formData.get('file')
      title = formData.get('title')
      fileName = formData.get('fileName')
      if (file?._name !== fileName) {
        return json({
          importErrors: [
            {
              title: 'File name does not match',
              detail: 'Please upload the file you just validated'
            }
          ]
        })
      }
      // get user id
      userEmail = await requireUserEmail(request, '/')
      userId = await getUserId(userEmail)
      response = await importBatch(file, schemas, title, userId?.cuid)
      const res = await response.json()
      if (response.status !== 200) {
        return json({
          importErrors: res?.errors
        })
      }
      return json({
        batchId: res?.meta?.batch_id
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
  return json({
    schemas: schemas,
    user: user
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
  let [fileName, setFileName] = useState('')
  let [batchId, setBatchId] = useState('')
  let [errors, setErrors] = useState([])
  let [importErrors, setImportErrors] = useState([])
  const [submitType, setSubmitType] = useState('')

  useEffect(() => {
    if (data?.$schema) {
      setSchema(data)
    }
    if (data?.fileName) {
      setFileName(data.fileName)
      setErrors([])
      setImportErrors([])
    }
    if (data?.batchId) {
      setBatchId(data.batchId)
      setFileName('')
      setErrors([])
      setImportErrors([])
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
      setFileName('')
    }
    if (data?.importErrors) {
      let importErrs = []
      for (let key in data.importErrors) {
        let obj = data.importErrors[key]
        let str = 'Title: ' + obj?.title + ',Detail: ' + obj?.detail
        importErrs.push(str)
      }
      setImportErrors(importErrs)
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
              ) : fileName ? (
                <>
                  <p className="md:text-xl mb-2 md:mb-4">
                    Your csv file has been validated successfully. Name your
                    batch and click "Import to Data Proxy" to import your batch
                    to Data Proxy.
                  </p>
                  {importErrors[0] ? (
                    <div className="mb-4 p-2">
                      <p className="text-xl text-red-500 dark:text-red-400">
                        There were errors in your submission:
                      </p>
                      <ul className="list-disc px-4">
                        {importErrors.map(error => (
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
                  {user && (
                    <Form method="post" encType="multipart/form-data">
                      <input
                        type="hidden"
                        name="schemas"
                        defaultValue={schema?.metadata?.schema}
                      />
                      <input type="hidden" name="fileName" value={fileName} />
                      <label>
                        <div className="font-bold mt-4">
                          Batch Title
                          <span className="text-red-500 dark:text-red-400">
                            *
                          </span>
                          :
                        </div>
                        <input
                          className="form-input w-full dark:bg-gray-700 mt-2"
                          type="text"
                          name="title"
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
                      <button
                        className="bg-red-500 dark:bg-purple-200 hover:bg-red-400 dark:hover:bg-purple-100 text-white dark:text-gray-800 font-bold py-2 px-4 w-full mt-4"
                        type="submit"
                        name="_action"
                        value="upload"
                        onClick={() => setSubmitType('upload')}
                      >
                        {transition.state === 'submitting' &&
                        submitType === 'upload'
                          ? 'Saving...'
                          : transition.state === 'loading' &&
                            submitType === 'upload'
                          ? 'Uploaded!'
                          : 'Import to Data Proxy'}
                      </button>
                    </Form>
                  )}
                </>
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
                  {schema.metadata.schema.map((schemaName, index) => (
                    <li key={index}>
                      <code>{schemaName}</code>
                    </li>
                  ))}
                </ol>
              </h3>
              <input
                type="hidden"
                name="schemas"
                defaultValue={schema?.metadata?.schema}
              />
              <div className="mt-8">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Upload your batch profile here
                </label>
                <input type="file" name="file" required="required" />
              </div>
              <button
                className="bg-red-500 dark:bg-purple-200 hover:bg-red-400 dark:hover:bg-purple-100 text-white dark:text-gray-800 font-bold py-2 px-4 w-full mt-4"
                type="submit"
                name="_action"
                value="validate"
                onClick={() => setSubmitType('validate')}
              >
                {transition.state === 'submitting' && submitType === 'validate'
                  ? 'Processing...'
                  : transition.state === 'loading' && submitType === 'validate'
                  ? 'Done!'
                  : 'Validate'}
              </button>
            </Form>
          ) : null}
        </div>
      </div>
    </div>
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
