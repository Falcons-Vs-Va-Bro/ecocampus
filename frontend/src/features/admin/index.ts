export { AdminItemsPage } from './AdminItemsPage'
export { AdminUsersPage } from './AdminUsersPage'
export { AdminCategoriesPage } from './AdminCategoriesPage'
export { AdminReviewPage } from './AdminReviewPage'

export const adminFeature = {
  key: 'admin',
  routes: ['/admin', '/admin/items/review', '/admin/items', '/admin/users', '/admin/categories'],
} as const
