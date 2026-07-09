import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App as AntdApp } from 'antd'
import {
  AlertTriangle,
  Archive,
  Ban,
  BellRing,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  PackageCheck,
  RefreshCcw,
  Search,
  ShieldAlert,
  Store,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listAdminItems, violationRemoveItem } from '../../api/admin.api'
import { listCategories, type Category } from '../../api/category.api'
import type { ItemSummary } from '../../api/item.api'
import { queryKeys } from '../../api/queryKeys'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import type { ItemStatus } from '../../types/api'
import './AdminItemsPage.css'

const removalReasons = ['虚假信息', '价格异常', '非学生商品', '重复发布', '违禁物品', '其他原因'] as const

type StatusFilter = 'ALL' | ItemStatus
type PriceFilter = 'ALL' | 'UNDER_100' | 'BETWEEN_100_500' | 'OVER_500'
type ReportFilter = 'ALL' | 'REPORTED' | 'CLEAN' | 'NEEDS_REVIEW'
type SortMode = 'LATEST' | 'REPORTS' | 'PRICE_DESC'
type RemovalReason = (typeof removalReasons)[number]

interface GovernanceSignal {
  reportCount: number
  phoneMasked: string
  issue: string
  listedAt: string
  recordTime: string
  severity: 'normal' | 'warning' | 'danger'
}

interface EnrichedAdminItem {
  item: ItemSummary
  signal: GovernanceSignal
}

const pageSize = 6
const emptyAdminItems: ItemSummary[] = []

const allStatuses: ItemStatus[] = [
  'DRAFT',
  'PENDING_REVIEW',
  'ON_SALE',
  'OFF_SHELF',
  'REJECTED',
  'VIOLATION_REMOVED',
  'SOLD',
  'DELETED',
]

const fallbackCategories: Category[] = [
  { id: 1, name: '教材', sort: 10 },
  { id: 2, name: '数码', sort: 20 },
  { id: 3, name: '宿舍用品', sort: 30 },
  { id: 4, name: '运动户外', sort: 40 },
  { id: 5, name: '生活日用', sort: 50 },
  { id: 6, name: '美妆个护', sort: 60 },
  { id: 7, name: '乐器文具', sort: 70 },
  { id: 8, name: '票务转让', sort: 80 },
  { id: 9, name: '其他', sort: 90 },
]

const statusTabs: Array<{ label: string; value: StatusFilter }> = [
  { label: '全部', value: 'ALL' },
  { label: '已上架', value: 'ON_SALE' },
  { label: '待复核', value: 'PENDING_REVIEW' },
  { label: '违规下架', value: 'VIOLATION_REMOVED' },
  { label: '已下架', value: 'OFF_SHELF' },
  { label: '已售出', value: 'SOLD' },
]

const priceFilters: Array<{ label: string; value: PriceFilter }> = [
  { label: '价格区间', value: 'ALL' },
  { label: '100 元内', value: 'UNDER_100' },
  { label: '100-500 元', value: 'BETWEEN_100_500' },
  { label: '500 元以上', value: 'OVER_500' },
]

const reportFilters: Array<{ label: string; value: ReportFilter }> = [
  { label: '举报状态', value: 'ALL' },
  { label: '有举报', value: 'REPORTED' },
  { label: '无举报', value: 'CLEAN' },
  { label: '需复核', value: 'NEEDS_REVIEW' },
]

const sortModes: Array<{ label: string; value: SortMode }> = [
  { label: '上架时间', value: 'LATEST' },
  { label: '举报优先', value: 'REPORTS' },
  { label: '价格从高到低', value: 'PRICE_DESC' },
]

const knownSignals: Record<number, GovernanceSignal> = {
  1002: {
    reportCount: 0,
    phoneMasked: '2023****5123',
    issue: '信息正常',
    listedAt: '今天 10:40',
    recordTime: '今天 10:40',
    severity: 'normal',
  },
  1007: {
    reportCount: 2,
    phoneMasked: '2021****2256',
    issue: '价格异常',
    listedAt: '昨天 16:12',
    recordTime: '今天 11:20',
    severity: 'danger',
  },
  1017: {
    reportCount: 1,
    phoneMasked: '2024****0908',
    issue: '票务转让待复核',
    listedAt: '昨天 12:35',
    recordTime: '昨天 18:06',
    severity: 'warning',
  },
  1003: {
    reportCount: 0,
    phoneMasked: '2024****0831',
    issue: '信息正常',
    listedAt: '周一 09:31',
    recordTime: '周一 09:31',
    severity: 'normal',
  },
  1018: {
    reportCount: 3,
    phoneMasked: '2022****7781',
    issue: '虚假信息',
    listedAt: '周一 15:42',
    recordTime: '昨天 15:42',
    severity: 'danger',
  },
  1019: {
    reportCount: 4,
    phoneMasked: '2020****1019',
    issue: '批量转售',
    listedAt: '上周五 14:10',
    recordTime: '上周五 17:20',
    severity: 'danger',
  },
}

