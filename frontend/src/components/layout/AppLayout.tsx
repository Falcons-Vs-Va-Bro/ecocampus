import { Outlet, useLocation } from 'react-router-dom'
import { AdminShell } from '../admin'

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
