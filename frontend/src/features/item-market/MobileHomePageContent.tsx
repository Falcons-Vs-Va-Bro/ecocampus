import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Megaphone,
  PackagePlus,
  RefreshCw,
  ShoppingBasket,
  SlidersHorizontal,
} from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ItemSummary } from '../../api/item.api'
import emptyFavoritesImage from '../../assets/favorites/empty-favorites.webp'
import {
  deliveryModes,
  demandHighlights,
  displayCategoryName,
  formatDelivery,
  formatPrice,
  hotCategories,
  priceRanges,
  sectionTabs,
  type DeliveryModeFilter,
  type PriceRange,
  type SectionTab,
} from './homePageConfig'
import './MobileHomePage.css'

interface MobileHomePageContentProps {
  allItemsCount: number
  category: string
  categoryFilters: string[]
  currentPage: number
  deliveryMode: DeliveryModeFilter
  favoriteIds: Set<number>
  filteredCount: number
  hasInvalidItemsResponse: boolean
  hasItemsError: boolean
  isFiltersOpen: boolean
  isLoading: boolean
  items: ItemSummary[]
  onCategoryChange: (value: string) => void
  onDeliveryModeChange: (value: DeliveryModeFilter) => void
  onFiltersToggle: () => void
  onPageChange: (value: number) => void
  onPriceRangeChange: (value: PriceRange) => void
  onRetry: () => void
  onSectionChange: (value: SectionTab) => void
  onToggleFavorite: (itemId: number) => void
  pageCount: number
  priceRange: PriceRange
  reduceMotion: boolean | null
  section: SectionTab
}

