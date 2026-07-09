import type { RouteObject } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { NotFoundPage } from '../components/layout/NotFoundPage'
import { PlaceholderPage } from '../components/layout/PlaceholderPage'
import { RouteGuard } from '../components/layout/RouteGuard'
import { MarketplacePlaceholderPage } from '../components/marketplace'
import { AdminItemsPage, AdminReviewPage } from '../features/admin'
import { LoginPage } from '../features/auth/LoginPage'
import { ConversationDetailPage, MessagesPage } from '../features/conversations'
import { FavoritesPage } from '../features/favorites/FavoritesPage'
import { HomePage } from '../features/item-market/HomePage'
import { OrdersPage } from '../features/orders'
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

  if (meta.path === '/messages') {
    return {
      path: 'messages',
      element: <MessagesPage />,
    }
  }

  if (meta.path === '/messages/:conversationId') {
    return {
      path: 'messages/:conversationId',
      element: <ConversationDetailPage />,
    }
  }

  if (meta.path === '/orders') {
    return {
      path: 'orders',
      element: <OrdersPage />,
    }
  }

  if (meta.path === '/admin/items/review') {
    return {
      path: 'admin/items/review',
      element: (
        <RouteGuard meta={meta} showNotice={false}>
          <AdminReviewPage />
        </RouteGuard>
      ),
    }
  }

  if (meta.path === '/admin/items') {
    return {
      path: 'admin/items',
      element: (
        <RouteGuard meta={meta} showNotice={false}>
          <AdminItemsPage />
        </RouteGuard>
      ),
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
