import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  MessageCircle,
  Package,
  PackageSearch,
  Pencil,
  Search,
  ShoppingBasket,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  User,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { favoriteItem, listMyFavorites, unfavoriteItem } from '../../api/favorite.api'
import { listItems } from '../../api/item.api'
import type { ItemSummary } from '../../api/item.api'
import { queryKeys } from '../../api/queryKeys'
import { useUnreadMessageCount } from '../../hooks/useUnreadMessageCount'
import campusGateImage from '../../assets/favorites/campus-gate.webp'
import campusSidebarImage from '../../assets/favorites/campus-sidebar.webp'
import emptyFavoritesImage from '../../assets/favorites/empty-favorites.webp'
import { UnifiedMarketplacePage } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import './HomePage.css'
import './ItemsPage.css'

const pageSize = 8
const emptyItems: ItemSummary[] = []
const sortOptions = [
  { value: 'newest', label: '最新发布' },
  { value: 'price-low', label: '价格从低到高' },
  { value: 'price-high', label: '价格从高到低' },
  { value: 'popular', label: '关注度最高' },
] as const

type SortMode = (typeof sortOptions)[number]['value']

const categoryRoutes = [
  { label: '全部', sidebarLabel: '全部分类', icon: Grid3X3, to: '/items' },
  { label: '教材教辅', sidebarLabel: '教材教辅', icon: BookOpen, to: '/items/textbook' },
  { label: '数码电子', sidebarLabel: '数码电子', icon: Camera, to: '/items/digital' },
  { label: '宿舍用品', sidebarLabel: '宿舍用品', icon: Package, to: '/items/dorm' },
  { label: '运动户外', sidebarLabel: '运动户外', icon: Dumbbell, to: '/items/outdoors' },
  { label: '生活日用', sidebarLabel: '生活日用', icon: ShoppingBasket, to: '/items/daily-goods' },
  { label: '美妆个护', sidebarLabel: '美妆个护', icon: Sparkles, to: '/items/make-up' },
  { label: '乐器文具', sidebarLabel: '乐器文具', icon: Pencil, to: '/items/instruments' },
  { label: '票务转让', sidebarLabel: '票务转让', icon: ClipboardList, to: '/items/tickets' },
  { label: '其他', sidebarLabel: '其他', icon: Box, to: '/items/others' },
] as const

const priceRanges = [
  { label: '全部', min: 0, max: Number.POSITIVE_INFINITY },
  { label: '0-50', min: 0, max: 5000 },
  { label: '50-100', min: 5000, max: 10000 },
  { label: '100-300', min: 10000, max: 30000 },
  { label: '300以上', min: 30000, max: Number.POSITIVE_INFINITY },
] as const

const pickupModes = ['全部', '可自提', '校内配送'] as const

const userNav = [
  { label: '我的收藏', icon: Star, to: '/favorites' },
  { label: '我的发布', icon: Store, to: '/items/mine' },
  { label: '购买订单', icon: ClipboardList, to: '/orders/purchase' },
  { label: '出售订单', icon: BriefcaseBusiness, to: '/orders/sale' },
  { label: '消息中心', icon: MessageCircle, to: '/messages' },
  { label: '个人中心', icon: User, to: '/profile' },
]

type PriceRange = { label: string; min: number; max: number }
type PickupMode = (typeof pickupModes)[number]

