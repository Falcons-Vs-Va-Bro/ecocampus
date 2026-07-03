import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  BookOpen,
  Box,
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
  Search,
  ShoppingBasket,
  Star,
  Store,
  User,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import campusGateImage from '../../assets/favorites/campus-gate.png'
import campusSidebarImage from '../../assets/favorites/campus-sidebar.png'
import emptyFavoritesImage from '../../assets/favorites/empty-favorites.png'
import { listMyFavorites, unfavoriteItem } from '../../api/favorite.api'
import type { FavoriteItemSummary } from '../../api/favorite.api'
import { queryKeys } from '../../api/queryKeys'
import './FavoritesPage.css'

const pageSize = 8
const emptyFavorites: FavoriteItemSummary[] = []

const categories = ['全部', '教材', '数码', '宿舍用品', '运动户外', '生活日用', '其他']
const priceRanges = [
  { label: '全部', min: 0, max: Number.POSITIVE_INFINITY },
  { label: '0-50', min: 0, max: 5000 },
  { label: '50-100', min: 5000, max: 10000 },
  { label: '100-300', min: 10000, max: 30000 },
  { label: '300以上', min: 30000, max: Number.POSITIVE_INFINITY },
]
const pickupModes = ['全部', '可自提', '仅配送'] as const

const categoryNav = [
  { label: '首页', icon: Home, to: '/' },
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
  { label: '我的收藏', icon: Star, active: true },
  { label: '我的发布', icon: Store },
  { label: '购买订单', icon: ClipboardList },
  { label: '出售订单', icon: Store },
  { label: '消息中心', icon: MessageCircle, badge: 3 },
  { label: '个人中心', icon: User },
]

type PickupMode = (typeof pickupModes)[number]

