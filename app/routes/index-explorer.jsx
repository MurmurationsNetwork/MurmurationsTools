import { json, redirect } from '@remix-run/node'
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useRouteError
} from '@remix-run/react'

import { fetchGet } from '~/utils/fetcher'
import { useEffect, useState } from 'react'
import { loadSchema } from '~/utils/schema'
import { loadCountries } from '~/utils/countries'
import { timestampToDatetime } from '~/utils/datetime'
import HandleError from '~/components/HandleError'
import Pagination from '~/components/Pagination'
import { getNodes } from '~/utils/index-api'

function getSearchUrl(params, removePage) {
  let searchParams = ''
  if (params?.schema) {
    searchParams += 'schema=' + params.schema
  }
  if (params?.name) {
    searchParams += '&name=' + params.name
  }
  if (params?.tags) {
    searchParams += '&tags=' + params.tags
  }
  if (params?.primary_url) {
    searchParams += '&primary_url=' + params.primary_url
  }
  if (params?.last_updated) {
    searchParams += '&last_updated=' + params.last_updated
  }
  if (params?.lat) {
    searchParams += '&lat=' + params.lat
  }
  if (params?.lon) {
    searchParams += '&lon=' + params.lon
  }
  if (params?.range) {
    searchParams += '&range=' + params.range
  }
  if (params?.locality) {
    searchParams += '&locality=' + params.locality
  }
  if (params?.region) {
    searchParams += '&region=' + params.region
  }
  if (params?.country) {
    searchParams += '&country=' + params.country
  }
  if (params?.status) {
    searchParams += '&status=' + params.status
  }
  if (params?.page_size) {
    searchParams += '&page_size=' + params.page_size
  }
  let tags_filter = params?.tags_filter ? params.tags_filter : 'or'
  let tags_exact = params?.tags_exact ? params.tags_exact : 'false'
  searchParams += '&tags_filter=' + tags_filter + '&tags_exact=' + tags_exact
  if (params?.page && removePage === false) {
    searchParams += '&page=' + params.page
  }
  return searchParams
}

export async function action({ request }) {
  let formData = await request.formData()
  let { _action, ...values } = Object.fromEntries(formData)
  if (_action === 'search') {
    if (values?.schema === '') {
      return json({
        message: 'The schema is required',
        success: false
      })
    }
    if (values?.last_updated) {
      values.last_updated = new Date(values.last_updated).valueOf() / 1000
    }
    let searchParams = getSearchUrl(values, false)
    return redirect(`/index-explorer?${searchParams}`)
  }
  return null
}

export async function loader({ request }) {
  const schemas = await loadSchema()
  const countries = await loadCountries()

  const url = new URL(request.url)
  let params = {}
  for (let param of url.searchParams.entries()) {
    params[param[0]] = param[1]
  }

  if (Object.keys(params).length === 0) {
    return json({
      schemas: schemas,
      countries: countries
    })
  }

  if (!params?.schema) {
    return json({
      schemas: schemas,
      countries: countries,
      message: 'The schema is required',
      success: false
    })
  }

  let searchParams = getSearchUrl(params, false)
  if (params.schema === 'all') {
    searchParams = searchParams.replace('schema=all', '')
  }
  const nodes = await getNodes(searchParams)

  if (nodes.status === 400) {
    return json({
      schemas: schemas,
      countries: countries,
      params: params,
      message: nodes?.data?.errors?.[0].detail,
      success: false
    })
  }

  return json({
    schemas: schemas,
    countries: countries,
    nodes: nodes?.data,
    params: params
  })
}