export function MobileHomePageContent({
  allItemsCount,
  category,
  categoryFilters,
  currentPage,
  deliveryMode,
  favoriteIds,
  filteredCount,
  hasInvalidItemsResponse,
  hasItemsError,
  isFiltersOpen,
  isLoading,
  items,
  onCategoryChange,
  onDeliveryModeChange,
  onFiltersToggle,
  onPageChange,
  onPriceRangeChange,
  onRetry,
  onSectionChange,
  onToggleFavorite,
  pageCount,
  priceRange,
  reduceMotion,
  section,
}: MobileHomePageContentProps) {
  const activeFilterCount = Number(category !== '全部') + Number(priceRange.label !== '全部') + Number(deliveryMode !== '全部')

  return (
    <div className="mobile-home-page">
      <section className="mobile-home-quick-actions" aria-label="快捷发布">
        <Link to="/publish">
          <PackagePlus size={22} />
          <span><strong>发布闲置</strong><small>让好物继续流转</small></span>
        </Link>
        <Link to="/orders/purchase/demand/new">
          <ShoppingBasket size={22} />
          <span><strong>发布求购</strong><small>告诉同学你想要什么</small></span>
        </Link>
      </section>

      <nav className="mobile-home-section-tabs" aria-label="首页商品分区">
        {sectionTabs.map((item) => (
          <button
            className={section === item ? 'active' : undefined}
            type="button"
            aria-pressed={section === item}
            onClick={() => onSectionChange(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="mobile-home-filter-bar">
        <div>
          <strong>{section}</strong>
          <span>{filteredCount || allItemsCount} 件</span>
        </div>
        <button type="button" aria-expanded={isFiltersOpen} onClick={onFiltersToggle}>
          <SlidersHorizontal size={17} />
          筛选
          {activeFilterCount > 0 ? <b>{activeFilterCount}</b> : null}
        </button>
      </div>

      {isFiltersOpen ? (
        <section className="mobile-home-filters" aria-label="移动端商品筛选">
          <MobileFilterGroup label="分类">
            {categoryFilters.map((item) => (
              <button
                className={category === item ? 'selected' : undefined}
                type="button"
                onClick={() => onCategoryChange(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </MobileFilterGroup>
          <MobileFilterGroup label="价格">
            {priceRanges.map((item) => (
              <button
                className={priceRange.label === item.label ? 'selected' : undefined}
                type="button"
                onClick={() => onPriceRangeChange(item)}
                key={item.label}
              >
                {item.label}
              </button>
            ))}
          </MobileFilterGroup>
          <MobileFilterGroup label="取货">
            {deliveryModes.map((item) => (
              <button
                className={deliveryMode === item ? 'selected' : undefined}
                type="button"
                onClick={() => onDeliveryModeChange(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </MobileFilterGroup>
        </section>
      ) : null}

      {isLoading ? (
        <div className="mobile-home-product-grid" aria-label="商品加载中">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="mobile-home-card mobile-home-card--skeleton" key={index}>
              <span /><span /><span />
            </div>
          ))}
        </div>
      ) : null}

      {hasItemsError ? (
        <section className="mobile-home-state">
          <img src={emptyFavoritesImage} alt="" aria-hidden="true" />
          <strong>商品加载失败</strong>
          <p>{hasInvalidItemsResponse ? '接口数据格式不正确，请稍后再试。' : '请确认 mock 模式或后端接口可用。'}</p>
          <button type="button" onClick={onRetry}><RefreshCw size={16} />重新加载</button>
        </section>
      ) : null}

      {!isLoading && !hasItemsError && items.length === 0 ? (
        <section className="mobile-home-state">
          <img src={emptyFavoritesImage} alt="" aria-hidden="true" />
          <strong>暂无符合条件的商品</strong>
          <p>换个分类、价格或关键词再试试。</p>
        </section>
      ) : null}

      {!isLoading && !hasItemsError && items.length > 0 ? (
        <div className="mobile-home-product-grid">
          {items.map((item, index) => {
            const favorited = favoriteIds.has(item.id) || item.favorited
            return (
              <MobileHomeItemCard
                favorited={favorited}
                index={index}
                item={item}
                onToggleFavorite={() => onToggleFavorite(item.id)}
                reduceMotion={reduceMotion}
                key={item.id}
              />
            )
          })}
        </div>
      ) : null}

      {!isLoading && !hasItemsError && items.length > 0 ? (
        <nav className="mobile-home-pagination" aria-label="首页分页">
          <button type="button" disabled={currentPage <= 1} onClick={() => onPageChange(Math.max(1, currentPage - 1))}>
            <ChevronLeft size={17} />上一页
          </button>
          <span>{currentPage} / {pageCount}</span>
          <button type="button" disabled={currentPage >= pageCount} onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}>
            下一页<ChevronRight size={17} />
          </button>
        </nav>
      ) : null}

      <section className="mobile-home-info-panel">
        <header>
          <div><ShoppingBasket size={19} /><h2>同学正在求购</h2></div>
          <Link to="/orders/purchase/demand">更多</Link>
        </header>
        <div className="mobile-home-demand-list">
          {demandHighlights.map((item) => (
            <Link to="/orders/purchase/demand" key={item.title}>
              <span>求</span>
              <div><strong>{item.title}</strong><small>{item.meta}</small></div>
              <ChevronRight size={16} />
            </Link>
          ))}
        </div>
      </section>

      <section className="mobile-home-info-panel">
        <header>
          <div><Megaphone size={18} /><h2>热门类目</h2></div>
          <Link to="/items">全部</Link>
        </header>
        <div className="mobile-home-hot-grid">
          {hotCategories.map((item) => (
            <Link to={item.to} key={item.label}>
              <item.icon size={23} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <details className="mobile-home-safety">
        <summary>校园交易安全提示</summary>
        <ul>
          <li>优先选择校内自提，确认商品后再交易。</li>
          <li>谨防校外转账、冒充同学和虚假链接。</li>
          <li>严禁发布违法违规或危险物品。</li>
        </ul>
      </details>
    </div>
  )
}

interface MobileFilterGroupProps {
  children: ReactNode
  label: string
}

function MobileFilterGroup({ children, label }: MobileFilterGroupProps) {
  return <div className="mobile-home-filter-group"><strong>{label}</strong><div>{children}</div></div>
}

interface MobileHomeItemCardProps {
  favorited: boolean
  index: number
  item: ItemSummary
  onToggleFavorite: () => void
  reduceMotion: boolean | null
}

function MobileHomeItemCard({ favorited, index, item, onToggleFavorite, reduceMotion }: MobileHomeItemCardProps) {
  return (
    <motion.article
      className="mobile-home-card"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.04 + index * 0.035 }}
    >
      <button
        className={favorited ? 'mobile-home-heart active' : 'mobile-home-heart'}
        type="button"
        aria-label={favorited ? '取消收藏' : '收藏商品'}
        onClick={onToggleFavorite}
      >
        <Heart size={17} fill={favorited ? 'currentColor' : 'none'} />
      </button>
      <Link to={`/items/${item.id}`}>
        <div className="mobile-home-card-image">
          {item.coverImageUrl ? (
            <img
              src={item.coverImageUrl}
              alt={item.title}
              loading={index < 4 ? 'eager' : 'lazy'}
              decoding="async"
              width="320"
              height="240"
            />
          ) : <span>待上传</span>}
          <em>{displayCategoryName(item.categoryName)}</em>
        </div>
        <h2>{item.title}</h2>
        <div className="mobile-home-card-price">
          <strong>{formatPrice(item.priceCent)}</strong>
          <span>{formatDelivery(item.deliveryModes)}</span>
        </div>
        <div className="mobile-home-card-seller">
          <span>{item.seller.nickname}</span>
          <CheckCircle2 size={13} />
          <em>{item.seller.verificationStatus === 'VERIFIED' ? '已认证' : '待认证'}</em>
          <small>{item.favoriteCount}人关注</small>
        </div>
      </Link>
    </motion.article>
  )
}
