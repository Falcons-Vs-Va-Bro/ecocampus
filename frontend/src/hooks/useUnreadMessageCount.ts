import { useQuery } from '@tanstack/react-query'
import { listConversations } from '../api/conversation.api'
import { queryKeys } from '../api/queryKeys'
import { useAuthStore } from '../stores/auth.store'

export function useUnreadMessageCount() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const conversationsQuery = useQuery({
    queryKey: queryKeys.conversations.list,
    queryFn: () => listConversations({ page: 1, size: 100 }),
    enabled: Boolean(accessToken),
  })

  return (conversationsQuery.data?.data.items ?? []).reduce(
    (count, conversation) => count + (conversation.unreadCount ?? 0),
    0,
  )
}
