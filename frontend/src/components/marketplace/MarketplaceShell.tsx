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
  Mail,
  MessageCircle,
  Package,
  Search,
  ShoppingBasket,
  Star,
  Store,
  User,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import campusGateImage from '../../assets/favorites/campus-gate.png'
import campusSidebarImage from '../../assets/favorites/campus-sidebar.png'
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
  { label: '购买订单', icon: ClipboardList, to: '/orders?role=BUYER' },
  { label: '出售订单', icon: Store, to: '/orders?role=SELLER' },
  { label: '消息中心', icon: MessageCircle, to: '/messages', badge: 3 },
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
            <img className="campus-gate-image" src={campusGateImage} alt="" aria-hidden="true" />
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

        <div className="favorites-userbar" aria-label="用户快捷入口">
          <button type="button" className="icon-button" aria-label="通知">
            <Bell size={25} />
            <span>3</span>
          </button>
          <button type="button" className="icon-button" aria-label="站内信">
            <Mail size={26} />
            <span>2</span>
          </button>
          <div className="student-profile">
            <span className="student-avatar">海</span>
            <strong>海风吹过嘉庚楼</strong>
            <em>学生</em>
            <ChevronDown size={18} />
          </div>
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
                {item.badge ? <b>{item.badge}</b> : null}
              </motion.a>
            ))}
          </nav>

          <div className="campus-sketch painted-asset painted-asset--sidebar" aria-hidden="true">
            <img src={campusSidebarImage} alt="" loading="lazy" />
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
