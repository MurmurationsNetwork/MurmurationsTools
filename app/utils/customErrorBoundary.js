import { isRouteErrorResponse, Links, Meta, Scripts } from '@remix-run/react'
import CaughtError from '~/components/CaughtError'

export default function customErrorBoundary(error) {
  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return <CaughtError caught={error} />
  } else if (error instanceof Error) {
    return (
      <html>
        <head>
          <title>MPG - Fatal Error</title>
          <Meta />
          <Links />
        </head>
        <body className="bg-white dark:bg-gray-900 text-black dark:text-gray-50 leading-normal">
          <div className="container mx-auto px-4 h-screen flex justify-center items-center flex-col">
            <span className="text-5xl md:text-8xl">😱</span>
            <h1 className="text-3xl font-bold mt-8">
              A fatal error has occurred and was logged
            </h1>
            <code className="text-sm">{error.message}</code>
          </div>
          <Scripts />
        </body>
      </html>
    )
  } else {
    return <h1>Unknown Error</h1>
  }
}
