import { lazy } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'

const AdminShell = lazy(() => import('../admin/AdminShell').then((module) => ({ default: module.AdminShell })))

export function AppLayout() {
  const location = useLocation()
  const accessToken = useAuthStore((state) => state.accessToken)
  const role = useAuthStore((state) => state.role)
  const isAdminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin/')

  if (accessToken && role === 'ADMIN' && !isAdminRoute) {
    return <Navigate to="/admin" replace />
  }

  if (location.pathname === '/login' || !isAdminRoute) {
    return <Outlet />
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  )
}