export function FavoritesPage() {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('全部')
  const [priceRange, setPriceRange] = useState(priceRanges[0])
  const [pickupMode, setPickupMode] = useState<PickupMode>('全部')
  const [page, setPage] = useState(1)
  const [batchMode, setBatchMode] = useState(false)

  const favoritesQuery = useQuery({
    queryKey: queryKeys.favorites.mine,
    queryFn: () => listMyFavorites({ page: 1, size: 50 }),
  })

  const unfavoriteMutation = useMutation({
    mutationFn: unfavoriteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.mine })
    },
  })

  const allItems = favoritesQuery.data?.data.items ?? emptyFavorites
  const invalidItems = allItems.filter((item) => item.status !== 'ON_SALE')

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return allItems
      .filter((item) => item.status === 'ON_SALE')
      .filter((item) => (category === '全部' ? true : item.categoryName === category))
      .filter((item) => {
        const price = item.priceCent
        return price >= priceRange.min && price < priceRange.max
      })
      .filter((item) => {
        if (pickupMode === '可自提') {
          return item.deliveryModes.includes('SELF_PICKUP')
        }

        if (pickupMode === '仅配送') {
          return !item.deliveryModes.includes('SELF_PICKUP') && item.deliveryModes.includes('DELIVER_TO_SCHOOL')
        }

        return true
      })
      .filter((item) => {
        if (!normalizedKeyword) {
          return true
        }

        return `${item.title} ${item.categoryName} ${item.seller.nickname}`.toLowerCase().includes(normalizedKeyword)
      })
  }, [allItems, category, keyword, pickupMode, priceRange])

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function resetPage(nextAction: () => void) {
    nextAction()
    setPage(1)
  }

  return (
    <div className="favorites-shell">
      <header className="favorites-topbar">
        <a className="favorites-logo" href="/">
          <img className="campus-gate-image" src={campusGateImage} alt="" aria-hidden="true" />
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
            aria-label="搜索收藏商品"
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
      </header>

      <div className="favorites-workspace">
        <aside className="favorites-sidebar">
          <nav className="nav-section" aria-label="商品分类">
            {categoryNav.map((item) => (
              <a key={item.label} href={item.to}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <nav className="nav-section user-routes" aria-label="个人中心">
            {userNav.map((item) => (
              <a className={item.active ? 'active' : undefined} href="/favorites" key={item.label}>
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.badge ? <b>{item.badge}</b> : null}
              </a>
            ))}
          </nav>

          <div className="campus-sketch" aria-hidden="true">
            <img src={campusSidebarImage} alt="" loading="lazy" />
          </div>
        </aside>

        <main className="favorites-main">
          <section className="favorites-heading">
            <h1>我的收藏</h1>
            <div className="favorite-tabs" role="tablist" aria-label="收藏类型">
              <button type="button" className="active" role="tab" aria-selected="true">
                商品收藏（{allItems.length}）
              </button>
              <button type="button" role="tab" aria-selected="false">
                求购关注（5）
              </button>
              <button type="button" role="tab" aria-selected="false">
                降价提醒（3）
              </button>
            </div>
          </section>

          <section className="favorites-content-grid">
            <div className="favorites-list-panel">
              <div className="filters-panel" aria-label="收藏筛选">
                <FilterRow label="分类">
                  {categories.map((item) => (
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
                  {pickupModes.map((item) => (
                    <button
                      type="button"
                      className={pickupMode === item ? 'selected' : undefined}
                      onClick={() => resetPage(() => setPickupMode(item))}
                      key={item}
                    >
                      {item}
                    </button>
                  ))}
                </FilterRow>
              </div>

              <div className="favorites-toolbar">
                <label className="batch-toggle">
                  <input
                    type="checkbox"
                    checked={batchMode}
                    onChange={(event) => setBatchMode(event.target.checked)}
                  />
                  批量管理
                </label>
                <button type="button" className="sort-button">
                  最新收藏
                  <ChevronDown size={17} />
                </button>
              </div>

              {favoritesQuery.isLoading ? (
                <div className="favorites-card-grid" aria-label="收藏加载中">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div className="favorite-card skeleton" key={index}>
                      <div />
                      <span />
                      <span />
                    </div>
                  ))}
                </div>
              ) : null}

              {favoritesQuery.isError ? (
                <div className="favorites-empty-state compact">
                  <img src={emptyFavoritesImage} alt="" aria-hidden="true" />
                  <h2>收藏加载失败</h2>
                  <p>请确认已启用 mock 模式或后端接口可用。</p>
                  <button type="button" onClick={() => favoritesQuery.refetch()}>
                    重新加载
                  </button>
                </div>
              ) : null}

              {!favoritesQuery.isLoading && !favoritesQuery.isError && visibleItems.length === 0 ? (
                <div className="favorites-empty-state compact">
                  <img src={emptyFavoritesImage} alt="" aria-hidden="true" />
                  <h2>没有符合条件的收藏</h2>
                  <p>换个分类、价格或关键词再试试。</p>
                </div>
              ) : null}

              {!favoritesQuery.isLoading && !favoritesQuery.isError && visibleItems.length > 0 ? (
                <div className="favorites-card-grid">
                  {visibleItems.map((item) => (
                    <FavoriteCard
                      item={item}
                      batchMode={batchMode}
                      isRemoving={unfavoriteMutation.isPending}
                      onRemove={() => unfavoriteMutation.mutate(item.id)}
                      key={item.id}
                    />
                  ))}
                </div>
              ) : null}

              <footer className="favorites-pagination" aria-label="收藏分页">
                <span>共 {allItems.length} 条收藏</span>
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

            <aside className="expired-panel">
              <h2>已失效的收藏（{invalidItems.length}）</h2>
              <img className="empty-favorites-art" src={emptyFavoritesImage} alt="" loading="lazy" aria-hidden="true" />
              <h3>暂无失效的收藏</h3>
              <p>已下架或不再可购买的商品会在这里展示</p>
            </aside>
          </section>
        </main>
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

interface FavoriteCardProps {
  item: FavoriteItemSummary
  batchMode: boolean
  isRemoving: boolean
  onRemove: () => void
}

function FavoriteCard({ item, batchMode, isRemoving, onRemove }: FavoriteCardProps) {
  return (
    <article className="favorite-card">
      <label className="card-checkbox" aria-label={`选择 ${item.title}`}>
        <input type="checkbox" disabled={!batchMode} />
      </label>
      <button type="button" className="heart-button" aria-label="已收藏">
        <Heart size={18} fill="currentColor" />
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
      <div className="card-actions">
        <a href={`/items/${item.id}`}>联系卖家</a>
        <button type="button" disabled={isRemoving} onClick={onRemove}>
          取消收藏
        </button>
      </div>
    </article>
  )
}

function formatPrice(priceCent: number) {
  return `¥${(priceCent / 100).toFixed(2)}`
}

function formatDelivery(deliveryModes: FavoriteItemSummary['deliveryModes']) {
  if (deliveryModes.includes('SELF_PICKUP')) {
    return '可自提'
  }

  return '可配送'
}
