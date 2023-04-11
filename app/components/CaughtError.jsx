export default function CaughtError({ caught }) {
  return (
    <div className="container mx-auto px-4 h-screen flex items-center flex-col">
      <span className="text-5xl md:text-8xl mt-8 md:mt-16">🤬</span>
      <h1 className="text-3xl font-bold mt-8">{caught.status} Error</h1>
      {caught.statusText ? (
        <h2 className="text-lg">{caught.statusText}</h2>
      ) : null}
      <code className="text-sm">{caught.data}</code>
    </div>
  )
}
