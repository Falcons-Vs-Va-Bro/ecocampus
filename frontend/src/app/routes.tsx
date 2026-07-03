import type { RouteObject } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { NotFoundPage } from '../components/layout/NotFoundPage'
import { PlaceholderPage } from '../components/layout/PlaceholderPage'
import { RouteGuard } from '../components/layout/RouteGuard'
import type { RouteMeta } from '../types/routes'
import { routeCatalog } from './routeCatalog'

function createRoute(meta: RouteMeta): RouteObject {
  const element = (
    <RouteGuard meta={meta}>
      <PlaceholderPage meta={meta} />
    </RouteGuard>
  )

  if (meta.path === '/') {
    return { index: true, element }
  }

  return {
    path: meta.path.replace(/^\//, ''),
    element,
  }
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [...routeCatalog.map(createRoute), { path: '*', element: <NotFoundPage /> }],
  },
])
