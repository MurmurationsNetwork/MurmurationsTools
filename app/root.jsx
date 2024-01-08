import { useEffect, useState } from 'react'
import {
  isRouteErrorResponse,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError
} from '@remix-run/react'
import { json } from '@remix-run/node'

import styles from '~/styles/app.css'

export function links() {
  return [{ rel: 'stylesheet', href: styles }]
}

export function meta() {
  return [{ title: 'Murmuration Tools' }]
}

export async function loader({ request }) {
  return json({
    url: new URL(request.url)
  })
}

export default function App() {
  const { url } = useLoaderData()
  const production = !!url?.match(/\/\/tools/)
  const [online, setOnline] = useState(true)

  useEffect(() => {
    window.addEventListener('offline', () => {
      setOnline(false)
    })
    window.addEventListener('online', () => {
      setOnline(true)
    })
  }, [])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body className="text-md bg-white leading-normal text-black dark:bg-gray-900 dark:text-gray-50 md:text-xl">
        {production ? null : (
          <div className="flex flex-row justify-center bg-fuchsia-200 px-2 py-1 dark:bg-fuchsia-700 md:px-4 md:py-2">
            T E S T &nbsp; E N V I R O N M E N T
          </div>
        )}
        {online ? null : (
          <div className="flex flex-row justify-center bg-rose-400 px-2 py-1 dark:bg-rose-700 md:px-4 md:py-2">
            O F F L I N E -- Check your network connection
          </div>
        )}
        <div className="container mx-auto max-w-full p-0">
          <div className="mb-0 flex h-8 flex-row items-center justify-between bg-gray-50 px-2 py-1 dark:bg-gray-800 md:h-12 md:px-4 md:py-2">
            <div className="hidden md:contents md:text-xl">
              Murmurations Tools
            </div>
            <div className="flex flex-row items-center justify-end">
              <Link to="/profile-generator" reloadDocument>
                <div className="text-md md:hidden">Profiles</div>
                <div className="hidden md:contents md:text-xl">
                  Profile Generator
                </div>
              </Link>
              <div className="pl-6 md:pl-16">
                <Link to="/batch-importer" reloadDocument>
                  <div className="text-md md:hidden">Batch</div>
                  <div className="hidden md:contents md:text-xl">
                    Batch Importer
                  </div>
                </Link>
              </div>
              <div className="pl-6 md:pl-16">
                <Link to="/index-explorer" reloadDocument>
                  <div className="text-md md:hidden">Explore</div>
                  <div className="hidden md:contents md:text-xl">
                    Index Explorer
                  </div>
                </Link>
              </div>
              <div className="pl-6 md:pl-16">
                <Link to="/index-updater" reloadDocument>
                  <div className="text-md md:hidden">Update</div>
                  <div className="hidden md:contents md:text-xl">
                    Index Updater
                  </div>
                </Link>
              </div>
              <div className="pl-6 md:pl-16">
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={
                    production
                      ? 'https://map.murmurations.network'
                      : 'https://test-map.murmurations.network'
                  }
                  onClick={e =>
                    window.goatcounter.count({
                      path: p => p + '?map',
                      title: 'Tools -> Map',
                      event: true
                    })
                  }
                >
                  <div className="text-base md:text-xl">Map</div>
                </a>
              </div>
            </div>
          </div>
          <Outlet />
          <ScrollRestoration />
          <script
            data-goatcounter={
              production
                ? 'https://stats-tools.murmurations.network/count'
                : 'https://test-stats-tools.murmurations.network/count'
            }
            async
            src="//stats.murmurations.network/count.js"
          ></script>
          <Scripts />
          {process.env.NODE_ENV === 'development' && <LiveReload />}
        </div>
      </body>
    </html>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  if (process.env.NODE_ENV === 'production') {
    error.stack = undefined
  }

  return (
    <html>
      <head>
        <title>Tools - Fatal Error</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body className="bg-white leading-normal text-black dark:bg-gray-900 dark:text-gray-50">
        {error.status === 404 ? (
          <div className="container mx-auto flex h-screen flex-col items-center justify-center px-4">
            <h1 className="mb-8 text-xl font-bold">Page Not Found</h1>
            <button className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700">
              <Link to="/">Return to Home</Link>
            </button>
          </div>
        ) : (
          <div className="container mx-auto flex h-screen flex-col items-center justify-center px-4">
            <span className="mb-8 text-5xl">💥😱</span>
            <h1 className="mb-8 text-xl font-bold">
              A fatal error has occurred and was logged.
            </h1>
            <code className="text-md">
              {isRouteErrorResponse(error)
                ? error.data
                : error instanceof Error
                  ? error.stack
                  : 'Unknown Error'}
            </code>
          </div>
        )}
        <Scripts />
      </body>
    </html>
  )
}
