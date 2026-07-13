import { useQuery } from '@tanstack/react-query'
import {
  ClipboardCheck,
  ClipboardList,
  FileWarning,
  FolderOpen,
  Handshake,
  Megaphone,
  RefreshCw,
  Search,
  ShieldAlert,
  UsersRound,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardSummary } from '../../api/admin.api'
import type { DashboardOverview, DashboardSummary } from '../../api/admin.api'
import { queryKeys } from '../../api/queryKeys'
import deskLampImage from '../../assets/favorites/items/desk-lamp.jpg'
import macbookAirImage from '../../assets/favorites/items/macbook-air.jpg'
import mathBooksImage from '../../assets/favorites/items/math-books.jpg'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import './AdminDashboardPage.css'

const fallbackOverview: DashboardOverview = {
  itemPublishCount: 1286,
  orderCompletedCount: 438,
  activeUserCount: 3742,
  pendingReviewCount: 27,
  categoryStats: [
    { categoryName: '教材教辅', itemCount: 31, completedOrderCount: 82 },
    { categoryName: '数码电子', itemCount: 27, completedOrderCount: 126 },
    { categoryName: '宿舍用品', itemCount: 23, completedOrderCount: 91 },
    { categoryName: '运动户外', itemCount: 19, completedOrderCount: 58 },
    { categoryName: '其他', itemCount: 16, completedOrderCount: 42 },
  ],
}

const fallbackReviewItems: DashboardSummary['recentPendingItems'] = [
  createFallbackReviewItem(9001, 'MacBook Air 2019', '林同学', '数码电子', '2026-07-09T10:24:00+08:00', macbookAirImage),
  createFallbackReviewItem(9002, '高等数学教材', '陈同学', '教材教辅', '2026-07-09T09:58:00+08:00', mathBooksImage),
  createFallbackReviewItem(9003, '宿舍台灯', '许同学', '宿舍用品', '2026-07-09T09:31:00+08:00', deskLampImage),
]

const fallbackDealTrends: DashboardSummary['dealTrends'] = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(
  (label, index) => ({
    date: `2026-07-${String(index + 3).padStart(2, '0')}`,
    label,
    currentWeekCount: [32, 43, 60, 81, 65, 84, 64][index],
    previousWeekCount: [16, 23, 31, 49, 36, 52, 37][index],
  }),
)

const fallbackReminders: DashboardSummary['reminders'] = [
  { key: 'pendingReview', label: '件商品待审核', count: 27, severity: 'danger' },
  { key: 'report', label: '条举报待处理', count: 3, severity: 'danger' },
  { key: 'categoryRequest', label: '个类目申请待确认', count: 1, severity: 'danger' },
]

const categoryColors = ['#4d91d0', '#93ad82', '#df8f68', '#e7c46a', '#c9d4dd']

