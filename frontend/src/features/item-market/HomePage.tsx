import { useQuery } from '@tanstack/react-query'
import {
  BookOpen,
  BriefcaseBusiness,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Megaphone,
  Package,
  ShoppingBasket,
  Star,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { listCategories } from '../../api/category.api'
import { listItems } from '../../api/item.api'
import type { ItemSummary } from '../../api/item.api'
import { queryKeys } from '../../api/queryKeys'
import emptyFavoritesImage from '../../assets/favorites/empty-favorites.png'
import { MarketplaceItemCard, MarketplaceShell } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
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
    const categories = categoriesQuery.data?.data
    const apiCategories = Array.isArray(categories) ? categories.map((item) => item.name) : []
    return ['全部', ...apiCategories]
  }, [categoriesQuery.data?.data])

  const itemPage = itemsQuery.data?.data
  const hasInvalidItemsResponse = itemsQuery.isSuccess && !Array.isArray(itemPage?.items)
  const hasItemsError = itemsQuery.isError || hasInvalidItemsResponse
  const allItems = Array.isArray(itemPage?.items) ? itemPage.items : emptyItems

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
    <MarketplaceShell
      activeCategoryLabel="首页"
      keyword={keyword}
      mainClassName="home-main"
      onKeywordChange={(value) => resetPage(() => setKeyword(value))}
      onSearch={() => setPage(1)}
      searchLabel="搜索商品"
      shellClassName="home-shell"
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

          {hasItemsError ? (
            <div className="favorites-empty-state compact">
              <span className="painted-asset painted-asset--empty-inline">
                <img src={emptyFavoritesImage} alt="" aria-hidden="true" />
              </span>
              <h2>商品加载失败</h2>
              <p>{hasInvalidItemsResponse ? '接口返回的数据格式不正确，请稍后重试。' : '请确认已启用 mock 模式或后端接口可用。'}</p>
              <button type="button" onClick={() => itemsQuery.refetch()}>
                重新加载
              </button>
            </div>
          ) : null}

          {!itemsQuery.isLoading && !hasItemsError && visibleItems.length === 0 ? (
            <div className="favorites-empty-state compact">
              <span className="painted-asset painted-asset--empty-inline">
                <img src={emptyFavoritesImage} alt="" aria-hidden="true" />
              </span>
              <h2>暂无符合条件的商品</h2>
              <p>换个分类、价格或关键词再试试。</p>
            </div>
          ) : null}

          {!itemsQuery.isLoading && !hasItemsError && visibleItems.length > 0 ? (
            <div className="favorites-card-grid">
              {visibleItems.map((item, index) => {
                const favorited = favoriteIds.has(item.id) || item.favorited

                return (
                  <MarketplaceItemCard
                    actions={
                      <div className="card-actions home-card-actions">
                        <a href={`/items/${item.id}`}>查看详情</a>
                        <button type="button" onClick={() => toggleFavorite(item.id)}>
                          {favorited ? '已收藏' : '收藏'}
                        </button>
                      </div>
                    }
                    className="home-item-card"
                    coverImageUrl={item.coverImageUrl}
                    deliveryText={formatDelivery(item.deliveryModes)}
                    favoriteActive={favorited}
                    favoriteLabel={favorited ? '取消收藏' : '收藏商品'}
                    meta={
                      <div className="home-item-meta">
                        <span>{item.categoryName}</span>
                        <span>{item.favoriteCount} 人关注</span>
                      </div>
                    }
                    motionIndex={index}
                    onFavoriteClick={() => toggleFavorite(item.id)}
                    priceLabel={formatPrice(item.priceCent)}
                    reduceMotion={shouldReduceMotion}
                    sellerName={item.seller.nickname}
                    title={item.title}
                    verificationText={item.seller.verificationStatus === 'VERIFIED' ? '已认证' : '待认证'}
                    key={item.id}
                  />
                )
              })}
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
              <button type="button" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} aria-label="下一页">
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
    </MarketplaceShell>
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
