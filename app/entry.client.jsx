import { hydrateRoot } from 'react-dom/client'
import { RemixBrowser } from '@remix-run/react'
import { startTransition, StrictMode } from 'react'

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  )
})
