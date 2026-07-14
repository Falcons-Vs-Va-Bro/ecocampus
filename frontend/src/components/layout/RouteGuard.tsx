import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'
import type { RouteMeta } from '../../types/routes'

interface RouteGuardProps extends PropsWithChildren {
  meta: RouteMeta
  showNotice?: boolean
}

export function RouteGuard({ children, meta }: RouteGuardProps) {
  const location = useLocation()
  const accessToken = useAuthStore((state) => state.accessToken)
  const role = useAuthStore((state) => state.role)
  const verificationStatus = useAuthStore((state) => state.verificationStatus)

  if (meta.guard === 'public' || meta.guard === 'interaction') {
    return children
  }

  if (!accessToken) {
    const returnTo = `${location.pathname}${location.search}`
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />
  }

  if (meta.guard === 'admin' && role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  if (meta.guard === 'verified' && role !== 'ADMIN' && verificationStatus !== 'VERIFIED') {
    return <Navigate to="/verify" replace />
  }

  return children
}
