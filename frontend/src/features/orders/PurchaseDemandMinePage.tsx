import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlarmClock,
  BarChart3,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  PackageSearch,
  Search,
  XCircle,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DemandMatch, DemandSummary } from '../../api/demand.api'
import { closeDemand, listDemandMatches, listMyDemands } from '../../api/demand.api'
import { queryKeys } from '../../api/queryKeys'
import messageHelperImage from '../../assets/messages/message-helper.webp'
import { MarketplaceShell } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import type { DemandStatus } from '../../types/api'
import './OrdersPage.css'

const purchaseNav = [
  { label: '我的订单', to: '/orders/purchase' },
  { label: '求购广场', to: '/orders/purchase/demand' },
  { label: '发布求购', to: '/orders/purchase/demand/new' },
  { label: '我的求购 / 匹配结果', to: '/orders/purchase/demand/mine' },
]

const emptyDemands: DemandSummary[] = []

const statusFilters: Array<{ label: string; value: DemandStatus | 'all' }> = [
  { label: '全部', value: 'all' },
  { label: '开放中', value: 'OPEN' },
  { label: '已匹配', value: 'MATCHED' },
  { label: '已关闭', value: 'CLOSED' },
]

const statusCopy: Record<DemandStatus, { label: string; tone: 'blue' | 'green' | 'gray' }> = {
  OPEN: { label: '开放中', tone: 'blue' },
  MATCHED: { label: '已匹配', tone: 'green' },
  CLOSED: { label: '已关闭', tone: 'gray' },
}

