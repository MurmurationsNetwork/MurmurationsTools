import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from '@remix-run/react'
import { json } from '@remix-run/node'

import styles from '~/styles/app.css'

export function links() {
  return [{ rel: 'stylesheet', href: styles }]
}

export function meta() {
  return { title: 'Murmuration Tools' }
}

export async function loader({ request }) {
  return json({
    url: new URL(request.url)
  })
}

export default function App() {
  const { url } = useLoaderData()
  const production = !!url?.match(/\/\/tools/)
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body className="bg-white dark:bg-gray-900 text-black dark:text-gray-50 leading-normal text-md md:text-xl">
        {production ? null : (
          <div className="flex flex-row bg-fuchsia-200 dark:bg-fuchsia-700 py-1 px-2 md:py-2 md:px-4 justify-center">
            T E S T &nbsp; E N V I R O N M E N T
          </div>
        )}
        <div className="container max-w-full mx-auto p-0">
          <div className="flex flex-row justify-between items-center bg-gray-50 dark:bg-gray-800 py-1 px-2 md:py-2 md:px-4 h-8 md:h-12 mb-0">
            <div className="hidden md:contents md:text-xl">
              Murmurations Tools
            </div>
            <div className="flex flex-row justify-end items-center">
              <Link to="/profile-generator">
                <div className="text-md md:hidden">Profiles</div>
                <div className="hidden md:contents md:text-xl">
                  Profile Generator
                </div>
              </Link>
              <div className="pl-6 md:pl-16">
                <Link to="/batch-importer">
                  <div className="text-md md:hidden">Batch</div>
                  <div className="hidden md:contents md:text-xl">
                    Batch Importer
                  </div>
                </Link>
              </div>
              <div className="pl-6 md:pl-16">
                <Link to="/index-explorer">
                  <div className="text-md md:hidden">Explore</div>
                  <div className="hidden md:contents md:text-xl">
                    Index Explorer
                  </div>
                </Link>
              </div>
              <div className="pl-6 md:pl-16">
                <Link to="/index-updater">
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
                >
                  <div className="text-md md:hidden">Map</div>
                  <div className="hidden md:contents md:text-xl">Map</div>
                </a>
              </div>
            </div>
          </div>
          <Outlet />
          <ScrollRestoration />
          <script
            data-goatcounter="https://tools-murm.goatcounter.com/count"
            async
            src="//gc.zgo.at/count.js"
          ></script>
          <Scripts />
          {process.env.NODE_ENV === 'development' && <LiveReload />}
        </div>
      </body>
    </html>
  )
}

export function ErrorBoundary({ error }) {
  console.error(error)
  return (
    <html>
      <head>
        <title>MPG - Fatal Error</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-white dark:bg-gray-900 text-black dark:text-gray-50 leading-normal">
        <div className="container mx-auto px-4 h-screen flex justify-center items-center flex-col">
          <span className="text-5xl mb-8">💥😱</span>
          <h1 className="text-xl font-bold mb-8">
            A fatal error has occurred and was logged.
          </h1>
          <code className="text-lg">{error.message}</code>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