export function AdminItemsPage() {
  useDocumentTitle('厦大闲置 - 商品治理 / 违规下架')

  const shouldReduceMotion = useReducedMotion()
  const queryClient = useQueryClient()
  const { message } = AntdApp.useApp()
  const [searchParams, setSearchParams] = useSearchParams()

  const routeKeyword = searchParams.get('keyword') ?? ''
  const activeStatus = parseStatus(searchParams.get('status'))
  const activeCategoryId = parseCategoryId(searchParams.get('categoryId'))

  const [keywordInput, setKeywordInput] = useState(routeKeyword)
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('ALL')
  const [reportFilter, setReportFilter] = useState<ReportFilter>('ALL')
  const [sortMode, setSortMode] = useState<SortMode>('LATEST')
  const [page, setPage] = useState(1)
  const [removalTargetId, setRemovalTargetId] = useState<number | null>(null)
  const [removalReason, setRemovalReason] = useState<RemovalReason>('虚假信息')
  const [removalNote, setRemovalNote] = useState('')

  useEffect(() => {
    setKeywordInput(routeKeyword)
  }, [routeKeyword])

  useEffect(() => {
    setPage(1)
  }, [activeCategoryId, activeStatus, priceFilter, reportFilter, routeKeyword, sortMode])

  const adminItemParams = useMemo(
    () => ({
      categoryId: activeCategoryId || undefined,
      keyword: routeKeyword || undefined,
      page: 1,
      size: 50,
      status: activeStatus === 'ALL' ? undefined : activeStatus,
    }),
    [activeCategoryId, activeStatus, routeKeyword],
  )

  const itemsQuery = useQuery({
    queryKey: queryKeys.admin.items(adminItemParams),
    queryFn: () => listAdminItems(adminItemParams),
  })

  const overviewQuery = useQuery({
    queryKey: queryKeys.admin.items({ scope: 'overview' }),
    queryFn: () => listAdminItems({ page: 1, size: 80 }),
  })

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list,
    queryFn: listCategories,
  })

  const violationMutation = useMutation({
    mutationFn: ({ itemId, reason }: { itemId: number; reason: string }) => violationRemoveItem(itemId, { reason }),
    onSuccess: () => {
      message.success('已完成违规下架，并写入下架记录')
      setRemovalTargetId(null)
      setRemovalNote('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'items'] })
    },
  })

  const categories = categoriesQuery.data?.data ?? fallbackCategories
  const queryItems = itemsQuery.data?.data.items ?? emptyAdminItems
  const overviewItems = overviewQuery.data?.data.items ?? queryItems

  const enrichedItems = useMemo<EnrichedAdminItem[]>(
    () => queryItems.map((item) => ({ item, signal: getGovernanceSignal(item) })),
    [queryItems],
  )

  const filteredItems = useMemo(() => {
    return enrichedItems
      .filter(({ item }) => matchesPriceFilter(item.priceCent, priceFilter))
      .filter(({ item, signal }) => matchesReportFilter(item.status, signal.reportCount, reportFilter))
      .sort((first, second) => sortAdminItems(first, second, sortMode))
  }, [enrichedItems, priceFilter, reportFilter, sortMode])

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const removalTarget = queryItems.find((item) => item.id === removalTargetId)

  const metricCards = createMetricCards(overviewItems)
  const recentRecords = createRecentRecords(overviewItems)

  function updateRouteFilters(next: { categoryId?: number | null; keyword?: string | null; status?: StatusFilter | null }) {
    const params = new URLSearchParams(searchParams)

    if ('keyword' in next) {
      const keyword = next.keyword?.trim()

      if (keyword) {
        params.set('keyword', keyword)
      } else {
        params.delete('keyword')
      }
    }

    if ('categoryId' in next) {
      if (next.categoryId) {
        params.set('categoryId', String(next.categoryId))
      } else {
        params.delete('categoryId')
      }
    }

    if ('status' in next) {
      if (next.status && next.status !== 'ALL') {
        params.set('status', next.status)
      } else {
        params.delete('status')
      }
    }

    setSearchParams(params)
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateRouteFilters({ keyword: keywordInput })
  }

  function openRemovalPanel(item: ItemSummary) {
    setRemovalTargetId(item.id)
    setRemovalReason(getGovernanceSignal(item).severity === 'danger' ? '虚假信息' : '价格异常')
    setRemovalNote('')
  }

  function confirmRemoval() {
    if (!removalTarget) {
      return
    }

    const note = removalNote.trim()
    const reason = note ? `${removalReason}：${note}` : removalReason
    violationMutation.mutate({ itemId: removalTarget.id, reason })
  }

  return (
    <section className="admin-items-page">
      <motion.header
        className="admin-items-heading"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
      >
        <div>
          <h1>违规下架</h1>
          <p>管理已上架商品，强制下架违规内容并通知发布者</p>
        </div>
        <Link className="admin-outline-action" to="/admin/items/review">
          <ClipboardList size={18} />
          转到商品审核
        </Link>
      </motion.header>

      <div className="admin-items-metrics" aria-label="商品治理指标">
        {metricCards.map((card, index) => (
          <motion.article
            className="admin-items-metric"
            key={card.label}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.06 + index * 0.04 }}
          >
            <span className={`admin-metric-icon admin-metric-icon--${card.tone}`}>
              <card.icon size={33} />
            </span>
            <div>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="admin-items-grid">
        <section className="admin-items-workbench" aria-label="商品治理工作台">
          <div className="admin-items-querybar">
            <form className="admin-items-search" onSubmit={submitSearch}>
              <Search size={21} aria-hidden="true" />
              <input
                aria-label="搜索商品标题、发布者、编号"
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder="搜索商品标题、发布者、编号..."
              />
              <button type="submit">查询</button>
            </form>
            <button
              type="button"
              className="admin-outline-action admin-outline-action--compact"
              onClick={() => updateRouteFilters({ status: 'VIOLATION_REMOVED' })}
            >
              查看下架记录
            </button>
          </div>

          <div className="admin-category-strip" aria-label="商品分类筛选">
            <button
              type="button"
              className={activeCategoryId === 0 ? 'active' : undefined}
              onClick={() => updateRouteFilters({ categoryId: null })}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                type="button"
                className={activeCategoryId === category.id ? 'active' : undefined}
                onClick={() => updateRouteFilters({ categoryId: category.id })}
                key={category.id}
              >
                {formatCategoryName(category.name)}
              </button>
            ))}
          </div>

          <div className="admin-filter-row" aria-label="治理筛选">
            <FilterSelect
              label="上架时间"
              options={sortModes}
              value={sortMode}
              onChange={(value) => setSortMode(value)}
            />
            <FilterSelect
              label="价格区间"
              options={priceFilters}
              value={priceFilter}
              onChange={(value) => setPriceFilter(value)}
            />
            <FilterSelect
              label="举报状态"
              options={reportFilters}
              value={reportFilter}
              onChange={(value) => setReportFilter(value)}
            />
          </div>

          <div className="admin-status-tabs" aria-label="商品状态">
            {statusTabs.map((tab) => (
              <button
                type="button"
                className={activeStatus === tab.value ? 'active' : undefined}
                onClick={() => updateRouteFilters({ status: tab.value })}
                key={tab.value}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="admin-items-table" role="table" aria-label="商品治理列表">
            <div className="admin-items-table-head" role="row">
              <span>商品信息</span>
              <span>分类</span>
              <span>上架时间</span>
              <span>状态</span>
              <span>举报数</span>
              <span>操作</span>
            </div>

            {itemsQuery.isLoading ? <TableSkeleton /> : null}

            {itemsQuery.isError ? (
              <div className="admin-items-empty">
                <AlertTriangle size={30} />
                <strong>商品列表加载失败</strong>
                <span>请确认已启用 mock 模式或后端接口可用。</span>
                <button type="button" onClick={() => itemsQuery.refetch()}>
                  <RefreshCcw size={16} />
                  重新加载
                </button>
              </div>
            ) : null}

            {!itemsQuery.isLoading && !itemsQuery.isError && visibleItems.length === 0 ? (
              <div className="admin-items-empty">
                <ShieldAlert size={30} />
                <strong>没有符合条件的商品</strong>
                <span>换个关键词、分类或举报状态再试试。</span>
              </div>
            ) : null}

            {!itemsQuery.isLoading && !itemsQuery.isError
              ? visibleItems.map(({ item, signal }) => (
                  <article className={classNames('admin-item-row', removalTargetId === item.id && 'selected')} role="row" key={item.id}>
                    <div className="admin-product-cell">
                      <span className="admin-product-thumb">
                        {item.coverImageUrl ? <img src={item.coverImageUrl} alt="" loading="lazy" /> : <PackageCheck size={30} />}
                      </span>
                      <div>
                        <strong>{item.title}</strong>
                        <em>{formatPrice(item.priceCent)}</em>
                        <small>
                          发布者：{item.seller.nickname}　{signal.phoneMasked}
                        </small>
                      </div>
                    </div>
                    <span>{formatCategoryName(item.categoryName)}</span>
                    <span>
                      上架时间：
                      <br />
                      {signal.listedAt}
                    </span>
                    <span>
                      <StatusPill status={item.status} />
                    </span>
                    <span className={signal.reportCount > 0 ? 'admin-report-count has-report' : 'admin-report-count'}>
                      举报 {signal.reportCount}
                    </span>
                    <span className="admin-row-actions">
                      <Link to={`/items/${item.id}`}>
                        <Eye size={15} />
                        查看详情
                      </Link>
                      <button
                        type="button"
                        disabled={item.status === 'VIOLATION_REMOVED' || violationMutation.isPending}
                        onClick={() => openRemovalPanel(item)}
                      >
                        <Ban size={15} />
                        {item.status === 'VIOLATION_REMOVED' ? '已下架' : '下架'}
                      </button>
                    </span>
                  </article>
                ))
              : null}
          </div>

          {removalTarget ? (
            <aside className="admin-removal-popover" aria-label="确认违规下架">
              <header>
                <strong>确认违规下架</strong>
                <button type="button" onClick={() => setRemovalTargetId(null)} aria-label="关闭下架确认">
                  ×
                </button>
              </header>
              <p>下架后商品将不可见，并通知发布者。</p>
              <div className="admin-removal-reasons">
                {removalReasons.map((reason) => (
                  <label key={reason}>
                    <input
                      type="radio"
                      checked={removalReason === reason}
                      onChange={() => setRemovalReason(reason)}
                      name="removal-reason"
                    />
                    {reason}
                  </label>
                ))}
              </div>
              <textarea
                value={removalNote}
                onChange={(event) => setRemovalNote(event.target.value)}
                placeholder="填写下架说明，将同步给发布者..."
              />
              <footer>
                <button type="button" className="danger" disabled={violationMutation.isPending} onClick={confirmRemoval}>
                  {violationMutation.isPending ? '处理中' : '确认下架'}
                </button>
                <button type="button" onClick={() => setRemovalTargetId(null)}>
                  取消
                </button>
              </footer>
            </aside>
          ) : null}

          <footer className="admin-items-pagination" aria-label="商品治理分页">
            <span>
              共 {filteredItems.length} 条，当前第 {currentPage} / {pageCount} 页
            </span>
            <div>
              <button type="button" onClick={() => setPage(Math.max(1, currentPage - 1))} aria-label="上一页">
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: pageCount }).map((_, index) => {
                const pageNumber = index + 1
                return (
                  <button
                    type="button"
                    className={pageNumber === currentPage ? 'active' : undefined}
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
          </footer>
        </section>

        <aside className="admin-items-sidepanels" aria-label="治理辅助信息">
          <section className="admin-side-card">
            <h2>治理规则</h2>
            <ul className="admin-rule-list">
              {['已上架商品可被复核', '违规下架后前台不可见', '下架原因同步给发布者', '严重违规可加入黑名单', '所有操作写入下架记录'].map((rule) => (
                <li key={rule}>
                  <CheckCircle2 size={22} />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="admin-side-card">
            <h2>下架记录快捷查看</h2>
            <div className="admin-record-list">
              {recentRecords.map((record) => (
                <button
                  type="button"
                  onClick={() => {
                    setKeywordInput(record.title)
                    updateRouteFilters({ keyword: record.title, status: 'ALL' })
                  }}
                  key={`${record.title}-${record.time}`}
                >
                  <span>
                    <strong>{record.title}</strong>
                    <small>{record.issue}</small>
                  </span>
                  <em>{record.time}</em>
                </button>
              ))}
            </div>
            <button type="button" className="admin-record-more" onClick={() => updateRouteFilters({ status: 'VIOLATION_REMOVED' })}>
              查看全部记录
            </button>
          </section>
        </aside>
      </div>
    </section>
  )
}

interface FilterSelectProps<TValue extends string> {
  label: string
  onChange: (value: TValue) => void
  options: Array<{ label: string; value: TValue }>
  value: TValue
}

function FilterSelect<TValue extends string>({ label, onChange, options, value }: FilterSelectProps<TValue>) {
  return (
    <label className="admin-filter-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as TValue)}>
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function StatusPill({ status }: { status: ItemStatus }) {
  return <span className={`admin-status-pill admin-status-pill--${status.toLowerCase().replaceAll('_', '-')}`}>{formatStatus(status)}</span>
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="admin-item-row admin-item-row--skeleton" key={index}>
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      ))}
    </>
  )
}

function createMetricCards(items: ItemSummary[]) {
  const enrichedItems = items.map((item) => ({ item, signal: getGovernanceSignal(item) }))
  const onSaleCount = items.filter((item) => item.status === 'ON_SALE').length
  const todayRemovedCount = items.filter((item) => item.status === 'VIOLATION_REMOVED').length
  const pendingReportCount = enrichedItems.filter(({ item, signal }) => item.status === 'ON_SALE' && signal.reportCount > 0).length
  const removedRecordCount = items.filter((item) => item.status === 'VIOLATION_REMOVED' || item.status === 'OFF_SHELF').length

  return [
    { label: '已上架商品', value: onSaleCount.toLocaleString('zh-CN'), icon: Store, tone: 'blue' },
    { label: '今日下架', value: todayRemovedCount.toLocaleString('zh-CN'), icon: ShieldAlert, tone: 'red' },
    { label: '举报待处理', value: pendingReportCount.toLocaleString('zh-CN'), icon: BellRing, tone: 'orange' },
    { label: '下架记录', value: removedRecordCount.toLocaleString('zh-CN'), icon: Archive, tone: 'blue' },
  ]
}

function createRecentRecords(items: ItemSummary[]) {
  return items
    .map((item) => ({ item, signal: getGovernanceSignal(item) }))
    .filter(({ item, signal }) => item.status === 'VIOLATION_REMOVED' || signal.reportCount > 0)
    .sort((first, second) => second.signal.reportCount - first.signal.reportCount)
    .slice(0, 3)
    .map(({ item, signal }) => ({
      issue: signal.issue,
      time: signal.recordTime,
      title: item.title,
    }))
}

function matchesPriceFilter(priceCent: number, filter: PriceFilter) {
  if (filter === 'UNDER_100') {
    return priceCent < 10_000
  }

  if (filter === 'BETWEEN_100_500') {
    return priceCent >= 10_000 && priceCent <= 50_000
  }

  if (filter === 'OVER_500') {
    return priceCent > 50_000
  }

  return true
}

function matchesReportFilter(status: ItemStatus, reportCount: number, filter: ReportFilter) {
  if (filter === 'REPORTED') {
    return reportCount > 0
  }

  if (filter === 'CLEAN') {
    return reportCount === 0
  }

  if (filter === 'NEEDS_REVIEW') {
    return reportCount > 0 || status === 'PENDING_REVIEW'
  }

  return true
}

function sortAdminItems(first: EnrichedAdminItem, second: EnrichedAdminItem, mode: SortMode) {
  if (mode === 'REPORTS') {
    return second.signal.reportCount - first.signal.reportCount
  }

  if (mode === 'PRICE_DESC') {
    return second.item.priceCent - first.item.priceCent
  }

  return new Date(second.item.createdAt).getTime() - new Date(first.item.createdAt).getTime()
}

function parseStatus(value: string | null): StatusFilter {
  if (value && allStatuses.includes(value as ItemStatus)) {
    return value as ItemStatus
  }

  return 'ALL'
}

function parseCategoryId(value: string | null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function getGovernanceSignal(item: ItemSummary): GovernanceSignal {
  const knownSignal = knownSignals[item.id]

  if (knownSignal) {
    return knownSignal
  }

  const reportCount = item.status === 'ON_SALE' ? item.id % 3 : 0

  return {
    reportCount,
    phoneMasked: `202${item.id % 5}****${String(item.id).slice(-4)}`,
    issue: reportCount > 0 ? '用户举报待核实' : '信息正常',
    listedAt: formatListedAt(item.createdAt),
    recordTime: formatListedAt(item.createdAt),
    severity: reportCount > 1 ? 'warning' : 'normal',
  }
}

function formatListedAt(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '时间未知'
  }

  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatPrice(priceCent: number) {
  return `¥ ${(priceCent / 100).toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`
}

function formatCategoryName(name: string) {
  const aliases: Record<string, string> = {
    教材: '教材教辅',
    数码: '数码电子',
  }

  return aliases[name] ?? name
}

function formatStatus(status: ItemStatus) {
  const labels: Record<ItemStatus, string> = {
    DELETED: '已删除',
    DRAFT: '草稿',
    OFF_SHELF: '已下架',
    ON_SALE: '已上架',
    PENDING_REVIEW: '需复核',
    REJECTED: '已驳回',
    SOLD: '已售出',
    VIOLATION_REMOVED: '违规下架',
  }

  return labels[status]
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
