import type { RouteObject } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { NotFoundPage } from '../components/layout/NotFoundPage'
import { PlaceholderPage } from '../components/layout/PlaceholderPage'
import { RouteGuard } from '../components/layout/RouteGuard'
import { LoginPage } from '../features/auth/LoginPage'
import { FavoritesPage } from '../features/favorites/FavoritesPage'
import { HomePage } from '../features/item-market/HomePage'
import { ItemsPage } from '../features/item-market/ItemsPage'
import { EditItemPage } from '../features/item-publish/EditItemPage'
import { MyItemsPage } from '../features/item-publish/MyItemsPage'
import { PublishPage } from '../features/item-publish/PublishPage'
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

  if (meta.path === '/') {
    return { index: true, element: <HomePage /> }
  }

  const element = (
    <RouteGuard meta={meta}>
      <PlaceholderPage meta={meta} />
    </RouteGuard>
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
