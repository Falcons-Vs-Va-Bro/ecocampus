import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser } from '../api/auth.api'
import { queryKeys } from '../api/queryKeys'
import { useAuthStore } from '../stores/auth.store'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export function useCurrentUserIdentity() {
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((state) => state.accessToken)
  const role = useAuthStore((state) => state.role)
  const clearSession = useAuthStore((state) => state.clearSession)
  const currentUserQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getCurrentUser,
    enabled: Boolean(accessToken) && !useMocks,
    retry: false,
  })

  const isAuthenticated = Boolean(accessToken)
  const nickname = useMocks && isAuthenticated
    ? '海风吹过嘉庚楼'
    : currentUserQuery.data?.data.nickname ?? (isAuthenticated ? '正在验证身份' : '')
  const resolvedRole = currentUserQuery.data?.data.role ?? role

  function logout() {
    clearSession()
    queryClient.clear()
  }

  return {
    avatarText: nickname.trim().slice(0, 1) || '用',
    currentUser: currentUserQuery.data?.data,
    isAuthenticated,
    isLoading: currentUserQuery.isLoading,
    nickname,
    roleLabel: resolvedRole === 'ADMIN' ? '管理员' : '学生',
    logout,
  }
}