export function AdminDashboardPage() {
  useDocumentTitle('厦大闲置管理后台 - 数据看板')

  const reduceMotion = useReducedMotion() ?? false
  const summaryQuery = useQuery({
    queryKey: queryKeys.admin.dashboardSummary,
    queryFn: getDashboardSummary,
  })

  const summary = summaryQuery.data?.data
  const overview = summary?.overview ?? fallbackOverview
  const reviewItems = summary?.recentPendingItems?.length ? summary.recentPendingItems : fallbackReviewItems
  const dealTrends = summary?.dealTrends?.length ? summary.dealTrends : fallbackDealTrends
  const reminders = summary?.reminders?.length ? summary.reminders : fallbackReminders
  const categoryStats = normalizeCategoryStats(overview.categoryStats)

  return (
    <section className="admin-dashboard-page" aria-label="后台数据看板">
      <div className="admin-dashboard-layout">
        <div className="admin-dashboard-main">
          <motion.header
            className="admin-dashboard-heading"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <h1>数据看板</h1>
            <p>总览平台发布、成交、审核与用户活跃情况</p>
            <button type="button" onClick={() => void summaryQuery.refetch()} aria-label="刷新数据看板">
              <RefreshCw size={17} />
              刷新
            </button>
          </motion.header>

          <section className="admin-dashboard-stats" aria-label="核心统计">
            <MetricCard
              icon={<ClipboardList size={62} />}
              label="总发布量"
              value={overview.itemPublishCount}
              helper="较昨日"
              delta="+32"
            />
            <MetricCard icon={<Handshake size={67} />} label="总成交量" value={overview.orderCompletedCount} helper="本周" delta="+48" />
            <MetricCard
              icon={<UsersRound size={64} />}
              label="活跃用户数"
              value={overview.activeUserCount}
              helper="今日活跃"
              delta="326"
            />
            <MetricCard
              icon={<ClipboardCheck size={63} />}
              label="待审核商品数"
              value={overview.pendingReviewCount}
              helper="需尽快处理"
              tone="danger"
            />
          </section>

          <section className="admin-dashboard-charts" aria-label="图表">
            <article className="admin-dashboard-panel admin-trend-panel">
              <div className="admin-panel-title">
                <h2>近期成交趋势</h2>
                <span>
                  <i />
                  本周
                </span>
                <span className="muted">
                  <i />
                  上周
                </span>
              </div>
              <TrendChart trends={dealTrends} />
            </article>

            <article className="admin-dashboard-panel admin-category-panel">
              <h2>分类占比</h2>
              <div className="admin-category-content">
                <DonutChart stats={categoryStats} />
                <ul>
                  {categoryStats.map((item, index) => (
                    <li key={item.categoryName}>
                      <span style={{ '--swatch': categoryColors[index % categoryColors.length] } as CSSProperties} />
                      {item.categoryName}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </section>

          <section className="admin-dashboard-panel admin-pending-panel" aria-label="最近待审核">
            <div className="admin-panel-title">
              <h2>最近待审核</h2>
              <Link to="/admin/items/review">查看全部</Link>
            </div>

            <div className="admin-pending-table" role="table" aria-label="最近待审核商品">
              <div className="admin-pending-head" role="row">
                <span role="columnheader">商品</span>
                <span role="columnheader">发布者</span>
                <span role="columnheader">分类</span>
                <span role="columnheader">提交时间</span>
                <span role="columnheader">操作</span>
              </div>
              {reviewItems.slice(0, 3).map((item) => (
                <div className="admin-pending-row" role="row" key={item.id}>
                  <span className="admin-pending-item" role="cell">
                    <ItemThumb item={item} />
                    <b>{item.title}</b>
                  </span>
                  <span role="cell">{item.sellerNickname}</span>
                  <span role="cell">{item.categoryName}</span>
                  <span role="cell">{formatTime(item.submittedAt)}</span>
                  <span role="cell">
                    <Link to="/admin/items/review">去审核</Link>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="admin-dashboard-side" aria-label="快捷入口和今日提醒">
          <section className="admin-dashboard-panel admin-quick-panel">
            <h2>快捷入口</h2>
            <QuickAction to="/admin/items/review" icon={<ClipboardCheck size={41} />} label="处理商品审核" />
            <QuickAction to="/admin/items" icon={<ShieldAlert size={43} />} label="查看违规下架" />
            <QuickAction to="/admin?notice=publish" icon={<Megaphone size={44} />} label="发布平台公告" />
          </section>

          <section className="admin-dashboard-panel admin-reminder-panel">
            <h2>今日提醒</h2>
            {reminders.map((item) => (
              <Reminder
                icon={reminderIcon(item.key)}
                count={item.count}
                text={item.label}
                tone={item.severity === 'danger' ? 'danger' : undefined}
                key={item.key}
              />
            ))}
          </section>
        </aside>
      </div>
    </section>
  )
}

interface MetricCardProps {
  delta?: string
  helper: string
  icon: ReactNode
  label: string
  tone?: 'danger'
  value: number
}

function MetricCard({ delta, helper, icon, label, tone, value }: MetricCardProps) {
  return (
    <article className={classNames('admin-metric-card', tone === 'danger' && 'admin-metric-card--danger')}>
      <span>{icon}</span>
      <div>
        <h2>{label}</h2>
        <strong>{formatNumber(value)}</strong>
        <p>
          {helper}
          {delta ? <em>{delta}</em> : null}
        </p>
      </div>
    </article>
  )
}

function TrendChart({ trends }: { trends: DashboardSummary['dealTrends'] }) {
  const normalizedTrends = normalizeTrends(trends)
  const maxValue = Math.max(...normalizedTrends.flatMap((item) => [item.currentWeekCount, item.previousWeekCount]), 100)
  const currentPoints = createPolylinePoints(
    normalizedTrends.map((item) => scaleTrendValue(item.currentWeekCount, maxValue)),
  )
  const previousPoints = createPolylinePoints(
    normalizedTrends.map((item) => scaleTrendValue(item.previousWeekCount, maxValue)),
  )

  return (
    <svg className="admin-trend-chart" viewBox="0 0 640 250" role="img" aria-label="近七天成交趋势">
      {[0, 20, 40, 60, 80, 100].map((tick) => {
        const y = 205 - tick * 1.7
        return (
          <g key={tick}>
            <line x1="50" x2="610" y1={y} y2={y} />
            <text x="16" y={y + 5}>
              {Math.round((tick / 100) * maxValue)}
            </text>
          </g>
        )
      })}
      {normalizedTrends.map((trend, index) => {
        const x = 70 + index * 86
        return (
          <g key={`${trend.date}-${trend.label}`}>
            <line className="vertical" x1={x} x2={x} y1="35" y2="205" />
            <text className="day" x={x} y="233">
              {trend.label}
            </text>
          </g>
        )
      })}
      <polyline className="previous-line" points={previousPoints} />
      <polyline className="current-line" points={currentPoints} />
      {normalizedTrends.map((trend, index) => {
        const [x, y] = pointFor(index, scaleTrendValue(trend.currentWeekCount, maxValue))
        return <circle className="current-dot" cx={x} cy={y} r="5" key={`current-${index}`} />
      })}
      {normalizedTrends.map((trend, index) => {
        const [x, y] = pointFor(index, scaleTrendValue(trend.previousWeekCount, maxValue))
        return <circle className="previous-dot" cx={x} cy={y} r="3.8" key={`previous-${index}`} />
      })}
    </svg>
  )
}

function DonutChart({ stats }: { stats: DashboardOverview['categoryStats'] }) {
  const total = stats.reduce((sum, item) => sum + item.itemCount, 0) || 1
  let cursor = 0
  const gradient = stats
    .map((item, index) => {
      const start = cursor
      const end = cursor + (item.itemCount / total) * 100
      cursor = end
      return `${categoryColors[index % categoryColors.length]} ${start}% ${end}%`
    })
    .join(', ')

  return (
    <div className="admin-donut-wrap" aria-label="商品分类占比">
      <div className="admin-donut" style={{ background: `conic-gradient(${gradient})` }}>
        <span />
      </div>
    </div>
  )
}

function QuickAction({ icon, label, to }: { icon: ReactNode; label: string; to: string }) {
  return (
    <Link className="admin-quick-action" to={to}>
      {icon}
      <span>{label}</span>
    </Link>
  )
}

function Reminder({ count, icon, text, tone }: { count: number; icon: ReactNode; text: string; tone?: 'danger' }) {
  return (
    <p className={classNames('admin-reminder-item', tone === 'danger' && 'admin-reminder-item--danger')}>
      {icon}
      <strong>{count}</strong>
      <span>{text}</span>
    </p>
  )
}

function ItemThumb({ item }: { item: DashboardSummary['recentPendingItems'][number] }) {
  if (item.coverImageUrl) {
    return <img src={item.coverImageUrl} alt="" loading="lazy" />
  }

  return <Search size={30} aria-hidden="true" />
}

function normalizeCategoryStats(stats?: DashboardOverview['categoryStats']) {
  const source = stats?.length ? stats : fallbackOverview.categoryStats
  const byName = new Map(source.map((item) => [item.categoryName, item]))
  const orderedNames = ['教材教辅', '数码电子', '宿舍用品', '运动户外', '其他']

  return orderedNames.map((name, index) => byName.get(name) ?? source[index] ?? fallbackOverview.categoryStats[index])
}

function normalizeTrends(trends: DashboardSummary['dealTrends']) {
  return [...trends, ...fallbackDealTrends].slice(0, 7)
}

function createPolylinePoints(values: number[]) {
  return values.map((value, index) => pointFor(index, value).join(',')).join(' ')
}

function pointFor(index: number, value: number) {
  return [70 + index * 86, 205 - value * 1.7]
}

function scaleTrendValue(value: number, maxValue: number) {
  return maxValue > 0 ? (value / maxValue) * 100 : 0
}

function createFallbackReviewItem(
  id: number,
  title: string,
  sellerNickname: string,
  categoryName: string,
  submittedAt: string,
  coverImageUrl: string,
): DashboardSummary['recentPendingItems'][number] {
  return {
    id,
    title,
    sellerNickname,
    categoryName,
    coverImageUrl,
    submittedAt,
  }
}

function reminderIcon(key: string) {
  if (key === 'pendingReview') {
    return <ClipboardList size={41} />
  }

  if (key === 'categoryRequest') {
    return <FolderOpen size={42} />
  }

  return <FileWarning size={41} />
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function formatTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
