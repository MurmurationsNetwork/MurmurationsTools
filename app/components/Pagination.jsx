import { Link } from '@remix-run/react'

export default function Pagination({ links, meta, searchParams }) {
  // Get current link
  let url = links.self
  // Get current page
  let currentPage = searchParams.page ? parseInt(searchParams.page) : 1
  // Get total pages
  const pageSize = searchParams.page_size
    ? parseInt(searchParams.page_size)
    : 30
  const maxPageSize = Math.floor(10000 / pageSize)
  let totalPages =
    meta.total_pages < maxPageSize ? meta.total_pages : maxPageSize

  // Process URL
  let schema = searchParams.schema === 'all' ? 'schema=all&' : ''
  if (searchParams.schema === 'all' && !url.includes('schema=all')) {
    url = schema + url.substring(url.indexOf('?') + 1)
  } else {
    url = url.substring(url.indexOf('?') + 1)
  }

  const createPageLink = page => {
    const pageRegex = /page=\d+/
    return url.replace(pageRegex, `page=${page}`)
  }

  // Determine the pages to display
  let pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      i === currentPage ||
      i === currentPage - 1 ||
      i === currentPage + 1
    ) {
      pages.push(i)
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push('...')
    }
  }

  return (
    <nav>
      <ul className="inline-flex -space-x-px">
        {currentPage > 1 && (
          <li>
            <Link
              to={`/index-explorer?${createPageLink(currentPage - 1)}`}
              className="ml-0 rounded-l-lg border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              Previous
            </Link>
          </li>
        )}
        {pages.map((page, index) => (
          <li key={index}>
            {page === '...' ? (
              <span className="border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                ...
              </span>
            ) : (
              <Link
                to={`/index-explorer?${createPageLink(page)}`}
                className={`border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${
                  page === currentPage
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-500'
                }`}
              >
                {page}
              </Link>
            )}
          </li>
        ))}
        {currentPage < totalPages && (
          <li>
            <Link
              to={`/index-explorer?${createPageLink(currentPage + 1)}`}
              className="rounded-r-lg border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              Next
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
