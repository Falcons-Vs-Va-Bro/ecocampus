export { AdminDashboardPage } from './AdminDashboardPage'
export { AdminItemsPage } from './AdminItemsPage'
export { AdminReviewPage } from './AdminReviewPage'

export const adminFeature = {
  key: 'admin',
  routes: ['/admin', '/admin/items/review', '/admin/items', '/admin/users', '/admin/categories'],
} as const
