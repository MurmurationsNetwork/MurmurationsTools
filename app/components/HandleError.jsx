import { isRouteErrorResponse } from '@remix-run/react'

export default function HandleError(error) {
  console.log(error)
  if (isRouteErrorResponse(error)) {
    return (
      <div className="container mx-auto px-4 h-screen flex items-center flex-col">
        <span className="text-5xl md:text-8xl mt-8 md:mt-16">🤬</span>
        <h1 className="text-md md:text-3xl font-bold mt-4 md:mt-8">
          {error.status} Error
        </h1>
        {error.statusText ? (
          <h2 className="text-sm md:text-lg font-bold mt-4 md:mt-8">
            {error.statusText}
          </h2>
        ) : null}
        <code className="text-sm md:text-lg mt-4 md:mt-8">{error.data}</code>
      </div>
    )
  } else {
    return (
      <div className="container mx-auto px-4 h-screen flex items-center flex-col">
        <span className="text-5xl md:text-8xl mt-8 md:mt-16">😱</span>
        <h1 className="text-md md:text-3xl font-bold mt-8 md:mt-16">
          A fatal error has occurred and was logged
        </h1>
        <code className="text-sm md:text-lg mt-4 md:mt-8">
          {error instanceof Error ? error.message : error}
        </code>
      </div>
    )
  }
}
