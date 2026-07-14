import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './providers'
import { router } from './routes'

export default function App() {
  return (
    <AppProviders>
      <Suspense fallback={<RouteLoadingFallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </AppProviders>
  )
}

function RouteLoadingFallback() {
  return (
    <main className="route-loading" aria-live="polite" aria-busy="true">
      <span />
      <strong>正在翻开校园闲置册…</strong>
    </main>
  )
}