export function PurchaseDemandMinePage() {
  useDocumentTitle('厦大闲置 - 我的求购')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const shouldReduceMotion = useReducedMotion() ?? false
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<DemandStatus | 'all'>('all')
  const [actionNotice, setActionNotice] = useState('')

  const demandsQuery = useQuery({
    queryKey: queryKeys.demands.mine,
    queryFn: () => listMyDemands({ page: 1, size: 50 }),
  })
  const demands = demandsQuery.data?.data.items ?? emptyDemands
  const matchQueries = useQueries({
    queries: demands.map((demand) => ({
      queryKey: queryKeys.demands.matches(demand.id),
      queryFn: () => listDemandMatches(demand.id, { limit: 3 }),
      enabled: demand.status !== 'CLOSED',
    })),
  })
  const matchesByDemandId = useMemo(() => {
    const next = new Map<number, DemandMatch[]>()
    demands.forEach((demand, index) => {
      next.set(demand.id, matchQueries[index]?.data?.data ?? [])
    })
    return next
  }, [demands, matchQueries])

  const closeMutation = useMutation({
    mutationFn: (demand: DemandSummary) => closeDemand(demand.id),
    onSuccess: (_, demand) => {
      setActionNotice(`已关闭：${demand.title}`)
      queryClient.invalidateQueries({ queryKey: ['demands'] })
    },
    onError: (error) => {
      setActionNotice(error instanceof Error ? error.message : '关闭失败，请稍后再试')
    },
  })

  const visibleDemands = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return demands.filter((item) => {
      const matches = matchesByDemandId.get(item.id) ?? []
      const matchesStatus = status === 'all' || item.status === status
      const matchesKeyword =
        !normalizedKeyword ||
        `${item.title} ${item.categoryName} ${item.description} ${item.keywords.join(' ')} ${matches.map((match) => match.title).join(' ')}`
          .toLowerCase()
          .includes(normalizedKeyword)
      return matchesStatus && matchesKeyword
    })
  }, [demands, keyword, matchesByDemandId, status])

  const stats = useMemo(() => {
    const totalMatches = Array.from(matchesByDemandId.values()).reduce((sum, matches) => sum + matches.length, 0)
    return {
      active: demands.filter((item) => item.status === 'OPEN').length,
      today: demands.filter((item) => isToday(item.createdAt)).length,
      matched: demands.filter((item) => item.status === 'MATCHED').length,
      matches: totalMatches,
    }
  }, [demands, matchesByDemandId])

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
            <DemandMineStat icon={<MessageCircle size={42} />} label="活跃求购" value={stats.active} />
            <DemandMineStat icon={<BarChart3 size={42} />} label="今日新增" tone="orange" value={stats.today} />
            <DemandMineStat icon={<CheckCircle2 size={46} />} label="已匹配" tone="green" value={stats.matched} />
            <DemandMineStat icon={<AlarmClock size={42} />} label="推荐商品" tone="red" value={stats.matches} />
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
            {demandsQuery.isLoading ? <div className="orders-empty-state"><h2>正在加载我的求购</h2><p>正在读取后端已发布需求。</p></div> : null}
            {demandsQuery.isError ? (
              <div className="orders-empty-state">
                <h2>我的求购加载失败</h2>
                <p>请确认已登录且后端接口可用。</p>
                <button type="button" onClick={() => demandsQuery.refetch()}>重新加载</button>
              </div>
            ) : null}
            {!demandsQuery.isLoading && !demandsQuery.isError && visibleDemands.length === 0 ? (
              <div className="orders-empty-state">
                <h2>没有符合条件的求购</h2>
                <p>可以发布一条新的求购，或换个状态筛选。</p>
              </div>
            ) : null}
            {!demandsQuery.isLoading && !demandsQuery.isError ? visibleDemands.map((item, index) => (
              <MineDemandCard
                demand={item}
                index={index}
                isClosing={closeMutation.isPending}
                matches={matchesByDemandId.get(item.id) ?? []}
                onClose={() => closeMutation.mutate(item)}
                onOpenDetail={() => navigate(`/orders/purchase/demand/${item.id}/detail`)}
                reduceMotion={shouldReduceMotion}
                key={item.id}
              />
            )) : null}
          </div>
        </div>

        <aside className="orders-side-panels">
          <section className="order-tips-panel demand-match-tip-panel">
            <h2>匹配提示</h2>
            <ul>
              <li><CheckCircle2 size={20} />系统按分类和关键词推荐</li>
              <li><CheckCircle2 size={20} />预算越清晰推荐越准确</li>
              <li><CheckCircle2 size={20} />点击商品可查看详情</li>
              <li><CheckCircle2 size={20} />关闭求购会同步后端状态</li>
            </ul>
            <span className="painted-asset demand-panel-art" aria-hidden="true">
              <img src={messageHelperImage} alt="" />
            </span>
          </section>

          <section className="order-flow-panel demand-match-overview">
            <h2>匹配概览</h2>
            <div>
              <OverviewRow label="推荐商品" value={stats.matches} />
              <OverviewRow label="开放需求" value={stats.active} tone="blue" />
              <OverviewRow label="今日新增" value={stats.today} tone="orange" />
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
  isClosing,
  matches,
  onClose,
  onOpenDetail,
  reduceMotion,
}: {
  demand: DemandSummary
  index: number
  isClosing: boolean
  matches: DemandMatch[]
  onClose: () => void
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
        <span className="demand-mine-icon"><BookOpen size={44} /></span>
        <div>
          <h2>{demand.title}</h2>
          <p>
            预算范围：<strong>{formatBudget(demand)}</strong>
            <span>期望分类：{demand.categoryName}</span>
          </p>
          <p>描述：{demand.description}</p>
          <small>发布时间：{formatDate(demand.createdAt)}</small>
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
          <button type="button" onClick={onOpenDetail}>
            <PackageSearch size={17} />
            查看
          </button>
          <button type="button" disabled={isClosing || demand.status === 'CLOSED'} onClick={onClose}>
            <XCircle size={17} />
            {demand.status === 'CLOSED' ? '已关闭' : '关闭需求'}
          </button>
        </div>
      </header>

      <section className="demand-match-row">
        <strong>系统推荐商品</strong>
        {matches.length === 0 ? (
          <div>
            <h3>暂无匹配商品</h3>
            <p>后端暂未返回匹配结果</p>
          </div>
        ) : matches.slice(0, 1).map((match) => (
          <MatchPreview match={match} key={match.itemId} />
        ))}
      </section>
    </motion.article>
  )
}

function MatchPreview({ match }: { match: DemandMatch }) {
  return (
    <>
      <span className="demand-mine-icon"><PackageSearch size={34} /></span>
      <div>
        <h3>{match.title}</h3>
        <p>{formatPrice(match.priceCent)}</p>
        <small>{match.matchReason}</small>
      </div>
      <span>已匹配</span>
      <a href={`/items/${match.itemId}`}>查看详情</a>
      <a href={`/messages?itemId=${match.itemId}`}>直接联系</a>
    </>
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
