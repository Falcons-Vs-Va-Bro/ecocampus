export const ordersFeature = {
  key: 'orders',
  routes: ['/orders', '/orders/purchase', '/orders/sale', '/orders/purchase/demand', '/orders/purchase/demand/:id/detail', '/orders/purchase/demand/new', '/orders/purchase/demand/mine'],
} as const

export { OrdersPage } from './OrdersPage'
export { PurchaseDemandMinePage } from './PurchaseDemandMinePage'
export { PurchaseDemandNewPage } from './PurchaseDemandNewPage'
export { PurchaseDemandPage } from './PurchaseDemandPage'
export { PurchaseDemandDetailPage } from './PurchaseDemandDetailPage'
