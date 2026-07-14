import type { RouteObject } from 'react-router-dom'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { NotFoundPage } from '../components/layout/NotFoundPage'
import { RouteGuard } from '../components/layout/RouteGuard'
import type { RouteMeta } from '../types/routes'
import { routeCatalog } from './routeCatalog'
import {
  AdminCategoriesPage,
  AdminDashboardPage,
  AdminItemsPage,
  AdminReviewPage,
  AdminUsersPage,
  ConversationDetailPage,
  EditItemPage,
  FavoritesPage,
  HomePage,
  ItemDetailPage,
  ItemsPage,
  LoginPage,
  MarketplacePlaceholderPage,
  MessagesPage,
  MyItemsPage,
  OrdersPage,
  PlaceholderPage,
  ProfilePage,
  PublishPage,
  PurchaseDemandDetailPage,
  PurchaseDemandMinePage,
  PurchaseDemandNewPage,
  PurchaseDemandPage,
  VerifyPage,
} from './routeComponents'

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

function createRouteContent(meta: RouteMeta): RouteObject {
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

  if (meta.path === '/orders/sales') {
    return {
      path: 'orders/sales',
      element: <Navigate to="/orders/sale" replace />,
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
      element: <AdminReviewPage />,
    }
  }

  if (meta.path === '/admin/items') {
    return {
      path: 'admin/items',
      element: <AdminItemsPage />,
    }
  }

  if (meta.path === '/admin') {
    return {
      path: 'admin',
      element: <AdminDashboardPage />,
    }
  }

  if (meta.path === '/admin/users') {
    return { path: 'admin/users', element: <AdminUsersPage /> }
  }

  if (meta.path === '/admin/categories') {
    return { path: 'admin/categories', element: <AdminCategoriesPage /> }
  }

  if (meta.path === '/') {
    return { index: true, element: <HomePage /> }
  }

  const element = meta.module === 'admin'
    ? <PlaceholderPage meta={meta} />
    : <MarketplacePlaceholderPage meta={meta} />

  return {
    path: meta.path.replace(/^\//, ''),
    element,
  }
}

function createRoute(meta: RouteMeta): RouteObject {
  const route = createRouteContent(meta)

  if (!route.element || meta.guard === 'public' || meta.guard === 'interaction') {
    return route
  }

  return {
    ...route,
    element: (
      <RouteGuard meta={meta} showNotice={false}>
        {route.element}
      </RouteGuard>
    ),
  }
}

export const router = createBrowserRouter(
  [
    {
      element: <AppLayout />,
      children: [...routeCatalog.map(createRoute), { path: '*', element: <NotFoundPage /> }],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)
