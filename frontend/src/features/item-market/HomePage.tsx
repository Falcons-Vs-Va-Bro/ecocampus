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
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  User,
} from 'lucide-react'
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
import './HomePage.css'

const pageSize = 8
const emptyItems: ItemSummary[] = []

const tabs = ['今日推荐', '最新上架', '教材专区', '数码好物', '宿舍补给'] as const
const priceRanges = [
  { label: '全部', min: 0, max: Number.POSITIVE_INFINITY },
  { label: '0-50', min: 0, max: 5000 },
  { label: '50-100', min: 5000, max: 10000 },
  { label: '100-300', min: 10000, max: 30000 },
  { label: '300以上', min: 30000, max: Number.POSITIVE_INFINITY },
]
const deliveryModes = ['全部', '可自提', '校内配送'] as const

const categoryNav = [
  { label: '首页', icon: Home, to: '/', active: true },
  { label: '全部分类', icon: Grid3X3, to: '/items' },
  { label: '教材教辅', icon: BookOpen, to: '/items' },
  { label: '数码电子', icon: Camera, to: '/items' },
  { label: '宿舍用品', icon: Package, to: '/items' },
  { label: '运动户外', icon: Dumbbell, to: '/items' },
  { label: '生活日用', icon: ShoppingCart, to: '/items' },
  { label: '美妆个护', icon: Sparkles, to: '/items' },
  { label: '乐器文具', icon: BookOpen, to: '/items' },
  { label: '票务转让', icon: ClipboardList, to: '/items' },
  { label: '其他', icon: Box, to: '/items' },
]

const userNav = [
  { label: '我的收藏', icon: Star, to: '/favorites' },
  { label: '我的发布', icon: Store, to: '/items/mine' },
  { label: '购买订单', icon: ClipboardList, to: '/orders' },
  { label: '出售订单', icon: BriefcaseBusiness, to: '/orders' },
  { label: '消息中心', icon: MessageCircle, to: '/messages', badge: 3 },
  { label: '个人中心', icon: User, to: '/profile' },
]

const demandHighlights = [
  { title: '求购 高等数学(第七版)下册', meta: '学号 103****5123 · 5 分钟前' },
  { title: '求购 iPad 或手提电脑', meta: '学号 105****3321 · 12 分钟前' },
  { title: '求购 篮球鞋 42码左右', meta: '学号 104****7788 · 18 分钟前' },
]

const hotCategories = [
  { label: '教材教辅', icon: BookOpen },
  { label: '数码电子', icon: Camera },
  { label: '宿舍用品', icon: Package },
  { label: '生活日用', icon: ShoppingCart },
  { label: '运动户外', icon: Dumbbell },
  { label: '美妆个护', icon: Sparkles },
]

type Tab = (typeof tabs)[number]
type DeliveryModeFilter = (typeof deliveryModes)[number]