export default function GetNodes() {
  const loaderData = useLoaderData()
  const actionData = useActionData()
  const navigation = useNavigation()
  let schema = loaderData?.schemas
  let countryList = loaderData?.countries
  let searchParams = loaderData?.params
  let [schemas, setSchemas] = useState(null)
  let [countries, setCountries] = useState(null)
  let [currentSchema, setCurrentSchema] = useState(
    searchParams?.schema ? searchParams.schema : ''
  )
  let [currentCountry, setCurrentCountry] = useState(
    searchParams?.country ? searchParams.country : ''
  )
  let [error, setError] = useState(null)
  useEffect(() => {
    if (schema) {
      setSchemas(schema)
    }
    if (countryList) {
      setCountries(countryList)
    }
    if (actionData?.success === false) {
      setError(actionData?.message)
    } else if (loaderData?.success === false) {
      setError(loaderData?.message)
    } else {
      setError(null)
    }
  }, [loaderData, actionData, schema, countryList])
  const nodes = loaderData?.nodes
  const meta = nodes?.meta
  const links = nodes?.links
  let [sortProp, desc] = searchParams?.sort?.split(':') ?? []
  let sortedNodes = null
  if (nodes?.data) {
    sortedNodes = [...nodes.data].sort((a, b) => {
      if (sortProp === 'last_updated') {
        return desc ? b[sortProp] - a[sortProp] : a[sortProp] - b[sortProp]
      }
      return desc
        ? b[sortProp]?.localeCompare(a[sortProp])
        : a[sortProp]?.localeCompare(b[sortProp])
    })
  }
  let pageSize = 30,
    page = 1
  if (searchParams?.page_size) {
    pageSize = searchParams.page_size
  }
  if (searchParams?.page) {
    page = searchParams.page
  }

  return (
    <div>
      <div className="mb-2 flex h-12 flex-row items-center justify-between bg-gray-50 px-2 py-1 md:mb-4 md:h-20 md:px-4 md:py-2 dark:bg-gray-800">
        <h1 className="text-xl md:contents md:text-3xl">Index Explorer</h1>
      </div>
      <div className="mx-auto max-w-6xl py-2">
        <div className="mb-4 sm:flex sm:items-center">
          <div className="text-gray-900 sm:flex-auto dark:text-gray-50">
            <p>
              For a description of the input fields below, please{' '}
              <a
                className="text-red-500 dark:text-purple-200"
                target="_blank"
                rel="noreferrer"
                href="https://docs.murmurations.network/guides/view-the-data.html#search-the-index"
                onClick={e =>
                  window.goatcounter.count({
                    path: p => p + '?docs',
                    title: 'IE docs',
                    event: true
                  })
                }
              >
                see our documentation
              </a>
              .
            </p>
          </div>
        </div>
        <Form method="post" className="mb-2">
          <div className="flex flex-row flex-wrap items-center gap-2 bg-gray-50 p-6 dark:bg-gray-600">
            <select
              className="flex-auto rounded dark:bg-gray-700"
              name="schema"
              value={currentSchema}
              onChange={e => setCurrentSchema(e.target.value)}
            >
              <option value="">Select a schema</option>
              <option value="all">All schemas</option>
              {schemas?.map(schema => (
                <option
                  className="mb-1 border-gray-50 px-2 py-0 text-sm"
                  value={schema.name}
                  key={schema.name}
                >
                  {schema.name}
                </option>
              ))}
            </select>
            <input
              className="flex-auto rounded p-2 dark:bg-gray-700"
              placeholder="name search"
              type="text"
              name="name"
              defaultValue={searchParams?.name}
            />
            <input
              className="flex-auto rounded p-2 dark:bg-gray-700"
              placeholder="tag search"
              type="text"
              name="tags"
              defaultValue={searchParams?.tags}
            />
            <input
              className="flex-auto rounded p-2 dark:bg-gray-700"
              placeholder="primary_url search"
              type="text"
              name="primary_url"
              defaultValue={searchParams?.primary_url}
            />
            <input
              className="flex-auto rounded p-2 dark:bg-gray-700"
              placeholder="last_updated search"
              type="datetime-local"
              name="last_updated"
              defaultValue={
                searchParams?.last_updated
                  ? timestampToDatetime(searchParams.last_updated)
                  : ''
              }
            />
            <input
              className="flex-auto rounded p-2 dark:bg-gray-700"
              placeholder="lat search"
              type="number"
              step="any"
              name="lat"
              defaultValue={searchParams?.lat}
            />
            <input
              className="flex-auto rounded p-2 dark:bg-gray-700"
              placeholder="lon search"
              type="number"
              step="any"
              name="lon"
              defaultValue={searchParams?.lon}
            />
            <input
              className="flex-auto rounded p-2 dark:bg-gray-700"
              placeholder="range search"
              type="text"
              name="range"
              defaultValue={searchParams?.range}
            />
            <input
              className="flex-auto rounded p-2 dark:bg-gray-700"
              placeholder="locality search"
              type="text"
              name="locality"
              defaultValue={searchParams?.locality}
            />
            <input
              className="flex-auto rounded p-2 dark:bg-gray-700"
              placeholder="region search"
              type="text"
              name="region"
              defaultValue={searchParams?.region}
            />
            <select
              className="col-span-2 flex-auto rounded dark:bg-gray-700"
              name="country"
              value={currentCountry}
              onChange={e => setCurrentCountry(e.target.value)}
            >
              <option value="">Select a Country</option>
              {countries &&
                countries.map(country => (
                  <option
                    className="mb-1 border-gray-50 px-2 py-0 text-sm"
                    value={country.name}
                    key={country.name}
                  >
                    {country.name}
                  </option>
                ))}
            </select>
            <select
              className="col-span-2 flex-auto rounded dark:bg-gray-700"
              name="status"
              defaultValue={searchParams?.status}
            >
              <option value="">Select a Status (default: all)</option>
              <option value="posted">posted</option>
              <option value="deleted">deleted</option>
            </select>
            <select
              className="col-span-2 flex-auto rounded dark:bg-gray-700"
              name="page_size"
              defaultValue={searchParams?.page_size}
            >
              <option value="">Select the Page Size (default: 30)</option>
              <option value="100">100</option>
              <option value="500">500</option>
            </select>
            <div className="flex-auto">
              <input
                type="checkbox"
                id="tags_filter"
                name="tags_filter"
                value="and"
                className="mr-2"
                defaultChecked={searchParams?.tags_filter === 'and'}
              />
              <label htmlFor="tags_filter">all tags</label>
            </div>
            <div className="flex-auto">
              <input
                type="checkbox"
                id="tags_exact"
                name="tags_exact"
                value="true"
                className="mr-2"
                defaultChecked={searchParams?.tags_exact === 'true'}
              />
              <label htmlFor="tags_exact">exact matches only</label>
            </div>
            <button
              className="w-full rounded bg-red-500 py-1 font-bold text-white hover:bg-red-400 disabled:opacity-75 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100"
              type="submit"
              name="_action"
              value="search"
              disabled={
                navigation.state !== 'idle' &&
                navigation.formData?.get('_action') === 'search'
              }
              onClick={e =>
                window.goatcounter.count({
                  path: p => p + '?search',
                  title: 'IE search',
                  event: true
                })
              }
            >
              {navigation.state === 'submitting' &&
              navigation.formData?.get('_action') === 'search'
                ? 'Searching...'
                : navigation.state === 'loading' &&
                    navigation.formData?.get('_action') === 'search'
                  ? 'Loading Data...'
                  : 'Search'}
            </button>
          </div>
        </Form>
        <div className="sm:flex sm:items-center">
          <div className="text-gray-900 sm:flex-auto dark:text-gray-50">
            <p className="text-sm">
              When searching for tags, select <em>all tags</em> so only nodes
              with all of the tags entered are shown. Select{' '}
              <em>exact matches only</em> so that spelling variations are not
              shown.
            </p>
          </div>
        </div>
        <div className="mt-2 flex flex-col md:mt-4">
          {meta?.number_of_results ? (
            <div className="mb-2 flex-auto">
              Result Count: {page > 1 ? (page - 1) * pageSize + 1 : 1}-
              {page * pageSize > meta.number_of_results
                ? meta.number_of_results
                : page * pageSize}{' '}
              / {meta.number_of_results}
            </div>
          ) : (
            ''
          )}
          <div className="-mx-4 -my-2 overflow-x-auto text-center sm:-mx-6 lg:-mx-8">
            {error ? (
              <div className="font-bold text-red-500">Error: {error}</div>
            ) : nodes?.data && Object.keys(nodes.data).length !== 0 ? (
              <div>
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-100 dark:bg-gray-500">
                        <tr>
                          <SortableColumn
                            prop="primary_url"
                            searchParams={searchParams}
                          >
                            Primary URL
                          </SortableColumn>
                          <SortableColumn
                            prop="name"
                            searchParams={searchParams}
                          >
                            Name
                          </SortableColumn>
                          <SortableColumn
                            prop="profile_url"
                            searchParams={searchParams}
                          >
                            Profile URL
                          </SortableColumn>
                          <SortableColumn
                            prop="last_updated"
                            searchParams={searchParams}
                          >
                            Last Updated
                          </SortableColumn>
                          <SortableColumn>Tags</SortableColumn>
                          {searchParams?.locality ? (
                            <SortableColumn
                              prop="locality"
                              searchParams={searchParams}
                            >
                              Locality
                            </SortableColumn>
                          ) : (
                            ''
                          )}
                          {searchParams?.region ? (
                            <SortableColumn
                              prop="region"
                              searchParams={searchParams}
                            >
                              Region
                            </SortableColumn>
                          ) : (
                            ''
                          )}
                          {searchParams?.country ? (
                            <SortableColumn
                              prop="country"
                              searchParams={searchParams}
                            >
                              Country
                            </SortableColumn>
                          ) : (
                            ''
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-gray-50 dark:bg-gray-600">
                        {sortedNodes?.map(node => (
                          <tr key={node.profile_url}>
                            <td className="whitespace-normal p-1 text-sm text-gray-900 md:p-2 dark:text-gray-50">
                              <a
                                href={`https://${node.primary_url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-yellow-600 no-underline hover:underline dark:text-green-300"
                              >
                                {node.primary_url?.length > 30
                                  ? `${node.primary_url?.substring(0, 30)}...`
                                  : node.primary_url}
                              </a>
                            </td>
                            <td className="whitespace-normal p-1 text-sm text-gray-900 md:p-2 dark:text-gray-50">
                              {node.name}
                            </td>
                            <td className="whitespace-normal p-1 text-sm text-gray-900 md:p-2 dark:text-gray-50">
                              <a
                                href={`${node.profile_url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-yellow-600 no-underline hover:underline dark:text-green-300"
                              >
                                {node.profile_url?.length > 65
                                  ? `${node.profile_url?.substring(0, 65)}...`
                                  : node.profile_url}
                              </a>
                            </td>
                            <td className="whitespace-normal p-1 text-sm text-gray-900 md:p-2 dark:text-gray-50">
                              {timestampToDatetime(node.last_updated)}
                            </td>
                            <td className="p-1 text-sm text-gray-900 md:p-2 dark:text-gray-50">
                              <div className="flex flex-wrap">
                                {node.tags?.map(tag => (
                                  <div
                                    key={tag}
                                    className="m-1 rounded-lg bg-red-200 px-1 md:px-2 md:py-1 dark:bg-purple-400"
                                  >
                                    {tag}
                                  </div>
                                ))}
                              </div>
                            </td>
                            {searchParams?.locality ? (
                              <td className="whitespace-normal p-1 text-sm text-gray-900 md:p-2 dark:text-gray-50">
                                {node.locality}
                              </td>
                            ) : (
                              ''
                            )}
                            {searchParams?.region ? (
                              <td className="whitespace-normal p-1 text-sm text-gray-900 md:p-2 dark:text-gray-50">
                                {node.region}
                              </td>
                            ) : (
                              ''
                            )}
                            {searchParams?.country ? (
                              <td className="whitespace-normal p-1 text-sm text-gray-900 md:p-2 dark:text-gray-50">
                                {node.country}
                              </td>
                            ) : (
                              ''
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="my-4 text-center">
                  <Pagination
                    links={links}
                    meta={meta}
                    searchParams={searchParams}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center">
                Result not found, try to search again!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SortableColumn({ prop, children, searchParams }) {
  let [sortProp, desc] = searchParams?.sort?.split(':') ?? []
  let newSort = null

  if (sortProp !== prop) {
    newSort = prop
  } else if (sortProp === prop && !desc) {
    newSort = `${prop}:desc`
  }

  let searchQueries = getSearchUrl(searchParams, false)
  if (newSort != null) {
    searchQueries += '&sort=' + newSort
  }

  return (
    <th scope="col" className="p-1 text-left text-sm text-gray-900 md:p-2">
      {prop ? (
        <Link
          to={`/index-explorer?${searchQueries}`}
          className="group inline-flex font-semibold"
          reloadDocument
        >
          <span className="text-gray-900 dark:text-gray-50">{children}</span>
          <span
            className={`${
              sortProp === prop
                ? 'bg-gray-200 text-gray-900 group-hover:bg-gray-300'
                : 'invisible text-gray-400 group-hover:visible'
            } ml-2 flex-none rounded`}
          >
            {desc ? '▼' : '▲'}
          </span>
        </Link>
      ) : (
        <span className="text-gray-900 dark:text-gray-50">{children}</span>
      )}
    </th>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  return HandleError(error)
}
