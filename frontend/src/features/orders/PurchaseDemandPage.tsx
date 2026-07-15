import { useQuery } from '@tanstack/react-query'
import {
  AlarmClock,
  CalendarDays,
  ChevronDown,
  Heart,
  Handshake,
  MessageCircle,
  Search,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { Category } from '../../api/category.api'
import { listCategories } from '../../api/category.api'
import type { DemandSummary } from '../../api/demand.api'
import { listDemands } from '../../api/demand.api'
import { queryKeys } from '../../api/queryKeys'
import messageHelperImage from '../../assets/messages/message-helper.webp'
import { MarketplaceShell } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import type { DemandStatus } from '../../types/api'
import { isDemandFavorited, subscribeDemandFavorites, toggleDemandFavorite } from './demandFavorites'
import './OrdersPage.css'

const purchaseNav = [
  { label: '我的订单', to: '/orders/purchase' },
  { label: '求购广场', to: '/orders/purchase/demand' },
  { label: '发布求购', to: '/orders/purchase/demand/new' },
  { label: '我的求购 / 匹配结果', to: '/orders/purchase/demand/mine' },
]

const budgets = ['全部', '0-50', '50-100', '100-300', '300以上']
const emptyDemands: DemandSummary[] = []
const statuses: Array<{ label: string; value: DemandStatus | '全部' }> = [
  { label: '全部', value: '全部' },
  { label: '开放中', value: 'OPEN' },
  { label: '已匹配', value: 'MATCHED' },
  { label: '已关闭', value: 'CLOSED' },
]

const demandStatusCopy: Record<DemandStatus, { label: string; tone: 'blue' | 'green' | 'gray' }> = {
  OPEN: { label: '开放中', tone: 'blue' },
  MATCHED: { label: '已匹配', tone: 'green' },
  CLOSED: { label: '已关闭', tone: 'gray' },
}


export function PurchaseDemandPage() {
  useDocumentTitle('厦大闲置 - 求购广场')
  const shouldReduceMotion = useReducedMotion() ?? false
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState<number | '全部'>('全部')
  const [budget, setBudget] = useState('全部')
  const [status, setStatus] = useState<DemandStatus | '全部'>('全部')
  const [, setFavoriteVersion] = useState(0)

  useEffect(() => subscribeDemandFavorites(() => setFavoriteVersion((value) => value + 1)), [])

  const demandParams = useMemo(
    () => ({
      categoryId: categoryId === '全部' ? undefined : categoryId,
      keyword: keyword.trim() || undefined,
      page: 1,
      size: 50,
    }),
    [categoryId, keyword],
  )
  const demandsQuery = useQuery({
    queryKey: queryKeys.demands.list(demandParams),
    queryFn: () => listDemands(demandParams),
  })
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list,
    queryFn: listCategories,
  })

  const categories = categoriesQuery.data?.data ?? []
  const demands = demandsQuery.data?.data.items ?? emptyDemands
  const visibleDemands = useMemo(() => {
    return demands.filter((item) => {
      const matchesStatus = status === '全部' || item.status === status
      const matchesBudget = budget === '全部' || isWithinBudget(item, budget)
      return matchesStatus && matchesBudget
    })
  }, [budget, demands, status])
  const stats = useMemo(() => ({
    active: demands.filter((item) => item.status === 'OPEN').length,
    today: demands.filter((item) => isToday(item.createdAt)).length,
    matched: demands.filter((item) => item.status === 'MATCHED').length,
    closed: demands.filter((item) => item.status === 'CLOSED').length,
  }), [demands])

  return (
    <MarketplaceShell
      activeUserLabel="购买订单"
      keyword={keyword}
      mainClassName="orders-main demand-main"
      onKeywordChange={setKeyword}
      onSearch={() => undefined}
      searchLabel="搜索求购需求"
      searchPlaceholder="搜索商品名称、类别、关键词..."
    >
      <motion.section
        className="favorites-heading orders-heading"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.18 }}
      >
        <h1>求购广场</h1>
        <p>看看同学们正在寻找的闲置物品，合适就发起私信</p>
      </motion.section>

      <section className="orders-layout">
        <div className="orders-list-panel">
          <nav className="order-section-tabs" aria-label="购买订单导航">
            {purchaseNav.map((item) => (
              <a className={item.label === '求购广场' ? 'active' : undefined} href={item.to} key={item.label}>
                {item.label}
              </a>
            ))}
          </nav>

          <section className="order-stat-strip demand-stat-strip" aria-label="求购统计">
            <DemandStat icon={<MessageCircle size={42} />} label="活跃求购" value={stats.active} />
            <DemandStat icon={<CalendarDays size={42} />} label="今日新增" tone="orange" value={stats.today} />
            <DemandStat icon={<Handshake size={44} />} label="已匹配" tone="green" value={stats.matched} />
            <DemandStat icon={<AlarmClock size={42} />} label="已关闭" tone="red" value={stats.closed} />
          </section>

          <section className="demand-filters" aria-label="求购筛选">
            <CategoryFilterRow categories={categories} value={categoryId} onChange={setCategoryId} />
            <FilterRow label="预算：" options={budgets} value={budget} onChange={setBudget} />
            <FilterRow
              label="状态："
              options={statuses.map((item) => item.label)}
              value={statuses.find((item) => item.value === status)?.label ?? '全部'}
              onChange={(nextLabel) => setStatus(statuses.find((item) => item.label === nextLabel)?.value ?? '全部')}
            />
            <form
              className="order-inner-search demand-search"
              onSubmit={(event) => {
                event.preventDefault()
              }}
            >
              <Search size={22} />
              <input
                aria-label="搜索求购需求"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索求购需求"
              />
            </form>
            <button type="button" className="order-sort-button demand-sort">
              最新发布
              <ChevronDown size={17} />
            </button>
          </section>

          {demandsQuery.isLoading ? <div className="orders-empty-state"><h2>正在加载求购</h2><p>正在从后端同步同学们发布的需求。</p></div> : null}
          {demandsQuery.isError ? (
            <div className="orders-empty-state">
              <h2>求购加载失败</h2>
              <p>请确认后端 demand 接口可用。</p>
              <button type="button" onClick={() => demandsQuery.refetch()}>重新加载</button>
            </div>
          ) : null}
          {!demandsQuery.isLoading && !demandsQuery.isError && visibleDemands.length === 0 ? (
            <div className="orders-empty-state">
              <h2>没有符合条件的求购</h2>
              <p>换个分类、预算或关键词再试试。</p>
            </div>
          ) : null}
          {!demandsQuery.isLoading && !demandsQuery.isError && visibleDemands.length > 0 ? (
            <div className="demand-card-grid">
              {visibleDemands.map((item, index) => (
                <DemandCard demand={item} index={index} reduceMotion={shouldReduceMotion} key={item.id} />
              ))}
            </div>
          ) : null}
        </div>

        <aside className="orders-side-panels">
          <section className="order-tips-panel demand-tips-panel">
            <h2>求购提示</h2>
            <span className="painted-asset demand-panel-art" aria-hidden="true">
              <img src={messageHelperImage} alt="" />
            </span>
            <p>
              发布求购时写清预算、分类和取货范围；点击“我有此物”可向发布者发起私信；沟通确认后可转为订单继续交易。
            </p>
          </section>

          <section className="order-flow-panel demand-quick-panel">
            <h2>快捷筛选</h2>
            <div className="demand-quick-buttons">
              <button type="button" onClick={() => setStatus('OPEN')}>
                开放中
              </button>
              <button type="button" onClick={() => setStatus('全部')}>
                今日新增
              </button>
              <button type="button" onClick={() => setStatus('CLOSED')}>
                已关闭
              </button>
              <button type="button" onClick={() => setStatus('OPEN')}>
                可私信
              </button>
              <button type="button" onClick={() => setStatus('MATCHED')}>
                已匹配
              </button>
            </div>
          </section>
        </aside>
      </section>
    </MarketplaceShell>
  )
}