export function HomePage() {
  useDocumentTitle('厦大闲置 - 商品首页')

  const [keyword, setKeyword] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('今日推荐')
  const [category, setCategory] = useState('全部')
  const [priceRange, setPriceRange] = useState(priceRanges[0])
  const [deliveryMode, setDeliveryMode] = useState<DeliveryModeFilter>('全部')
  const [page, setPage] = useState(1)
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => new Set([1002]))

  const itemsQuery = useQuery({
    queryKey: queryKeys.items.list('home'),
    queryFn: () => listItems({ page: 1, size: 80 }),
  })

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list,
    queryFn: listCategories,
  })

  const allItems = itemsQuery.data?.data.items ?? emptyItems
  const categoryFilters = useMemo(() => {
    const names = categoriesQuery.data?.data.map((item) => displayCategoryName(item.name)) ?? []
    return ['全部', ...names]
  }, [categoriesQuery.data?.data])

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return allItems
      .filter((item) => filterByTab(item, activeTab))
      .filter((item) => (category === '全部' ? true : displayCategoryName(item.categoryName) === category))
      .filter((item) => item.priceCent >= priceRange.min && item.priceCent < priceRange.max)
      .filter((item) => {
        if (deliveryMode === '可自提') {
          return item.deliveryModes.includes('SELF_PICKUP')
        }

        if (deliveryMode === '校内配送') {
          return item.deliveryModes.includes('DELIVER_TO_SCHOOL')
        }

        return true
      })
      .filter((item) => {
        if (!normalizedKeyword) {
          return true
        }

        return `${item.title} ${displayCategoryName(item.categoryName)} ${item.seller.nickname}`.toLowerCase().includes(normalizedKeyword)
      })
      .sort((a, b) => {
        if (activeTab === '最新上架') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }

        return a.id - b.id
      })
  }, [activeTab, allItems, category, deliveryMode, keyword, priceRange])

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function resetPage(action: () => void) {
    action()
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
    <div className="market-page">
      <header className="market-topbar">
        <a className="market-brand" href="/">
          <img src={campusGateImage} alt="" aria-hidden="true" />
          <span>
            <strong>厦大闲置</strong>
            <small>厦门大学校园二手交易平台</small>
          </span>
        </a>

        <form
          className="market-search"
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

        <div className="market-userbar" aria-label="用户快捷入口">
          <IconNotice label="通知" count={3}>
            <Bell size={25} />
          </IconNotice>
          <IconNotice label="私信" count={2}>
            <Mail size={26} />
          </IconNotice>
          <button type="button" className="profile-button">
            <span className="avatar">海</span>
            <strong>海风吹过嘉庚楼</strong>
            <em>学生</em>
            <ChevronDown size={17} />
          </button>
        </div>
      </header>

      <div className="market-layout">
        <aside className="market-sidebar">
          <nav className="market-nav" aria-label="商品分类">
            {categoryNav.map((item) => (
              <a className={item.active ? 'active' : undefined} href={item.to} key={item.label}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <nav className="market-nav market-nav-user" aria-label="个人中心">
            {userNav.map((item) => (
              <a href={item.to} key={item.label}>
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.badge ? <b>{item.badge}</b> : null}
              </a>
            ))}
          </nav>

          <img className="sidebar-sketch" src={campusSidebarImage} alt="" aria-hidden="true" />
        </aside>

        <main className="market-main">
          <section className="feed-heading">
            <h1>今日推荐</h1>
            <div className="feed-tabs" role="tablist" aria-label="商品分区">
              {tabs.map((tab) => (
                <button
                  className={activeTab === tab ? 'active' : undefined}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => resetPage(() => setActiveTab(tab))}
                  key={tab}
                >
                  {tab}
                </button>
              ))}
            </div>
          </section>

          <section className="feed-content">
            <div className="feed-column">
              <div className="filter-panel" aria-label="首页筛选">
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

                <FilterRow label="取货">
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

              <div className="feed-toolbar">
                <span>共 {filteredItems.length || allItems.length} 条商品</span>
                <button type="button">
                  默认排序
                  <ChevronDown size={16} />
                </button>
              </div>

              {itemsQuery.isLoading ? (
                <div className="product-grid" aria-label="商品加载中">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div className="product-card skeleton" key={index}>
                      <div />
                      <span />
                      <span />
                    </div>
                  ))}
                </div>
              ) : null}

              {itemsQuery.isError ? (
                <EmptyState title="商品加载失败" action="重新加载" onClick={() => itemsQuery.refetch()} />
              ) : null}

              {!itemsQuery.isLoading && !itemsQuery.isError && visibleItems.length === 0 ? (
                <EmptyState title="暂无符合条件的商品" description="换个分类、价格或关键词再试试。" />
              ) : null}

              {!itemsQuery.isLoading && !itemsQuery.isError && visibleItems.length > 0 ? (
                <div className="product-grid">
                  {visibleItems.map((item) => (
                    <ProductCard
                      item={item}
                      favorited={favoriteIds.has(item.id) || item.favorited}
                      onToggleFavorite={() => toggleFavorite(item.id)}
                      key={item.id}
                    />
                  ))}
                </div>
              ) : null}

              <footer className="feed-pagination" aria-label="首页分页">
                <span>共 {filteredItems.length} 条商品</span>
                <div>
                  <button type="button" onClick={() => setPage(Math.max(1, currentPage - 1))} aria-label="上一页">
                    <ChevronLeft size={17} />
                  </button>
                  {Array.from({ length: Math.min(pageCount, 4) }).map((_, index) => {
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
                  <span>...</span>
                  <button type="button" onClick={() => setPage(pageCount)}>
                    {Math.max(16, pageCount)}
                  </button>
                  <button type="button" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} aria-label="下一页">
                    <ChevronRight size={17} />
                  </button>
                </div>
                <button type="button" className="page-size-button">
                  8 条/页
                  <ChevronDown size={15} />
                </button>
              </footer>
            </div>

            <aside className="right-column" aria-label="首页辅助信息">
              <section className="quick-actions">
                <a href="/publish">
                  <BriefcaseBusiness size={34} />
                  <span>
                    <strong>发布闲置</strong>
                    <small>出售闲置物品</small>
                  </span>
                </a>
                <a href="/demands/new">
                  <ShoppingCart size={35} />
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
                      <span className="avatar mini">求</span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.meta}</small>
                      </span>
                    </a>
                  ))}
                </div>
              </HomePanel>

              <HomePanel title="热门类目" action="更多">
                <div className="hot-grid">
                  {hotCategories.map((item) => (
                    <a href="/items" key={item.label}>
                      <item.icon size={31} />
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
        </main>
      </div>
    </div>
  )
}

function IconNotice({ label, count, children }: { label: string; count: number; children: ReactNode }) {
  return (
    <button type="button" className="notice-button" aria-label={label}>
      {children}
      <span>{count}</span>
    </button>
  )
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="filter-row">
      <span>{label}:</span>
      <div>{children}</div>
    </div>
  )
}

