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
import { useEffect, useMemo, useState } from 'react'
import messageHelperImage from '../../assets/messages/message-helper.webp'
import { MarketplaceShell } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { isDemandFavorited, subscribeDemandFavorites, toggleDemandFavorite } from './demandFavorites'
import { demandItems, demandStatusCopy, type DemandItem, type DemandStatus } from './demandData'
import './OrdersPage.css'

const purchaseNav = [
  { label: '我的订单', to: '/orders/purchase' },
  { label: '求购广场', to: '/orders/purchase/demand' },
  { label: '发布求购', to: '/orders/purchase/demand/new' },
  { label: '我的求购 / 匹配结果', to: '/orders/purchase/demand/mine' },
]

const categories = ['全部', '教材教辅', '数码电子', '宿舍用品', '运动户外', '生活日用', '美妆个护', '乐器文具', '票务转让', '其他']
const budgets = ['全部', '0-50', '50-100', '100-300', '300以上']
const statuses: Array<{ label: string; value: DemandStatus | '全部' }> = [
  { label: '全部', value: '全部' },
  { label: '待匹配', value: 'matching' },
  { label: '沟通中', value: 'talking' },
  { label: '已匹配', value: 'matched' },
  { label: '即将过期', value: 'expiring' },
]


export function PurchaseDemandPage() {
  useDocumentTitle('厦大闲置 - 求购广场')
  const shouldReduceMotion = useReducedMotion() ?? false
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('全部')
  const [budget, setBudget] = useState('全部')
  const [status, setStatus] = useState<DemandStatus | '全部'>('全部')
  const [, setFavoriteVersion] = useState(0)

  useEffect(() => subscribeDemandFavorites(() => setFavoriteVersion((value) => value + 1)), [])

  const visibleDemands = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return demandItems.filter((item) => {
      const matchesCategory = category === '全部' || item.category === category
      const matchesStatus = status === '全部' || item.status === status
      const matchesKeyword =
        !normalizedKeyword ||
        `${item.title} ${item.category} ${item.description} ${item.author}`.toLowerCase().includes(normalizedKeyword)
      const matchesBudget = budget === '全部' || item.budget.includes(budget.replace('以上', ''))
      return matchesCategory && matchesStatus && matchesKeyword && matchesBudget
    })
  }, [budget, category, keyword, status])

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
            <DemandStat icon={<MessageCircle size={42} />} label="活跃求购" value={128} />
            <DemandStat icon={<CalendarDays size={42} />} label="今日新增" tone="orange" value={26} />
            <DemandStat icon={<Handshake size={44} />} label="已匹配" tone="green" value={46} />
            <DemandStat icon={<AlarmClock size={42} />} label="即将过期" tone="red" value={18} />
          </section>

          <section className="demand-filters" aria-label="求购筛选">
            <FilterRow label="分类：" options={categories} value={category} onChange={setCategory} />
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

          <div className="demand-card-grid">
            {visibleDemands.map((item, index) => (
              <DemandCard demand={item} index={index} reduceMotion={shouldReduceMotion} key={item.id} />
            ))}
          </div>
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
              <button type="button" onClick={() => setStatus('matching')}>
                待匹配
              </button>
              <button type="button" onClick={() => setStatus('全部')}>
                今日新增
              </button>
              <button type="button" onClick={() => setStatus('expiring')}>
                即将过期
              </button>
              <button type="button" onClick={() => setStatus('talking')}>
                可私信
              </button>
              <button type="button" onClick={() => setStatus('matched')}>
                已匹配
              </button>
            </div>
          </section>
        </aside>
      </section>
    </MarketplaceShell>
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
  icon: React.ReactNode
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
  demand: DemandItem
  index: number
  reduceMotion: boolean
}) {
  const status = demandStatusCopy[demand.status]
  const secondaryAction = demand.status === 'talking' || demand.status === 'matched' ? '继续沟通' : '我有此物'
  const favorited = isDemandFavorited(demand.id)

  return (
    <motion.article
      className="demand-card"
      initial={reduceMotion ? false : { opacity: 0, y: 16, rotate: index % 2 === 0 ? -0.2 : 0.2 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.3, delay: 0.12 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -3, rotate: index % 2 === 0 ? -0.15 : 0.15 }}
    >
      <img src={demand.image} alt={demand.title} />
      <div className="demand-card-body">
        <header>
          <div>
            <h2>{demand.title}</h2>
            <strong>{demand.budget}</strong>
          </div>
          <span className={`demand-status demand-status--${status.tone}`}>{status.label}</span>
        </header>
        <p>期望分类：{demand.category}</p>
        <p>{demand.description}</p>
        <p>发布者：{demand.author}</p>
        <small>{demand.publishedAt}</small>
        <footer>
          <a href={`/orders/purchase/demand/${demand.id}/detail`}>查看详情</a>
          <a href="/messages">{secondaryAction}</a>
          <button
            type="button"
            className={favorited ? 'favorited' : undefined}
            aria-pressed={favorited}
            onClick={() => toggleDemandFavorite(demand)}
          >
            <Heart size={17} fill={favorited ? 'currentColor' : 'none'} />
            {favorited ? '已关注' : '关注求购'}
          </button>
        </footer>
      </div>
    </motion.article>
  )
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
