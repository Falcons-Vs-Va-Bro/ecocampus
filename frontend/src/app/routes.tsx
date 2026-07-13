import type { RouteObject } from 'react-router-dom'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { NotFoundPage } from '../components/layout/NotFoundPage'
import { PlaceholderPage } from '../components/layout/PlaceholderPage'
import { RouteGuard } from '../components/layout/RouteGuard'
import { MarketplacePlaceholderPage } from '../components/marketplace'
import { AdminItemsPage, AdminReviewPage } from '../features/admin'
import { LoginPage } from '../features/auth/LoginPage'
import { ConversationDetailPage, MessagesPage } from '../features/conversations'
import { FavoritesPage } from '../features/favorites/FavoritesPage'
import { ItemDetailPage } from '../features/item-detail'
import { HomePage } from '../features/item-market/HomePage'
import { ItemsPage } from '../features/item-market/ItemsPage'
import { EditItemPage } from '../features/item-publish/EditItemPage'
import { MyItemsPage } from '../features/item-publish/MyItemsPage'
import { PublishPage } from '../features/item-publish/PublishPage'
import { OrdersPage, PurchaseDemandDetailPage, PurchaseDemandMinePage, PurchaseDemandNewPage, PurchaseDemandPage } from '../features/orders'
import { ProfilePage } from '../features/profile/ProfilePage'
import { VerifyPage } from '../features/profile/VerifyPage'
import type { RouteMeta } from '../types/routes'
import { routeCatalog } from './routeCatalog'

const itemCategoryPaths = [
  '/items',
  '/items/textbook',
  '/items/digital',
  '/items/dorm',
  '/items/outdoors',
  '/items/daily-goods',
  '/items/make-up',
  '/items/instruments',
  '/items/tickets',
  '/items/others',
]

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

  if (itemCategoryPaths.includes(meta.path)) {
    return {
      path: meta.path.replace(/^\//, ''),
      element: <ItemsPage />,
    }
  }

  if (meta.path === '/publish') {
    return {
      path: 'publish',
      element: <PublishPage />,
    }
  }

  if (meta.path === '/items/mine') {
    return {
      path: 'items/mine',
      element: <MyItemsPage />,
    }
  }

  if (meta.path === '/items/:id/edit') {
    return {
      path: 'items/:id/edit',
      element: <EditItemPage />,
    }
  }

  if (meta.path === '/profile') {
    return {
      path: 'profile',
      element: <ProfilePage />,
    }
  }

  if (meta.path === '/verify') {
    return {
      path: 'verify',
      element: <VerifyPage />,
    }
  }

  if (meta.path === '/items/:id') {
    return {
      path: 'items/:id',
      element: <ItemDetailPage />,
    }
  }

  if (meta.path === '/orders') {
    return {
      path: 'orders',
      element: <Navigate to="/orders/purchase" replace />,
    }
  }

  if (meta.path === '/orders/purchase') {
    return {
      path: meta.path.replace(/^\//, ''),
      element: <OrdersPage />,
    }
  }

  if (meta.path === '/orders/sale') {
    return {
      path: 'orders/sale',
      element: <OrdersPage role="SELLER" />,
    }
  }

  if (meta.path === '/orders/purchase/demand') {
    return {
      path: 'orders/purchase/demand',
      element: <PurchaseDemandPage />,
    }
  }

  if (meta.path === '/orders/purchase/demand/:id/detail') {
    return {
      path: 'orders/purchase/demand/:id/detail',
      element: <PurchaseDemandDetailPage />,
    }
  }

  if (meta.path === '/orders/purchase/demand/new') {
    return {
      path: 'orders/purchase/demand/new',
      element: <PurchaseDemandNewPage />,
    }
  }

  if (meta.path === '/orders/purchase/demand/mine') {
    return {
      path: 'orders/purchase/demand/mine',
      element: <PurchaseDemandMinePage />,
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