function ProductCard({ item, favorited, onToggleFavorite }: { item: ItemSummary; favorited: boolean; onToggleFavorite: () => void }) {
  return (
    <article className="product-card">
      <button
        type="button"
        className={favorited ? 'heart-button active' : 'heart-button'}
        aria-label={favorited ? '取消收藏' : '收藏商品'}
        onClick={onToggleFavorite}
      >
        <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
      </button>
      <a className="product-image" href={`/items/${item.id}`}>
        <img src={item.coverImageUrl} alt={item.title} loading="lazy" />
      </a>
      <h2>{item.title}</h2>
      <strong>{formatPrice(item.priceCent)}</strong>
      <div className="seller-line">
        <span>{item.seller.nickname}</span>
        <CheckCircle2 size={15} />
        <em>{item.seller.verificationStatus === 'VERIFIED' ? '已认证' : '待认证'}</em>
      </div>
      <div className="delivery-tags">
        {item.deliveryModes.includes('SELF_PICKUP') ? <span>可自提</span> : null}
        {item.deliveryModes.includes('DELIVER_TO_SCHOOL') ? <span>可配送</span> : null}
      </div>
    </article>
  )
}

function HomePanel({ title, action, children }: { title: string; action?: string; children: ReactNode }) {
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

function EmptyState({ title, description, action, onClick }: { title: string; description?: string; action?: string; onClick?: () => void }) {
  return (
    <div className="empty-state">
      <img src={emptyFavoritesImage} alt="" aria-hidden="true" />
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action ? (
        <button type="button" onClick={onClick}>
          {action}
        </button>
      ) : null}
    </div>
  )
}

function filterByTab(item: ItemSummary, tab: Tab) {
  const categoryName = displayCategoryName(item.categoryName)

  if (tab === '教材专区') {
    return categoryName === '教材教辅'
  }

  if (tab === '数码好物') {
    return categoryName === '数码电子'
  }

  if (tab === '宿舍补给') {
    return categoryName === '宿舍用品'
  }

  return true
}

function displayCategoryName(categoryName: string) {
  const map: Record<string, string> = {
    教材: '教材教辅',
    数码: '数码电子',
  }

  return map[categoryName] ?? categoryName
}

function formatPrice(priceCent: number) {
  return `¥${(priceCent / 100).toFixed(2)}`
}