function CategoryFilterRow({
  categories,
  onChange,
  value,
}: {
  categories: Category[]
  onChange: (value: number | '全部') => void
  value: number | '全部'
}) {
  return (
    <div className="demand-filter-row">
      <strong>分类：</strong>
      <div>
        <button type="button" className={value === '全部' ? 'active' : undefined} onClick={() => onChange('全部')}>
          全部
        </button>
        {categories.map((item) => (
          <button type="button" className={value === item.id ? 'active' : undefined} onClick={() => onChange(item.id)} key={item.id}>
            {item.name}
          </button>
        ))}
      </div>
    </div>
  )
}

function FilterRow({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: string[]
  value: string
}) {
  return (
    <div className="demand-filter-row">
      <strong>{label}</strong>
      <div>
        {options.map((item) => (
          <button type="button" className={value === item ? 'active' : undefined} onClick={() => onChange(item)} key={item}>
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}

function DemandStat({
  icon,
  label,
  tone,
  value,
}: {
  icon: ReactNode
  label: string
  tone?: 'orange' | 'green' | 'red'
  value: number
}) {
  return (
    <div className={classNames('order-stat', tone && `demand-stat--${tone}`)}>
      {icon}
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  )
}

function DemandCard({
  demand,
  index,
  reduceMotion,
}: {
  demand: DemandSummary
  index: number
  reduceMotion: boolean
}) {
  const status = demandStatusCopy[demand.status]
  const secondaryAction = demand.status === 'MATCHED' ? '继续沟通' : '我有此物'
  const favorited = isDemandFavorited(demand.id)

  return (
    <motion.article
      className="demand-card"
      initial={reduceMotion ? false : { opacity: 0, y: 16, rotate: index % 2 === 0 ? -0.2 : 0.2 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.3, delay: 0.12 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -3, rotate: index % 2 === 0 ? -0.15 : 0.15 }}
    >
      <img src={messageHelperImage} alt="" />
      <div className="demand-card-body">
        <header>
          <div>
            <h2>{demand.title}</h2>
            <strong>{formatBudget(demand)}</strong>
          </div>
          <span className={`demand-status demand-status--${status.tone}`}>{status.label}</span>
        </header>
        <p>期望分类：{demand.categoryName}</p>
        <p>{demand.description}</p>
        <p>关键词：{demand.keywords.length > 0 ? demand.keywords.join('、') : '暂无关键词'}</p>
        <small>{formatDate(demand.createdAt)}</small>
        <footer>
          <a href={`/orders/purchase/demand/${demand.id}/detail`}>查看详情</a>
          <a href="/messages">{secondaryAction}</a>
          <button
            type="button"
            className={favorited ? 'favorited' : undefined}
            aria-pressed={favorited}
            onClick={() => toggleDemandFavorite(toFavoriteItem(demand))}
          >
            <Heart size={17} fill={favorited ? 'currentColor' : 'none'} />
            {favorited ? '已关注' : '关注求购'}
          </button>
        </footer>
      </div>
    </motion.article>
  )
}

function toFavoriteItem(demand: DemandSummary) {
  return {
    author: '同学',
    budget: formatBudget(demand),
    category: demand.categoryName,
    description: demand.description,
    id: demand.id,
    image: messageHelperImage,
    publishedAt: formatDate(demand.createdAt),
    status: demandStatusCopy[demand.status].label,
    title: demand.title,
  }
}

function isWithinBudget(demand: DemandSummary, budget: string) {
  const min = demand.budgetMinCent ?? 0
  const max = demand.budgetMaxCent ?? demand.budgetMinCent ?? Number.POSITIVE_INFINITY

  if (budget === '0-50') return min <= 5_000 && max >= 0
  if (budget === '50-100') return min <= 10_000 && max >= 5_000
  if (budget === '100-300') return min <= 30_000 && max >= 10_000
  if (budget === '300以上') return max >= 30_000
  return true
}

function isToday(value: string) {
  const date = new Date(value)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function formatBudget(demand: DemandSummary) {
  const min = typeof demand.budgetMinCent === 'number' ? formatPrice(demand.budgetMinCent) : ''
  const max = typeof demand.budgetMaxCent === 'number' ? formatPrice(demand.budgetMaxCent) : ''

  if (min && max) return `${min}-${max}`
  if (min) return `${min} 起`
  if (max) return `${max} 内`
  return '预算面议'
}

function formatPrice(value: number) {
  return `¥${(value / 100).toFixed(0)}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
