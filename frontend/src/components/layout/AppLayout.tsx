import { GitBranch, Leaf, ShieldCheck } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { routeCatalog } from '../../app/routeCatalog'

const primaryPaths = ['/', '/items', '/demands', '/publish', '/orders', '/profile']
const adminPaths = ['/admin', '/admin/items/review', '/admin/users']

export function AppLayout() {
  const location = useLocation()
  const primaryRoutes = routeCatalog.filter((route) => primaryPaths.includes(route.path))
  const adminRoutes = routeCatalog.filter((route) => adminPaths.includes(route.path))

  if (location.pathname === '/favorites' || location.pathname === '/login') {
    return <Outlet />
  }

  return (
    <div className="app-shell">
      <header className="shell-header">
        <div className="shell-inner flex flex-col gap-3 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <NavLink to="/" className="flex items-center gap-3" aria-label="EcoCampus home">
              <span className="brand-mark">
                <Leaf size={20} strokeWidth={2.4} />
              </span>
              <span>
                <span className="block text-[18px] font-black leading-tight text-[#10251c]">EcoCampus</span>
                <span className="block text-xs font-semibold text-[#607267]">校园闲置物品智慧流转</span>
              </span>
            </NavLink>

            <a
              className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#d7e3db] bg-white/70 px-3 text-sm font-bold text-[#263931]"
              href="https://github.com/Falcons-Vs-Va-Bro/ecocampus"
              target="_blank"
              rel="noreferrer"
            >
              <GitBranch size={16} />
              GitHub
            </a>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Primary routes">
            {primaryRoutes.map((route) => (
              <NavLink key={route.path} to={route.path} className="nav-link">
                {route.title}
              </NavLink>
            ))}
          </nav>

          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Admin routes">
            <span className="inline-flex h-9 items-center gap-2 rounded-[8px] px-2 text-sm font-black text-[#6a756f]">
              <ShieldCheck size={15} />
              后台
            </span>
            {adminRoutes.map((route) => (
              <NavLink key={route.path} to={route.path} className="nav-link">
                {route.title}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="shell-inner py-8">
        <Outlet />
      </main>
    </div>
  )
}
