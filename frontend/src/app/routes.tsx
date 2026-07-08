import type { RouteObject } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { NotFoundPage } from '../components/layout/NotFoundPage'
import { PlaceholderPage } from '../components/layout/PlaceholderPage'
import { RouteGuard } from '../components/layout/RouteGuard'
import { MarketplacePlaceholderPage } from '../components/marketplace'
import { LoginPage } from '../features/auth/LoginPage'
import { FavoritesPage } from '../features/favorites/FavoritesPage'
import { HomePage } from '../features/item-market/HomePage'
import type { RouteMeta } from '../types/routes'
import { routeCatalog } from './routeCatalog'

function createRoute(meta: RouteMeta): RouteObject {
  if (meta.path === '/login') {
    return {
      path: 'login',
      element: <LoginPage />,
    }
  }

  if (meta.path === '/favorites') {
    return {
      path: 'favorites',
      element: <FavoritesPage />,
    }
  }

  if (meta.path === '/') {
    return { index: true, element: <HomePage /> }
  }

  const element =
    meta.module === 'admin' ? (
      <RouteGuard meta={meta}>
        <PlaceholderPage meta={meta} />
      </RouteGuard>
    ) : (
      <MarketplacePlaceholderPage meta={meta} />
    )

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
