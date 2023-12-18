import { isRouteErrorResponse } from '@remix-run/react'

export default function HandleError(error) {
  if (process.env.NODE_ENV === 'production') {
    error.stack = undefined
  }

  if (isRouteErrorResponse(error)) {
    return (
      <div className="container mx-auto flex h-screen flex-col items-center px-4">
        <span className="mt-8 text-5xl md:mt-16 md:text-8xl">🤬</span>
        <h1 className="text-md mt-4 font-bold md:mt-8 md:text-3xl">
          {error.status} Error
        </h1>
        {error.statusText ? (
          <h2 className="mt-4 text-sm font-bold md:mt-8 md:text-lg">
            {error.statusText}
          </h2>
        ) : null}
        <code className="mt-4 text-sm md:mt-8 md:text-lg">{error.data}</code>
      </div>
    )
  } else if (error instanceof Error) {
    return (
      <div className="container mx-auto flex h-screen flex-col items-center px-4">
        <span className="mt-8 text-5xl md:mt-16 md:text-8xl">😱</span>
        <h1 className="text-md mt-4 font-bold md:mt-8 md:text-3xl">
          A fatal error has occurred and was logged
        </h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <code className="mt-4 text-sm md:mt-8 md:text-lg">{error.stack}</code>
      </div>
    )
  } else {
    return <h1>Unknown Error</h1>
  }
}
