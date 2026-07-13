import {
  Bell,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  FolderOpen,
  Grid2X2,
  Megaphone,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { FormEvent, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import campusGateImage from '../../assets/favorites/campus-gate.png'
import campusSidebarImage from '../../assets/favorites/campus-sidebar.png'
import './AdminShell.css'

interface AdminShellProps {
  children: ReactNode
}

const adminNav = [
  { label: '数据看板', icon: Grid2X2, to: '/admin' },
  { label: '商品审核', icon: ClipboardCheck, to: '/admin/items/review', badge: 27 },
  { label: '违规下架', icon: Shield, to: '/admin/items' },
  { label: '用户管理', icon: UsersRound, to: '/admin/users' },
  { label: '黑名单', icon: UserRound, to: '/admin/users?scope=blacklist', alert: true },
  { label: '类目管理', icon: FolderOpen, to: '/admin/categories' },
  { label: '订单记录', icon: ClipboardList, to: '/orders' },
  { label: '求购管理', icon: ShoppingCart, to: '/demands' },
]

const utilityNav = [
  { label: '公告管理', icon: Megaphone },
  { label: '系统设置', icon: Settings },
]

export function AdminShell({ children }: AdminShellProps) {
  const shouldReduceMotion = useReducedMotion()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '')

  useEffect(() => {
    setKeyword(searchParams.get('keyword') ?? '')
  }, [location.pathname, searchParams])

  function submitGlobalSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()

    if (keyword.trim()) {
      params.set('keyword', keyword.trim())
    }

    navigate(`/admin/items${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className="admin-shell">
      <motion.header
        className="admin-topbar"
        initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      >
        <NavLink className="admin-brand" to="/admin" aria-label="后台首页">
          <span className="admin-brand-art">
            <img src={campusGateImage} alt="" aria-hidden="true" />
          </span>
          <span>
            <strong>厦大闲置</strong>
            <em>管理后台</em>
            <small>校园闲置物品智慧流转平台</small>
          </span>
        </NavLink>

        <form className="admin-global-search" onSubmit={submitGlobalSearch}>
          <Search size={25} aria-hidden="true" />
          <input
            aria-label="搜索后台商品"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索商品、用户、订单..."
          />
          <button type="submit">搜索</button>
        </form>

        <div className="admin-account" aria-label="管理员账号">
          <button type="button" className="admin-icon-button" aria-label="通知">
            <Bell size={23} />
            <span>3</span>
          </button>
          <span className="admin-avatar" aria-hidden="true">
            小嘉
          </span>
          <span className="admin-account-name">
            <strong>管理员 小嘉</strong>
            <em>管理员</em>
          </span>
          <ChevronDown size={18} aria-hidden="true" />
        </div>
      </motion.header>

      <div className="admin-workspace">
        <motion.aside
          className="admin-sidebar"
          initial={shouldReduceMotion ? false : { opacity: 0, x: -14 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <nav className="admin-nav-list" aria-label="后台导航">
            {adminNav.map((item, index) => (
              <motion.div
                key={item.label}
                initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.12 + index * 0.025 }}
              >
                <NavLink
                  to={item.to}
                  className={() => classNames(isAdminNavActive(location, item.to) && 'active')}
                >
                  <item.icon size={22} aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.badge ? <b>{item.badge}</b> : null}
                  {item.alert ? <i aria-hidden="true" /> : null}
                </NavLink>
              </motion.div>
            ))}
          </nav>

          <nav className="admin-nav-list admin-nav-list--muted" aria-label="后台计划能力">
            {utilityNav.map((item) => (
              <button type="button" disabled key={item.label}>
                <item.icon size={21} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <span className="admin-sidebar-art" aria-hidden="true">
            <img src={campusSidebarImage} alt="" loading="lazy" />
          </span>
        </motion.aside>

        <motion.main
          className="admin-main"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}

function isAdminNavActive(location: ReturnType<typeof useLocation>, to: string) {
  const [pathname, rawSearch] = to.split('?')

  if (pathname !== location.pathname) {
    return false
  }

  if (!rawSearch) {
    return pathname === '/admin/users' ? !new URLSearchParams(location.search).has('scope') : true
  }

  return rawSearch.split('&').every((entry) => {
    const [key, value] = entry.split('=')
    return new URLSearchParams(location.search).get(key) === value
  })
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