export function ItemsPage() {
  const queryClient = useQueryClient()
  const unreadMessageCount = useUnreadMessageCount()
  const location = useLocation()
  const routeCategory = categoryRoutes.find((item) => item.to === location.pathname)?.label ?? '全部'
  const pageTitle = routeCategory === '全部' ? '全部商品' : routeCategory
  useDocumentTitle(`厦大闲置 - ${pageTitle}`)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<string>(routeCategory)
  const [priceRange, setPriceRange] = useState<PriceRange>(priceRanges[0])
  const [pickupMode, setPickupMode] = useState<PickupMode>('全部')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setCategory(routeCategory)
    setPage(1)
  }, [routeCategory])

  const itemsQuery = useQuery({
    queryKey: queryKeys.items.list('items'),
    queryFn: () => listItems({ page: 1, size: 80 }),
  })

  const favoritesQuery = useQuery({
    queryKey: queryKeys.favorites.mine,
    queryFn: () => listMyFavorites({ page: 1, size: 200 }),
  })

  const favoriteIds = useMemo(
    () => new Set((favoritesQuery.data?.data.items ?? []).map((item) => item.id)),
    [favoritesQuery.data?.data.items],
  )

  const favoriteMutation = useMutation({
    mutationFn: ({ itemId, favorited }: { itemId: number; favorited: boolean }) =>
      favorited ? unfavoriteItem(itemId) : favoriteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.mine })
    },
  })

  const allItems = itemsQuery.data?.data.items ?? emptyItems
  const sourceItems = allItems
  const categoryOptions = routeCategory === '全部' ? categoryRoutes.map((item) => item.label) : [routeCategory]
  const priceOptions = priceRanges
  const helperTags = ['教材', '数码', '台灯', '篮球', '收纳']
  const helperStats = {
    today: sourceItems.filter((item) => isSameLocalDate(item.createdAt, new Date())).length,
    cheap: sourceItems.filter((item) => item.priceCent <= 5000).length,
  }
  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return sourceItems
      .filter((item) => {
        if (category === '全部') {
          return true
        }

        return displayCategoryName(item.categoryName) === category
      })
      .filter((item) => item.priceCent >= priceRange.min && item.priceCent < priceRange.max)
      .filter((item) => {
        if (pickupMode === '可自提') {
          return item.deliveryModes.includes('SELF_PICKUP')
        }

        if (pickupMode === '校内配送') {
          return item.deliveryModes.includes('DELIVER_TO_SCHOOL')
        }

        return true
      })
      .filter((item) => (verifiedOnly ? item.seller.verificationStatus === 'VERIFIED' : true))
      .filter((item) => {
        if (!normalizedKeyword) {
          return true
        }

        return `${item.title} ${displayCategoryName(item.categoryName)} ${item.seller.nickname}`.toLowerCase().includes(normalizedKeyword)
      })
      .sort((a, b) => compareItems(a, b, sortMode))
  }, [category, keyword, pickupMode, priceRange, sortMode, sourceItems, verifiedOnly])

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function resetPage(action: () => void) {
    action()
    setPage(1)
  }

  function toggleFavorite(itemId: number) {
    favoriteMutation.mutate({ itemId, favorited: favoriteIds.has(itemId) })
  }

  return (
    <UnifiedMarketplacePage
      activeCategoryLabel={categoryRoutes.find((item) => item.to === location.pathname)?.sidebarLabel ?? '全部分类'}
      keyword={keyword}
      onKeywordChange={(value) => resetPage(() => setKeyword(value))}
      onSearch={() => setPage(1)}
    >
      <div className="market-page items-page">
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
          <IconNotice label="通知" count={0}>
            <Bell size={25} />
          </IconNotice>
          <IconNotice label="私信" count={unreadMessageCount}>
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
            <a href="/">
              <Home size={20} />
              <span>首页</span>
            </a>
            {categoryRoutes.map((item) => (
              <a className={location.pathname === item.to ? 'active' : undefined} href={item.to} key={item.label}>
                <item.icon size={20} />
                <span>{item.sidebarLabel}</span>
              </a>
            ))}
          </nav>

          <nav className="market-nav market-nav-user" aria-label="个人中心">
            {userNav.map((item) => (
              <a href={item.to} key={item.label}>
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.to === '/messages' && unreadMessageCount > 0 ? <b>{unreadMessageCount}</b> : null}
              </a>
            ))}
          </nav>

          <img className="sidebar-sketch" src={campusSidebarImage} alt="" aria-hidden="true" />
        </aside>

        <main className="items-main">
          <section className="items-content">
            <div className="items-column">
              <div className="items-heading-row">
                <header className="items-heading">
                  <h1>{pageTitle}</h1>
                </header>
                <button
                  type="button"
                  className="items-mobile-filter-toggle"
                  aria-controls="items-filter-panel"
                  aria-expanded={filtersOpen}
                  onClick={() => setFiltersOpen((current) => !current)}
                >
                  <SlidersHorizontal size={17} />
                  {filtersOpen ? '收起筛选' : '筛选'}
                </button>
              </div>

              <section
                id="items-filter-panel"
                className={filtersOpen ? 'items-filter-panel mobile-open' : 'items-filter-panel'}
                aria-label="商品筛选"
              >
                <FilterRow label="分类">
                  {categoryOptions.map((item) => (
                    <button type="button" className={category === item ? 'selected' : undefined} onClick={() => resetPage(() => setCategory(item))} key={item}>
                      {item}
                    </button>
                  ))}
                </FilterRow>
                <FilterRow label="价格">
                  {priceOptions.map((item) => (
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
                  {pickupModes.map((item) => (
                    <button type="button" className={pickupMode === item ? 'selected' : undefined} onClick={() => resetPage(() => setPickupMode(item))} key={item}>
                      {item}
                    </button>
                  ))}
                </FilterRow>
              </section>

              <div className="items-toolbar">
                <div>
                  <span>为你找到 {filteredItems.length} 件在售闲置</span>
                  <label>
                    <input type="checkbox" checked={verifiedOnly} onChange={(event) => resetPage(() => setVerifiedOnly(event.target.checked))} />
                    只有已认证卖家
                    <CheckCircle2 size={17} />
                  </label>
                </div>
                <div>
                  <span>排序：</span>
                  <div className="items-sort-control">
                    <select
                      aria-label="商品排序方式"
                      value={sortMode}
                      onChange={(event) => resetPage(() => setSortMode(event.target.value as SortMode))}
                    >
                      {sortOptions.map((option) => (
                        <option value={option.value} key={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} />
                  </div>
                  <a href="/publish">
                    <Pencil size={18} />
                    发布闲置
                  </a>
                </div>
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

              {itemsQuery.isError ? <EmptyState title="商品加载失败" action="重新加载" onClick={() => itemsQuery.refetch()} /> : null}

              {!itemsQuery.isLoading && !itemsQuery.isError && visibleItems.length === 0 ? (
                <EmptyState title="暂无符合条件的商品" description="换个分类、价格或关键词再试试。" />
              ) : null}

              {!itemsQuery.isLoading && !itemsQuery.isError && visibleItems.length > 0 ? (
                <div className="product-grid items-product-grid">
                  {visibleItems.map((item) => (
                    <ProductCard
                      item={item}
                      favorited={favoriteIds.has(item.id)}
                      onToggleFavorite={() => toggleFavorite(item.id)}
                      key={item.id}
                    />
                  ))}
                </div>
              ) : null}

              <footer className="feed-pagination items-pagination" aria-label="商品分页">
                <span>共 {filteredItems.length} 件商品</span>
                <div>
                  <button type="button" onClick={() => setPage(Math.max(1, currentPage - 1))} aria-label="上一页">
                    <ChevronLeft size={17} />
                  </button>
                  {Array.from({ length: Math.min(pageCount, 3) }).map((_, index) => {
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

            <aside className="items-helper" aria-label="筛选小助手">
              <section className="helper-card">
                <h2>筛选小助手</h2>
                <div className="helper-illustration">
                  <PackageSearch size={136} />
                </div>
                <h3>热门搜索</h3>
                <div className="helper-tags">
                  {helperTags.map((item) => (
                    <button type="button" onClick={() => resetPage(() => setKeyword(item))} key={item}>
                      {item}
                    </button>
                  ))}
                </div>
                <div className="helper-stat">
                  <span>今日上新</span>
                  <button type="button">{helperStats.today} 件 <ChevronRight size={16} /></button>
                </div>
                <div className="helper-stat">
                  <span>低价好物</span>
                  <button type="button">{helperStats.cheap} 件 <ChevronRight size={16} /></button>
                </div>
              </section>
            </aside>
          </section>
        </main>
      </div>
      </div>
    </UnifiedMarketplacePage>
  )
}

function IconNotice({ label, count, children }: { label: string; count: number; children: ReactNode }) {
  return (
    <button type="button" className="notice-button" aria-label={label}>
      {children}
      {count > 0 ? <span>{count}</span> : null}
    </button>
  )
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="items-filter-row">
      <span>{label}：</span>
      <div>{children}</div>
    </div>
  )
}

function ProductCard({ item, favorited, onToggleFavorite }: { item: ItemSummary; favorited: boolean; onToggleFavorite: () => void }) {
  return (
    <article className="product-card items-product-card">
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
      <div className="items-card-footer">
        <div className="delivery-tags">
          {item.deliveryModes.includes('SELF_PICKUP') ? <span>可自提</span> : null}
          {item.deliveryModes.includes('DELIVER_TO_SCHOOL') ? <span>可配送</span> : null}
        </div>
        <a href={`/items/${item.id}`}>查看详情</a>
      </div>
    </article>
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

function displayCategoryName(categoryName: string) {
  const map: Record<string, string> = {
    教材: '教材教辅',
    数码: '数码电子',
  }

  return map[categoryName] ?? categoryName
}

function isSameLocalDate(value: string, reference: Date) {
  const date = new Date(value)
  return Number.isFinite(date.getTime())
    && date.getFullYear() === reference.getFullYear()
    && date.getMonth() === reference.getMonth()
    && date.getDate() === reference.getDate()
}

function formatPrice(priceCent: number) {
  return `¥${(priceCent / 100).toFixed(2)}`
}

function compareItems(a: ItemSummary, b: ItemSummary, sortMode: SortMode) {
  if (sortMode === 'price-low') {
    return a.priceCent - b.priceCent || compareNewest(a, b)
  }

  if (sortMode === 'price-high') {
    return b.priceCent - a.priceCent || compareNewest(a, b)
  }

  if (sortMode === 'popular') {
    return b.favoriteCount - a.favoriteCount || compareNewest(a, b)
  }

  return compareNewest(a, b)
}

function compareNewest(a: ItemSummary, b: ItemSummary) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}
