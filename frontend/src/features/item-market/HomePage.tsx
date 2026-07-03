import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  BookOpen,
  Box,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  Grid3X3,
  Heart,
  Home,
  Mail,
  Megaphone,
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
import { useMemo, useState } from 'react'
import { listCategories } from '../../api/category.api'
import { listItems } from '../../api/item.api'
import type { ItemSummary } from '../../api/item.api'
import { queryKeys } from '../../api/queryKeys'
import campusGateImage from '../../assets/favorites/campus-gate.png'
import campusSidebarImage from '../../assets/favorites/campus-sidebar.png'
import emptyFavoritesImage from '../../assets/favorites/empty-favorites.png'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import '../favorites/FavoritesPage.css'
import './HomePage.css'

const pageSize = 8
const emptyItems: ItemSummary[] = []

const sectionTabs = ['今日推荐', '最新上架', '教材专区', '数码好物', '宿舍补给'] as const
const priceRanges = [
  { label: '全部', min: 0, max: Number.POSITIVE_INFINITY },
  { label: '0-50', min: 0, max: 5000 },
  { label: '50-100', min: 5000, max: 10000 },
  { label: '100-300', min: 10000, max: 30000 },
  { label: '300以上', min: 30000, max: Number.POSITIVE_INFINITY },
]
const deliveryModes = ['全部', '可自提', '可配送'] as const

const categoryNav = [
  { label: '首页', icon: Home, to: '/', active: true },
  { label: '全部分类', icon: Grid3X3, to: '/items' },
  { label: '教材教辅', icon: BookOpen, to: '/items' },
  { label: '数码电子', icon: Camera, to: '/items' },
  { label: '宿舍用品', icon: Package, to: '/items' },
  { label: '运动户外', icon: Dumbbell, to: '/items' },
  { label: '生活日用', icon: ShoppingBasket, to: '/items' },
  { label: '美妆个护', icon: Star, to: '/items' },
  { label: '乐器文具', icon: BookOpen, to: '/items' },
  { label: '票务转让', icon: ClipboardList, to: '/items' },
  { label: '其他', icon: Box, to: '/items' },
]

const userNav = [
  { label: '我的收藏', icon: Star, to: '/favorites' },
  { label: '我的发布', icon: Store, to: '/items/mine' },
  { label: '购买订单', icon: ClipboardList, to: '/orders' },
  { label: '出售订单', icon: Store, to: '/orders' },
  { label: '消息中心', icon: MessageCircle, to: '/messages', badge: 3 },
  { label: '个人中心', icon: User, to: '/profile' },
]

const demandHighlights = [
  { title: '求购 高等数学（第七版）下册', meta: '学号 103****5123 · 5 分钟前' },
  { title: '求购 iPad 或平板电脑', meta: '学号 105****3321 · 12 分钟前' },
  { title: '求购 篮球鞋 42码左右', meta: '学号 104****7788 · 18 分钟前' },
]

const hotCategories = [
  { label: '教材教辅', icon: BookOpen },
  { label: '数码电子', icon: Camera },
  { label: '宿舍用品', icon: Package },
  { label: '生活日用', icon: ShoppingBasket },
  { label: '运动户外', icon: Dumbbell },
  { label: '美妆个护', icon: Star },
]

type SectionTab = (typeof sectionTabs)[number]
type DeliveryModeFilter = (typeof deliveryModes)[number]

