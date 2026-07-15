import {
  AlarmClock,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Edit3,
  Headphones,
  MessageCircle,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import airpodsImage from '../../assets/favorites/items/airpods.webp'
import mathBooksImage from '../../assets/favorites/items/math-books.webp'
import messageHelperImage from '../../assets/messages/message-helper.webp'
import { MarketplaceShell } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import './OrdersPage.css'

type MineDemandStatus = 'active' | 'matching' | 'matched' | 'expiring' | 'closed'

interface MineDemand {
  budget: string
  category: string
  description: string
  icon: React.ReactNode
  id: number
  match: {
    image: string
    itemId: number
    price: string
    seller: string
    title: string
    value: number
  }
  publishedAt: string
  status: MineDemandStatus
  title: string
}

const purchaseNav = [
  { label: '我的订单', to: '/orders/purchase' },
  { label: '求购广场', to: '/orders/purchase/demand' },
  { label: '发布求购', to: '/orders/purchase/demand/new' },
  { label: '我的求购 / 匹配结果', to: '/orders/purchase/demand/mine' },
]

const statusFilters: Array<{ label: string; value: MineDemandStatus | 'all' }> = [
  { label: '全部', value: 'all' },
  { label: '匹配中', value: 'matching' },
  { label: '已匹配', value: 'matched' },
  { label: '即将过期', value: 'expiring' },
  { label: '已关闭', value: 'closed' },
]

const statusCopy: Record<MineDemandStatus, { label: string; tone: 'blue' | 'orange' | 'green' | 'red' | 'gray' }> = {
  active: { label: '活跃求购', tone: 'blue' },
  matching: { label: '匹配中', tone: 'orange' },
  matched: { label: '已匹配', tone: 'green' },
  expiring: { label: '即将过期', tone: 'red' },
  closed: { label: '已关闭', tone: 'gray' },
}

const mineDemands: MineDemand[] = [
  {
    id: 1,
    title: '想收高等数学第七版教材',
    budget: '¥20-40',
    category: '教材教辅',
    description: '希望上下册齐全，笔记少一点，期末复习前能自取。',
    publishedAt: '发布于 10 分钟前',
    status: 'matching',
    icon: <BookOpen size={44} />,
    match: {
      title: '高等数学（第七版）上下册',
      price: '¥28.00',
      seller: '李同学',
      value: 92,
      image: mathBooksImage,
      itemId: 1001,
    },
  },
  {
    id: 2,
    title: '求 AirPods 二代或三代',
    budget: '¥200-450',
    category: '数码电子',
    description: '希望电池健康还可以，外壳无明显磕碰，能当面试用。',
    publishedAt: '发布于 1 小时前',
    status: 'matched',
    icon: <Headphones size={44} />,
    match: {
      title: 'AirPods 二代',
      price: '¥399.00',
      seller: '周同学',
      value: 88,
      image: airpodsImage,
      itemId: 1007,
    },
  },
]

export function PurchaseDemandMinePage() {
  useDocumentTitle('厦大闲置 - 我的求购')
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion() ?? false
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<MineDemandStatus | 'all'>('all')
  const [demands, setDemands] = useState(mineDemands)
  const [actionNotice, setActionNotice] = useState('')

  const visibleDemands = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return demands.filter((item) => {
      const matchesStatus = status === 'all' || item.status === status
      const matchesKeyword =
        !normalizedKeyword ||
        `${item.title} ${item.category} ${item.description} ${item.match.title}`.toLowerCase().includes(normalizedKeyword)
      return matchesStatus && matchesKeyword
    })
  }, [demands, keyword, status])

  function deleteDemand(demand: MineDemand) {
    if (!window.confirm(`确定删除“${demand.title}”吗？删除后将不再显示。`)) {
      return
    }

    setDemands((current) => current.filter((item) => item.id !== demand.id))
    setActionNotice(`已删除：${demand.title}`)
  }

  function toggleClosed(demand: MineDemand) {
    const nextStatus: MineDemandStatus = demand.status === 'closed' ? 'matching' : 'closed'
    setDemands((current) => current.map((item) => (item.id === demand.id ? { ...item, status: nextStatus } : item)))
    setActionNotice(nextStatus === 'closed' ? `已关闭：${demand.title}` : `已重新开启：${demand.title}`)
  }

  return (
    <MarketplaceShell
      activeUserLabel="购买订单"
      keyword={keyword}
      mainClassName="orders-main demand-mine-main"
      onKeywordChange={setKeyword}
      onSearch={() => undefined}
      searchLabel="搜索我的求购"
      searchPlaceholder="搜索商品名称、类别、关键词..."
    >
      <motion.section
        className="favorites-heading orders-heading"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.18 }}
      >
        <h1>我的求购</h1>
        <p>管理已发布求购，查看系统匹配商品</p>
      </motion.section>

      <section className="orders-layout">
        <div className="orders-list-panel">
          <nav className="order-section-tabs" aria-label="购买订单导航">
            {purchaseNav.map((item) => (
              <a className={item.label === '我的求购 / 匹配结果' ? 'active' : undefined} href={item.to} key={item.label}>
                {item.label}
              </a>
            ))}
          </nav>

          <section className="order-stat-strip demand-stat-strip" aria-label="我的求购统计">
            <DemandMineStat icon={<MessageCircle size={42} />} label="活跃求购" value={4} />
            <DemandMineStat icon={<BarChart3 size={42} />} label="今日新增" tone="orange" value={2} />
            <DemandMineStat icon={<CheckCircle2 size={46} />} label="已匹配" tone="green" value={8} />
            <DemandMineStat icon={<AlarmClock size={42} />} label="即将过期" tone="red" value={2} />
          </section>

          <div className="demand-mine-toolbar">
            <div className="order-status-tabs" role="tablist" aria-label="求购状态">
              {statusFilters.map((item) => (
                <button
                  type="button"
                  className={status === item.value ? 'active' : undefined}
                  onClick={() => setStatus(item.value)}
                  role="tab"
                  aria-selected={status === item.value}
                  key={item.value}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <form
              className="order-inner-search"
              onSubmit={(event) => {
                event.preventDefault()
              }}
            >
              <Search size={22} />
              <input
                aria-label="搜索我的求购"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索我的求购"
              />
            </form>
          </div>

          <div className="demand-mine-list">
            {actionNotice ? <p className="demand-mine-notice" role="status">{actionNotice}</p> : null}
            {visibleDemands.map((item, index) => (
              <MineDemandCard
                demand={item}
                index={index}
                onClose={() => toggleClosed(item)}
                onDelete={() => deleteDemand(item)}
                onEdit={() => navigate(`/orders/purchase/demand/new?edit=${item.id}`)}
                onOpenDetail={() => navigate(`/orders/purchase/demand/${item.id}/detail`)}
                reduceMotion={shouldReduceMotion}
                key={item.id}
              />
            ))}
          </div>
        </div>

        <aside className="orders-side-panels">
          <section className="order-tips-panel demand-match-tip-panel">
            <h2>匹配提示</h2>
            <ul>
              <li>
                <CheckCircle2 size={20} />
                系统按分类和关键词推荐
              </li>
              <li>
                <CheckCircle2 size={20} />
                预算越清晰推荐越准确
              </li>
              <li>
                <CheckCircle2 size={20} />
                点击商品可查看详情
              </li>
              <li>
                <CheckCircle2 size={20} />
                直接联系会发起私信
              </li>
            </ul>
            <span className="painted-asset demand-panel-art" aria-hidden="true">
              <img src={messageHelperImage} alt="" />
            </span>
          </section>

          <section className="order-flow-panel demand-match-overview">
            <h2>匹配概览</h2>
            <div>
              <OverviewRow label="高匹配" value={5} />
              <OverviewRow label="待联系" value={3} tone="blue" />
              <OverviewRow label="即将过期" value={2} tone="orange" />
            </div>
          </section>
        </aside>
      </section>
    </MarketplaceShell>
  )
}

function MineDemandCard({
  demand,
  index,
  onClose,
  onDelete,
  onEdit,
  onOpenDetail,
  reduceMotion,
}: {
  demand: MineDemand
  index: number
  onClose: () => void
  onDelete: () => void
  onEdit: () => void
  onOpenDetail: () => void
  reduceMotion: boolean
}) {
  const status = statusCopy[demand.status]

  return (
    <motion.article
      className="demand-mine-card"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.12 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <header>
        <span className="demand-mine-icon">{demand.icon}</span>
        <div>
          <h2>{demand.title}</h2>
          <p>
            预算范围：<strong>{demand.budget}</strong>
            <span>期望分类：{demand.category}</span>
          </p>
          <p>描述：{demand.description}</p>
          <small>发布时间：{demand.publishedAt}</small>
        </div>
        <button
          type="button"
          className={`demand-status demand-status--${status.tone}`}
          onClick={onOpenDetail}
          aria-label={`查看 ${demand.title} 的求购详情`}
        >
          {status.label}
        </button>
        <div className="demand-mine-actions">
          <button type="button" onClick={onEdit}>
            <Edit3 size={17} />
            编辑
          </button>
          <button type="button" className="danger" onClick={onDelete}>
            <Trash2 size={17} />
            删除
          </button>
          <button type="button" onClick={onClose}>
            <XCircle size={17} />
            {demand.status === 'closed' ? '重新开启' : '关闭需求'}
          </button>
        </div>
      </header>

      <section className="demand-match-row">
        <strong>系统推荐商品</strong>
        <img src={demand.match.image} alt="" />
        <div>
          <h3>{demand.match.title}</h3>
          <p>{demand.match.price}</p>
          <small>卖家：{demand.match.seller}</small>
        </div>
        <span>匹配度 {demand.match.value}%</span>
        <a href={`/items/${demand.match.itemId}`}>查看详情</a>
        <a href={`/messages?itemId=${demand.match.itemId}`}>直接联系</a>
      </section>
    </motion.article>
  )
}

function DemandMineStat({
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
    <div className={['order-stat', tone ? `demand-stat--${tone}` : ''].filter(Boolean).join(' ')}>
      {icon}
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  )
}

function OverviewRow({ label, tone, value }: { label: string; tone?: 'blue' | 'orange'; value: number }) {
  return (
    <p className={tone ? `overview-row overview-row--${tone}` : 'overview-row'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </p>
  )
}
