import {
  Bell,
  BookOpen,
  Box,
  Camera,
  ChevronDown,
  ClipboardList,
  Dumbbell,
  Grid3X3,
  Home,
  LogIn,
  LogOut,
  Mail,
  MessageCircle,
  Package,
  Search,
  ShoppingBasket,
  Star,
  Store,
  User,
  UserCheck,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCurrentUserIdentity } from '../../hooks/useCurrentUserIdentity'
import { useUnreadMessageCount } from '../../hooks/useUnreadMessageCount'
import campusGateImage from '../../assets/favorites/campus-gate.webp'
import campusSidebarImage from '../../assets/favorites/campus-sidebar.webp'
import './MarketplaceShell.css'

const categoryNav = [
  { label: '首页', icon: Home, to: '/' },
  { label: '全部分类', icon: Grid3X3, to: '/items' },
  { label: '教材教辅', icon: BookOpen, to: '/items/textbook' },
  { label: '数码电子', icon: Camera, to: '/items/digital' },
  { label: '宿舍用品', icon: Package, to: '/items/dorm' },
  { label: '运动户外', icon: Dumbbell, to: '/items/outdoors' },
  { label: '生活日用', icon: ShoppingBasket, to: '/items/daily-goods' },
  { label: '美妆个护', icon: Star, to: '/items/make-up' },
  { label: '乐器文具', icon: BookOpen, to: '/items/instruments' },
  { label: '票务转让', icon: ClipboardList, to: '/items/tickets' },
  { label: '其他', icon: Box, to: '/items/others' },
]

const userNav = [
  { label: '我的收藏', icon: Star, to: '/favorites' },
  { label: '我的发布', icon: Store, to: '/items/mine' },
  { label: '购买订单', icon: ClipboardList, to: '/orders/purchase' },
  { label: '出售订单', icon: Store, to: '/orders/sale' },
  { label: '消息中心', icon: MessageCircle, to: '/messages' },
  { label: '个人中心', icon: User, to: '/profile' },
]

interface MarketplaceShellProps {
  activeCategoryLabel?: string
  activeUserLabel?: string
  children: ReactNode
  keyword: string
  mainClassName?: string
  onKeywordChange: (value: string) => void
  onSearch?: () => void
  searchLabel: string
  searchPlaceholder?: string
  shellClassName?: string
}

export function MarketplaceShell({
  activeCategoryLabel,
  activeUserLabel,
  children,
  keyword,
  mainClassName,
  onKeywordChange,
  onSearch,
  searchLabel,
  searchPlaceholder = '搜索商品名称、类别、关键词...',
  shellClassName,
}: MarketplaceShellProps) {
  const shouldReduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const identity = useCurrentUserIdentity()
  const unreadMessageCount = useUnreadMessageCount()
  const notificationCount = 0
  const [openMenu, setOpenMenu] = useState<'notifications' | 'profile' | null>(null)
  const userbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!userbarRef.current?.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenMenu(null)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return (
    <div className={classNames('favorites-shell', shellClassName)}>
      <motion.header
        className="favorites-topbar"
        initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <a className="favorites-logo" href="/">
          <span className="painted-asset painted-asset--gate">
            <img
              className="campus-gate-image"
              src={campusGateImage}
              alt=""
              aria-hidden="true"
              decoding="async"
              fetchPriority="high"
              width="300"
              height="127"
            />
          </span>
          <span>
            <strong>厦大闲置</strong>
            <small>厦门大学校园二手交易平台</small>
          </span>
        </a>

        <form
          className="favorites-search"
          onSubmit={(event) => {
            event.preventDefault()
            onSearch?.()
          }}
        >
          <Search size={24} />
          <input
            aria-label={searchLabel}
            placeholder={searchPlaceholder}
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
          />
          <button type="submit">搜索</button>
        </form>

        <div className="favorites-userbar" aria-label="用户快捷入口" ref={userbarRef}>
          {identity.isAuthenticated ? (
            <>
              <button
                type="button"
                className="icon-button"
                aria-label="查看通知"
                aria-expanded={openMenu === 'notifications'}
                aria-controls="marketplace-notification-panel"
                onClick={() => setOpenMenu((current) => current === 'notifications' ? null : 'notifications')}
              >
                <Bell size={25} />
                {notificationCount > 0 ? <span>{notificationCount}</span> : null}
              </button>
              <Link className="icon-button" aria-label="进入消息中心" to="/messages" onClick={() => setOpenMenu(null)}>
                <Mail size={26} />
                {unreadMessageCount > 0 ? <span>{unreadMessageCount}</span> : null}
              </Link>
              <button
                type="button"
                className="student-profile student-profile--button"
                aria-label="打开用户菜单"
                aria-expanded={openMenu === 'profile'}
                aria-controls="marketplace-profile-menu"
                onClick={() => setOpenMenu((current) => current === 'profile' ? null : 'profile')}
              >
                <span className="student-avatar">{identity.avatarText}</span>
                <strong>{identity.nickname}</strong>
                <em>{identity.roleLabel}</em>
                <ChevronDown className="student-profile-chevron" size={17} />
              </button>

              {openMenu === 'notifications' ? (
                <div className="marketplace-user-popover notification-popover" id="marketplace-notification-panel" role="status">
                  <strong>通知</strong>
                  <p>暂无新的系统通知</p>
                  <Link to="/messages" onClick={() => setOpenMenu(null)}>查看私信消息</Link>
                </div>
              ) : null}

              {openMenu === 'profile' ? (
                <div className="marketplace-user-popover profile-popover" id="marketplace-profile-menu" role="menu">
                  <Link to="/profile" role="menuitem" onClick={() => setOpenMenu(null)}>
                    <User size={18} />
                    个人中心
                  </Link>
                  <Link to="/verify" role="menuitem" onClick={() => setOpenMenu(null)}>
                    <UserCheck size={18} />
                    校园核验
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpenMenu(null)
                      identity.logout()
                      navigate('/')
                    }}
                  >
                    <LogOut size={18} />
                    退出登录
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <Link className="student-profile student-profile--guest" to="/login">
              <span className="student-avatar"><LogIn size={20} /></span>
              <strong>登录</strong>
            </Link>
          )}
        </div>
      </motion.header>

      <div className="favorites-workspace">
        <motion.aside
          className="favorites-sidebar"
          initial={shouldReduceMotion ? false : { opacity: 0, x: -16 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.46, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <nav className="nav-section" aria-label="商品分类">
            {categoryNav.map((item, index) => (
              <motion.a
                className={activeCategoryLabel === item.label ? 'active' : undefined}
                href={item.to}
                key={item.label}
                initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: 0.18 + index * 0.025 }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </motion.a>
            ))}
          </nav>

          <nav className="nav-section user-routes" aria-label="个人中心">
            {userNav.map((item, index) => (
              <motion.a
                className={activeUserLabel === item.label ? 'active' : undefined}
                href={item.to}
                key={item.label}
                initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: 0.45 + index * 0.035 }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.to === '/messages' && unreadMessageCount > 0 ? <b>{unreadMessageCount}</b> : null}
              </motion.a>
            ))}
          </nav>

          <div className="campus-sketch painted-asset painted-asset--sidebar" aria-hidden="true">
            <img src={campusSidebarImage} alt="" loading="lazy" decoding="async" width="280" height="420" />
          </div>
        </motion.aside>

        <motion.main
          className={classNames('favorites-main', mainClassName)}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.44, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
