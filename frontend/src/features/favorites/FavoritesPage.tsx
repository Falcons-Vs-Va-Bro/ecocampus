import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { listMyFavorites, unfavoriteItem } from '../../api/favorite.api'
import type { FavoriteItemSummary } from '../../api/favorite.api'
import { queryKeys } from '../../api/queryKeys'
import emptyFavoritesImage from '../../assets/favorites/empty-favorites.webp'
import { MarketplaceItemCard, MarketplaceShell } from '../../components/marketplace'
import { listDemandFavorites, subscribeDemandFavorites, unfavoriteDemand } from '../orders/demandFavorites'

type FavoriteTab = 'items' | 'demands' | 'price'

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

type PickupMode = (typeof pickupModes)[number]

export function FavoritesPage() {
  const queryClient = useQueryClient()
  const shouldReduceMotion = useReducedMotion()
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('全部')
  const [priceRange, setPriceRange] = useState(priceRanges[0])
  const [pickupMode, setPickupMode] = useState<PickupMode>('全部')
  const [page, setPage] = useState(1)
  const [batchMode, setBatchMode] = useState(false)
  const [activeTab, setActiveTab] = useState<FavoriteTab>('items')
  const [, setDemandFavoriteVersion] = useState(0)

  useEffect(() => subscribeDemandFavorites(() => setDemandFavoriteVersion((value) => value + 1)), [])

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
  const demandFavorites = listDemandFavorites()

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
    <MarketplaceShell
      activeUserLabel="我的收藏"
      keyword={keyword}
      onKeywordChange={(value) => resetPage(() => setKeyword(value))}
      onSearch={() => setPage(1)}
      searchLabel="搜索收藏商品"
    >
      <motion.section
        className="favorites-heading"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.26 }}
      >
        <h1>我的收藏</h1>
        <div className="favorite-tabs" role="tablist" aria-label="收藏类型">
          <button
            type="button"
            className={activeTab === 'items' ? 'active' : undefined}
            role="tab"
            aria-selected={activeTab === 'items'}
            onClick={() => setActiveTab('items')}
          >
            商品收藏（{allItems.length}）
          </button>
          <button
            type="button"
            className={activeTab === 'demands' ? 'active' : undefined}
            role="tab"
            aria-selected={activeTab === 'demands'}
            onClick={() => setActiveTab('demands')}
          >
            求购关注（{demandFavorites.length}）
          </button>
          <button
            type="button"
            className={activeTab === 'price' ? 'active' : undefined}
            role="tab"
            aria-selected={activeTab === 'price'}
            onClick={() => setActiveTab('price')}
          >
            降价提醒（0）
          </button>
        </div>
      </motion.section>

      <section className="favorites-content-grid">
        <div className="favorites-list-panel">
          {activeTab === 'items' ? <div className="filters-panel" aria-label="收藏筛选">
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
          </div> : null}

          {activeTab === 'items' ? <div className="favorites-toolbar">
            <label className="batch-toggle">
              <input type="checkbox" checked={batchMode} onChange={(event) => setBatchMode(event.target.checked)} />
              批量管理
            </label>
            <button type="button" className="sort-button">
              最新收藏
              <ChevronDown size={17} />
            </button>
          </div> : null}

          {activeTab === 'items' && favoritesQuery.isLoading ? (
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

          {activeTab === 'items' && favoritesQuery.isError ? (
            <div className="favorites-empty-state compact">
              <span className="painted-asset painted-asset--empty-inline">
                <img src={emptyFavoritesImage} alt="" aria-hidden="true" />
              </span>
              <h2>收藏加载失败</h2>
              <p>请确认已启用 mock 模式或后端接口可用。</p>
              <button type="button" onClick={() => favoritesQuery.refetch()}>
                重新加载
              </button>
            </div>
          ) : null}

          {activeTab === 'items' && !favoritesQuery.isLoading && !favoritesQuery.isError && visibleItems.length === 0 ? (
            <div className="favorites-empty-state compact">
              <span className="painted-asset painted-asset--empty-inline">
                <img src={emptyFavoritesImage} alt="" aria-hidden="true" />
              </span>
              <h2>没有符合条件的收藏</h2>
              <p>换个分类、价格或关键词再试试。</p>
            </div>
          ) : null}

          {activeTab === 'items' && !favoritesQuery.isLoading && !favoritesQuery.isError && visibleItems.length > 0 ? (
            <div className="favorites-card-grid">
              {visibleItems.map((item, index) => (
                <MarketplaceItemCard
                  actions={
                    <div className="card-actions">
                      <a href={`/items/${item.id}`}>联系卖家</a>
                      <button
                        type="button"
                        disabled={unfavoriteMutation.isPending}
                        onClick={() => unfavoriteMutation.mutate(item.id)}
                      >
                        取消收藏
                      </button>
                    </div>
                  }
                  checkbox={
                    <label className="card-checkbox" aria-label={`选择 ${item.title}`}>
                      <input type="checkbox" disabled={!batchMode} />
                    </label>
                  }
                  coverImageUrl={item.coverImageUrl}
                  deliveryText={formatDelivery(item.deliveryModes)}
                  favoriteLabel="已收藏"
                  onFavoriteClick={() => unfavoriteMutation.mutate(item.id)}
                  motionIndex={index}
                  priceLabel={formatPrice(item.priceCent)}
                  reduceMotion={shouldReduceMotion}
                  sellerName={item.seller.nickname}
                  title={item.title}
                  verificationText={item.seller.verificationStatus === 'VERIFIED' ? '已认证' : '待认证'}
                  key={item.id}
                />
              ))}
            </div>
          ) : null}

          {activeTab === 'demands' && demandFavorites.length === 0 ? (
            <div className="favorites-empty-state compact">
              <span className="painted-asset painted-asset--empty-inline">
                <img src={emptyFavoritesImage} alt="" aria-hidden="true" />
              </span>
              <h2>还没有关注求购</h2>
              <p>去求购广场看看同学们正在找什么，关注后会出现在这里。</p>
              <a className="favorites-empty-link" href="/orders/purchase/demand">
                去求购广场
              </a>
            </div>
          ) : null}

          {activeTab === 'demands' && demandFavorites.length > 0 ? (
            <div className="demand-follow-list">
              {demandFavorites.map((item) => (
                <article className="demand-follow-card" key={item.id}>
                  <img src={item.image} alt={item.title} />
                  <div>
                    <header>
                      <h2>{item.title}</h2>
                      <strong>{item.budget}</strong>
                    </header>
                    <p>期望分类：{item.category}</p>
                    <p>{item.description}</p>
                    <small>
                      发布者：{item.author} · {item.publishedAt}
                    </small>
                    <footer>
                      <a href={`/orders/purchase/demand/${item.id}/detail`}>查看详情</a>
                      <a href="/messages">联系发布者</a>
                      <button type="button" onClick={() => unfavoriteDemand(item.id)}>
                        取消关注
                      </button>
                    </footer>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {activeTab === 'price' ? (
            <div className="favorites-empty-state compact">
              <span className="painted-asset painted-asset--empty-inline">
                <img src={emptyFavoritesImage} alt="" aria-hidden="true" />
              </span>
              <h2>暂无降价提醒</h2>
              <p>收藏商品后，后续可以在这里查看价格变化。</p>
            </div>
          ) : null}

          {activeTab === 'items' ? <footer className="favorites-pagination" aria-label="收藏分页">
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
              <button type="button" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} aria-label="下一页">
                <ChevronRight size={18} />
              </button>
            </div>
            <button type="button" className="page-size-button">
              8 条/页
              <ChevronDown size={16} />
            </button>
          </footer> : null}
        </div>

        <aside className="expired-panel">
          <h2>已失效的收藏（{invalidItems.length}）</h2>
          <span className="painted-asset painted-asset--empty">
            <img className="empty-favorites-art" src={emptyFavoritesImage} alt="" loading="lazy" aria-hidden="true" />
          </span>
          <h3>暂无失效的收藏</h3>
          <p>已下架或不再可购买的商品会在这里展示</p>
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

function formatPrice(priceCent: number) {
  return `¥${(priceCent / 100).toFixed(2)}`
}

function formatDelivery(deliveryModes: FavoriteItemSummary['deliveryModes']) {
  if (deliveryModes.includes('SELF_PICKUP')) {
    return '可自提'
  }

  return '可配送'
}
