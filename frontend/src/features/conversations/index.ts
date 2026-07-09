export const conversationsFeature = {
  key: 'conversations',
  routes: ['/messages', '/messages/:conversationId'],
} as const

export { ConversationDetailPage } from './ConversationDetailPage'
export { MessagesPage } from './MessagesPage'
