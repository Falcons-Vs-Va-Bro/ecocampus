export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  categories: {
    list: ['categories'] as const,
  },
  items: {
    list: (params?: unknown) => ['items', 'list', params] as const,
    detail: (itemId: string | number) => ['items', 'detail', itemId] as const,
    mine: (params?: unknown) => ['items', 'mine', params] as const,
  },
  favorites: {
    mine: ['favorites', 'mine'] as const,
  },
  profile: {
    me: ['profile', 'me'] as const,
    addresses: ['profile', 'addresses'] as const,
  },
  conversations: {
    lists: ['conversations', 'list'] as const,
    list: (params?: unknown) => ['conversations', 'list', params] as const,
    messages: (conversationId: string | number) => ['conversations', conversationId, 'messages'] as const,
  },
  orders: {
    list: (params?: unknown) => ['orders', 'list', params] as const,
    detail: (orderId: string | number) => ['orders', 'detail', orderId] as const,
  },
  demands: {
    list: (params?: unknown) => ['demands', 'list', params] as const,
    mine: ['demands', 'mine'] as const,
    matches: (demandId: string | number) => ['demands', demandId, 'matches'] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    dashboardSummary: ['admin', 'dashboard', 'summary'] as const,
    reviewItems: (params?: unknown) => ['admin', 'items', 'review', params] as const,
    items: (params?: unknown) => ['admin', 'items', params] as const,
    users: (params?: unknown) => ['admin', 'users', params] as const,
    categories: ['admin', 'categories'] as const,
  },
}
