import { lazy } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

const AdminShell = lazy(() => import('../admin/AdminShell').then((module) => ({ default: module.AdminShell })))

export function AppLayout() {
  const location = useLocation()
  const isAdminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin/')

  if (location.pathname === '/login' || !isAdminRoute) {
    return <Outlet />
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  )
}