export function HomePage() {
  useDocumentTitle('厦大闲置 - 商品首页')

  const shouldReduceMotion = useReducedMotion()
  const [keyword, setKeyword] = useState('')
  const [section, setSection] = useState<SectionTab>('今日推荐')
  const [category, setCategory] = useState('全部')
  const [priceRange, setPriceRange] = useState(priceRanges[0])
  const [deliveryMode, setDeliveryMode] = useState<DeliveryModeFilter>('全部')
  const [page, setPage] = useState(1)
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => new Set())

  const itemsQuery = useQuery({
    queryKey: queryKeys.items.list('home'),
    queryFn: () => listItems({ page: 1, size: 80 }),
  })

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list,
    queryFn: listCategories,
  })

  const categoryFilters = useMemo(() => {
    const apiCategories = categoriesQuery.data?.data.map((item) => item.name) ?? []
    return ['全部', ...apiCategories]
  }, [categoriesQuery.data?.data])

  const allItems = itemsQuery.data?.data.items ?? emptyItems

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return allItems
      .filter((item) => filterBySection(item, section))
      .filter((item) => (category === '全部' ? true : item.categoryName === category))
      .filter((item) => item.priceCent >= priceRange.min && item.priceCent < priceRange.max)
      .filter((item) => {
        if (deliveryMode === '可自提') {
          return item.deliveryModes.includes('SELF_PICKUP')
        }

        if (deliveryMode === '可配送') {
          return item.deliveryModes.includes('DELIVER_TO_SCHOOL')
        }

        return true
      })
      .filter((item) => {
        if (!normalizedKeyword) {
          return true
        }

        return `${item.title} ${item.categoryName} ${item.seller.nickname}`.toLowerCase().includes(normalizedKeyword)
      })
      .sort((a, b) => {
        if (section === '最新上架') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }

        return b.favoriteCount - a.favoriteCount
      })
  }, [allItems, category, deliveryMode, keyword, priceRange, section])

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function resetPage(nextAction: () => void) {
    nextAction()
    setPage(1)
  }

  function toggleFavorite(itemId: number) {
    setFavoriteIds((current) => {
      const next = new Set(current)

      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }

      return next
    })
  }

  return (
    <div className="favorites-shell home-shell">
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
            setPage(1)
          }}
        >
          <Search size={24} />
          <input
            aria-label="搜索商品"
            placeholder="搜索商品名称、类别、关键词..."
            value={keyword}
            onChange={(event) => resetPage(() => setKeyword(event.target.value))}
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
                className={item.active ? 'active' : undefined}
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
          className="favorites-main home-main"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.44, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.section
            className="favorites-heading home-heading"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.36, delay: 0.26 }}
          >
            <h1>{section}</h1>
            <div className="favorite-tabs home-tabs" role="tablist" aria-label="首页商品分区">
              {sectionTabs.map((item) => (
                <button
                  className={section === item ? 'active' : undefined}
                  type="button"
                  role="tab"
                  aria-selected={section === item}
                  onClick={() => resetPage(() => setSection(item))}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.section>

          <section className="favorites-content-grid home-content-grid">
            <div className="favorites-list-panel">
              <div className="filters-panel" aria-label="首页筛选">
                <FilterRow label="分类">
                  {categoryFilters.map((item) => (
                    <button
                      type="button"
                      className={category === item ? 'selected' : undefined}
                      onClick={() => resetPage(() => setCategory(item))}
                      key={item}
                    >
                      {item}
                    </button>
                  ))}
                </FilterRow>

                <FilterRow label="价格">
                  {priceRanges.map((item) => (
                    <button
                      type="button"
                      className={priceRange.label === item.label ? 'selected' : undefined}
                      onClick={() => resetPage(() => setPriceRange(item))}
                      key={item.label}
                    >
                      {item.label}
                    </button>
                  ))}
                </FilterRow>

                <FilterRow label="取送">
                  {deliveryModes.map((item) => (
                    <button
                      type="button"
                      className={deliveryMode === item ? 'selected' : undefined}
                      onClick={() => resetPage(() => setDeliveryMode(item))}
                      key={item}
                    >
                      {item}
                    </button>
                  ))}
                </FilterRow>
              </div>

              <div className="favorites-toolbar home-toolbar">
                <span>共 {filteredItems.length || allItems.length} 件校内闲置</span>
                <button type="button" className="sort-button">
                  默认排序
                  <ChevronDown size={17} />
                </button>
              </div>

              {itemsQuery.isLoading ? (
                <div className="favorites-card-grid" aria-label="商品加载中">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div className="favorite-card skeleton" key={index}>
                      <div />
                      <span />
                      <span />
                    </div>
                  ))}
                </div>
              ) : null}

              {itemsQuery.isError ? (
                <div className="favorites-empty-state compact">
                  <span className="painted-asset painted-asset--empty-inline">
                    <img src={emptyFavoritesImage} alt="" aria-hidden="true" />
                  </span>
                  <h2>商品加载失败</h2>
                  <p>请确认已启用 mock 模式或后端接口可用。</p>
                  <button type="button" onClick={() => itemsQuery.refetch()}>
                    重新加载
                  </button>
                </div>
              ) : null}

              {!itemsQuery.isLoading && !itemsQuery.isError && visibleItems.length === 0 ? (
                <div className="favorites-empty-state compact">
                  <span className="painted-asset painted-asset--empty-inline">
                    <img src={emptyFavoritesImage} alt="" aria-hidden="true" />
                  </span>
                  <h2>暂无符合条件的商品</h2>
                  <p>换个分类、价格或关键词再试试。</p>
                </div>
              ) : null}

              {!itemsQuery.isLoading && !itemsQuery.isError && visibleItems.length > 0 ? (
                <div className="favorites-card-grid">
                  {visibleItems.map((item, index) => (
                    <HomeItemCard
                      item={item}
                      favorited={favoriteIds.has(item.id) || item.favorited}
                      motionIndex={index}
                      reduceMotion={shouldReduceMotion}
                      onToggleFavorite={() => toggleFavorite(item.id)}
                      key={item.id}
                    />
                  ))}
                </div>
              ) : null}

              <footer className="favorites-pagination" aria-label="首页分页">
                <span>共 {filteredItems.length} 件商品</span>
                <div>
                  <button type="button" onClick={() => setPage(Math.max(1, currentPage - 1))} aria-label="上一页">
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: pageCount }).map((_, index) => {
                    const pageNumber = index + 1
                    return (
                      <button
                        type="button"
                        className={currentPage === pageNumber ? 'active' : undefined}
                        onClick={() => setPage(pageNumber)}
                        key={pageNumber}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
                    aria-label="下一页"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <button type="button" className="page-size-button">
                  8 条/页
                  <ChevronDown size={16} />
                </button>
              </footer>
            </div>

            <aside className="home-side-panels" aria-label="首页辅助信息">
              <section className="home-quick-actions">
                <a href="/publish">
                  <BriefcaseBusiness size={36} />
                  <span>
                    <strong>发布闲置</strong>
                    <small>出售闲置物品</small>
                  </span>
                </a>
                <a href="/demands/new">
                  <ShoppingBasket size={37} />
                  <span>
                    <strong>发布求购</strong>
                    <small>发布求购信息</small>
                  </span>
                </a>
              </section>

              <HomePanel title="求购动态" action="更多">
                <div className="demand-list">
                  {demandHighlights.map((item) => (
                    <a href="/demands" key={item.title}>
                      <span className="student-avatar">求</span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.meta}</small>
                      </span>
                    </a>
                  ))}
                </div>
              </HomePanel>

              <HomePanel title="热门类目" action="更多">
                <div className="hot-category-grid">
                  {hotCategories.map((item) => (
                    <a href="/items" key={item.label}>
                      <item.icon size={30} />
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>
              </HomePanel>

              <HomePanel title="校园交易提示">
                <ul className="trade-tips">
                  <li>请尽量选择校内自提，保障交易安全</li>
                  <li>交易前请与对方充分沟通，确认商品信息</li>
                  <li>严禁发布违法违规、危险物品等信息</li>
                  <li>谨防诈骗，校外交易需谨慎</li>
                </ul>
                <a className="safety-link" href="/items">
                  查看《交易安全指南》
                </a>
              </HomePanel>
            </aside>
          </section>
        </motion.main>
      </div>
    </div>
  )
}

interface FilterRowProps {
  label: string
  children: ReactNode
}

function FilterRow({ label, children }: FilterRowProps) {
  return (
    <div className="filter-row">
      <span>{label}：</span>
      <div>{children}</div>
    </div>
  )
}

interface HomeItemCardProps {
  item: ItemSummary
  favorited: boolean
  motionIndex: number
  reduceMotion: boolean | null
  onToggleFavorite: () => void
}

function HomeItemCard({ item, favorited, motionIndex, reduceMotion, onToggleFavorite }: HomeItemCardProps) {
  return (
    <motion.article
      className="favorite-card home-item-card"
      initial={reduceMotion ? false : { opacity: 0, y: 18, rotate: -0.45 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.34, delay: 0.48 + motionIndex * 0.045, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4, rotate: motionIndex % 2 === 0 ? -0.25 : 0.25 }}
    >
      <button
        type="button"
        className={favorited ? 'heart-button active' : 'heart-button'}
        aria-label={favorited ? '取消收藏' : '收藏商品'}
        onClick={onToggleFavorite}
      >
        <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
      </button>
      <div className="favorite-image">
        <img src={item.coverImageUrl} alt={item.title} loading="lazy" />
      </div>
      <h2>{item.title}</h2>
      <strong>{formatPrice(item.priceCent)}</strong>
      <div className="seller-line">
        <span>{item.seller.nickname}</span>
        <CheckCircle2 size={15} />
        <em>{item.seller.verificationStatus === 'VERIFIED' ? '已认证' : '待认证'}</em>
        <b>{formatDelivery(item.deliveryModes)}</b>
      </div>
      <div className="home-item-meta">
        <span>{item.categoryName}</span>
        <span>{item.favoriteCount} 人关注</span>
      </div>
      <div className="card-actions home-card-actions">
        <a href={`/items/${item.id}`}>查看详情</a>
        <button type="button" onClick={onToggleFavorite}>
          {favorited ? '已收藏' : '收藏'}
        </button>
      </div>
    </motion.article>
  )
}

interface HomePanelProps {
  title: string
  action?: string
  children: ReactNode
}

function HomePanel({ title, action, children }: HomePanelProps) {
  return (
    <section className="home-panel">
      <header>
        <h2>{title}</h2>
        {action ? (
          <a href="/demands">
            {action}
            <ChevronRight size={16} />
          </a>
        ) : (
          <Megaphone size={19} />
        )}
      </header>
      {children}
    </section>
  )
}

function filterBySection(item: ItemSummary, section: SectionTab) {
  if (section === '教材专区') {
    return item.categoryName === '教材'
  }

  if (section === '数码好物') {
    return item.categoryName === '数码'
  }

  if (section === '宿舍补给') {
    return item.categoryName === '宿舍用品'
  }

  return true
}

function formatPrice(priceCent: number) {
  return `¥${(priceCent / 100).toFixed(2)}`
}

function formatDelivery(deliveryModes: ItemSummary['deliveryModes']) {
  if (deliveryModes.includes('SELF_PICKUP')) {
    return '可自提'
  }

  return '可配送'
}
