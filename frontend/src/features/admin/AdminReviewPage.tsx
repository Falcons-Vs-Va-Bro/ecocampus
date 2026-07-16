import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Ban,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Image as ImageIcon,
  Inbox,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  X,
  XCircle,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { AdminReviewItemSummary } from '../../api/admin.api'
import { listReviewItems, reviewItem } from '../../api/admin.api'
import { queryKeys } from '../../api/queryKeys'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import './AdminReviewPage.css'

const emptyReviewItems: AdminReviewItemSummary[] = []

const categories = ['全部', '教材教辅', '数码电子', '宿舍用品', '运动户外', '生活日用', '其他']

const rejectionReasons = [
  { value: '虚假信息', label: '虚假信息' },
  { value: '非学生商品', label: '非学生商品' },
  { value: '违禁物品', label: '违禁物品' },
  { value: '图片不清晰', label: '图片不清晰' },
  { value: '价格异常', label: '价格异常' },
  { value: '其他原因', label: '其他原因' },
]

const sortOptions = [
  { value: 'submitted_desc', label: '按提交时间排序' },
  { value: 'price_desc', label: '价格从高到低' },
  { value: 'price_asc', label: '价格从低到高' },
] as const

type SortValue = (typeof sortOptions)[number]['value']

interface ReviewMutationVariables {
  approved: boolean
  item: AdminReviewItemSummary
  reason: string
}

export function AdminReviewPage() {
  useDocumentTitle('厦大闲置后台 - 商品审核')

  const shouldReduceMotion = useReducedMotion() ?? false
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [rejectingItemId, setRejectingItemId] = useState<number | null>(null)
  const [selectedReason, setSelectedReason] = useState(rejectionReasons[0].value)
  const [rejectNote, setRejectNote] = useState('')
  const [reviewCounters, setReviewCounters] = useState({
    approvedToday: 18,
    rejectedToday: 5,
    reportedAgain: 3,
  })

  const keyword = searchParams.get('keyword') ?? ''
  const category = searchParams.get('category') ?? '全部'
  const sort = normalizeSort(searchParams.get('sort'))

  const reviewParams = useMemo(() => ({ status: 'PENDING_REVIEW' as const, page: 1, size: 30 }), [])
  const reviewItemsQuery = useQuery({
    queryKey: queryKeys.admin.reviewItems(reviewParams),
    queryFn: () => listReviewItems(reviewParams),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ approved, item, reason }: ReviewMutationVariables) => reviewItem(item.id, { approved, reason }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'items', 'review'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard })
      setRejectingItemId(null)
      setRejectNote('')
      setSelectedReason(rejectionReasons[0].value)
      setReviewCounters((current) => ({
        ...current,
        approvedToday: variables.approved ? current.approvedToday + 1 : current.approvedToday,
        rejectedToday: variables.approved ? current.rejectedToday : current.rejectedToday + 1,
      }))
    },
  })

  const allItems = reviewItemsQuery.data?.data.items ?? emptyReviewItems
  const visibleItems = useMemo(() => filterReviewItems(allItems, keyword, category, sort), [allItems, category, keyword, sort])
  const activeItem = visibleItems.find((item) => item.id === rejectingItemId)
  const activeReasonLabel = rejectionReasons.find((reason) => reason.value === selectedReason)?.label ?? selectedReason

  function updateFilter(key: string, value: string) {
    const nextParams = new URLSearchParams(searchParams)

    if (!value || value === '全部' || value === 'submitted_desc') {
      nextParams.delete(key)
    } else {
      nextParams.set(key, value)
    }

    setSearchParams(nextParams)
  }

  function approveItem(item: AdminReviewItemSummary) {
    reviewMutation.mutate({
      approved: true,
      item,
      reason: '信息完整，允许上架',
    })
  }

  function confirmReject() {
    if (!activeItem) {
      return
    }

    const normalizedNote = rejectNote.trim()
    const reason = normalizedNote ? `${activeReasonLabel}：${normalizedNote}` : activeReasonLabel

    reviewMutation.mutate({
      approved: false,
      item: activeItem,
      reason,
    })
  }

  return (
    <div className="admin-review-page">
      <section className="admin-review-layout">
        <div className="admin-review-main">
          <section className="admin-review-heading">
            <div>
              <h1>商品审核</h1>
              <p>审核待上架商品，拦截违规信息与非学生商品</p>
            </div>
            <button type="button" className="admin-refresh-button" onClick={() => reviewItemsQuery.refetch()}>
              <RefreshCw size={17} />
              刷新
            </button>
          </section>

          <section className="admin-review-stats" aria-label="商品审核统计">
            <StatCard icon={<ClipboardCheck size={37} />} label="待审核" value={reviewItemsQuery.data?.data.total ?? allItems.length} />
            <StatCard icon={<CheckCircle2 size={39} />} label="今日通过" value={reviewCounters.approvedToday} tone="green" />
            <StatCard icon={<XCircle size={39} />} label="今日拒绝" value={reviewCounters.rejectedToday} tone="red" />
            <StatCard icon={<ShieldCheck size={38} />} label="举报复核" value={reviewCounters.reportedAgain} tone="amber" />
          </section>

          <section className="admin-review-toolbar" aria-label="商品审核筛选">
            <div className="admin-review-tabs" role="tablist" aria-label="商品分类">
              {categories.map((item) => (
                <button
                  type="button"
                  className={category === item ? 'active' : undefined}
                  onClick={() => updateFilter('category', item)}
                  role="tab"
                  aria-selected={category === item}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="admin-sort-select">
              <select value={sort} onChange={(event) => updateFilter('sort', event.target.value)} aria-label="审核排序">
                {sortOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={17} aria-hidden="true" />
            </label>
          </section>

          {keyword ? (
            <div className="admin-active-search">
              <span>搜索：{keyword}</span>
              <button type="button" onClick={() => updateFilter('keyword', '')} aria-label="清除搜索">
                <X size={16} />
              </button>
            </div>
          ) : null}

          {reviewItemsQuery.isLoading ? (
            <div className="admin-review-list" aria-label="审核列表加载中">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="admin-review-card skeleton" key={index}>
                  <span />
                  <div />
                  <div />
                </div>
              ))}
            </div>
          ) : null}

          {reviewItemsQuery.isError ? (
            <div className="admin-review-empty">
              <AlertTriangle size={42} />
              <h2>商品审核列表加载失败</h2>
              <p>请确认已启用 mock 模式或后端后台接口可用。</p>
              <button type="button" onClick={() => reviewItemsQuery.refetch()}>
                重新加载
              </button>
            </div>
          ) : null}

          {!reviewItemsQuery.isLoading && !reviewItemsQuery.isError && visibleItems.length === 0 ? (
            <div className="admin-review-empty">
              <Inbox size={44} />
              <h2>暂无符合条件的待审商品</h2>
              <p>换个分类或搜索关键词再看。</p>
            </div>
          ) : null}

          {!reviewItemsQuery.isLoading && !reviewItemsQuery.isError && visibleItems.length > 0 ? (
            <section className="admin-review-list" aria-label="待审核商品列表">
              {visibleItems.map((item, index) => (
                <ReviewItemCard
                  item={item}
                  index={index}
                  isRejecting={rejectingItemId === item.id}
                  isReviewing={reviewMutation.isPending && reviewMutation.variables?.item.id === item.id}
                  reduceMotion={shouldReduceMotion}
                  rejectNote={rejectNote}
                  selectedReason={selectedReason}
                  onApprove={approveItem}
                  onCancelReject={() => setRejectingItemId(null)}
                  onConfirmReject={confirmReject}
                  onOpenReject={(nextItem) => {
                    setRejectingItemId(nextItem.id)
                    setSelectedReason(rejectionReasons[0].value)
                    setRejectNote('')
                  }}
                  onRejectNoteChange={setRejectNote}
                  onReasonChange={setSelectedReason}
                  key={item.id}
                />
              ))}
            </section>
          ) : null}
        </div>

        <aside className="admin-review-side">
          <section className="admin-side-panel">
            <h2>审核规则</h2>
            <RuleItem text="确认发布者为已校验学生" />
            <RuleItem text="商品图片清晰真实" />
            <RuleItem text="价格与描述基本一致" />
            <RuleItem text="不得发布违禁或校外商品" />
            <RuleItem text="拒绝后需填写原因" />
          </section>

          <section className="admin-side-panel admin-flow-panel">
            <h2>审核结果流转</h2>
            <FlowStep icon={<ShoppingCart size={27} />} text="通过 → 商品上架" />
            <FlowStep icon={<Ban size={27} />} text="拒绝 → 标记违规" tone="red" />
            <FlowStep icon={<Inbox size={26} />} text="发布者收到消息通知" />
          </section>
        </aside>
      </section>
    </div>
  )
}

interface StatCardProps {
  icon: ReactNode
  label: string
  tone?: 'green' | 'red' | 'amber'
  value: number
}

function StatCard({ icon, label, value, tone }: StatCardProps) {
  return (
    <article className={classNames('admin-stat-card', tone && `admin-stat-card--${tone}`)}>
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </article>
  )
}

interface ReviewItemCardProps {
  index: number
  isRejecting: boolean
  isReviewing: boolean
  item: AdminReviewItemSummary
  onApprove: (item: AdminReviewItemSummary) => void
  onCancelReject: () => void
  onConfirmReject: () => void
  onOpenReject: (item: AdminReviewItemSummary) => void
  onReasonChange: (reason: string) => void
  onRejectNoteChange: (note: string) => void
  reduceMotion: boolean
  rejectNote: string
  selectedReason: string
}

function ReviewItemCard({
  index,
  isRejecting,
  isReviewing,
  item,
  onApprove,
  onCancelReject,
  onConfirmReject,
  onOpenReject,
  onReasonChange,
  onRejectNoteChange,
  reduceMotion,
  rejectNote,
  selectedReason,
}: ReviewItemCardProps) {
  return (
    <motion.article
      className={classNames('admin-review-card', isRejecting && 'admin-review-card--rejecting')}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.26, delay: 0.05 + index * 0.045 }}
    >
      <Link className="admin-review-image" to={`/items/${item.id}`} aria-label={`查看 ${item.title} 前台详情`}>
        {item.coverImageUrl ? <img src={item.coverImageUrl} alt={item.title} loading="lazy" /> : <ImageIcon size={40} />}
      </Link>

      <div className="admin-review-copy">
        <Link to={`/items/${item.id}`} className="admin-review-title">
          {item.title}
        </Link>
        <strong>{formatPrice(item.priceCent)}</strong>
        <p>
          发布者：{item.sellerNickname}　{item.studentNoMasked ?? '学号待补充'}
        </p>
        <p>{item.description ?? '发布者暂未填写详细描述。'}</p>
        <div className="admin-review-flags" aria-label="审核提示">
          {(item.reviewFlags ?? ['待人工复核']).map((flag) => (
            <span key={flag}>{flag}</span>
          ))}
          {(item.sellerViolationCount ?? 0) > 0 ? <em>历史违规 {item.sellerViolationCount} 次</em> : null}
        </div>
      </div>

      <dl className="admin-review-meta">
        <div>
          <dt>分类</dt>
          <dd>{item.categoryName}</dd>
        </div>
        <div>
          <dt>提交时间</dt>
          <dd>{formatReviewTime(item.submittedAt ?? item.createdAt)}</dd>
        </div>
        <div>
          <dt>图片</dt>
          <dd>{item.imageCount ?? (item.coverImageUrl ? 1 : 0)} 张</dd>
        </div>
      </dl>

      <div className="admin-review-actions">
        <button type="button" className="approve" disabled={isReviewing} onClick={() => onApprove(item)}>
          <Check size={17} />
          通过上架
        </button>
        <button type="button" className="reject" disabled={isReviewing} onClick={() => onOpenReject(item)}>
          <X size={17} />
          拒绝
        </button>
      </div>

      {isRejecting ? (
        <form
          className="admin-reject-panel"
          onSubmit={(event) => {
            event.preventDefault()
            onConfirmReject()
          }}
        >
          <h3>选择拒绝原因</h3>
          <div className="admin-reject-options">
            {rejectionReasons.map((reason) => (
              <label key={reason.value}>
                <input
                  type="radio"
                  checked={selectedReason === reason.value}
                  onChange={() => onReasonChange(reason.value)}
                />
                <span>{reason.label}</span>
              </label>
            ))}
          </div>
          <textarea
            value={rejectNote}
            onChange={(event) => onRejectNoteChange(event.target.value)}
            placeholder="补充说明，将同步给发布者..."
            rows={3}
          />
          <div>
            <button type="submit" disabled={isReviewing}>
              确认拒绝
            </button>
            <button type="button" onClick={onCancelReject}>
              取消
            </button>
          </div>
        </form>
      ) : null}
    </motion.article>
  )
}

interface RuleItemProps {
  text: string
}

function RuleItem({ text }: RuleItemProps) {
  return (
    <p className="admin-rule-item">
      <CheckCircle2 size={20} />
      <span>{text}</span>
    </p>
  )
}

interface FlowStepProps {
  icon: ReactNode
  text: string
  tone?: 'red'
}

function FlowStep({ icon, text, tone }: FlowStepProps) {
  return (
    <div className={classNames('admin-flow-step', tone && 'admin-flow-step--red')}>
      <span>{icon}</span>
      <strong>{text}</strong>
    </div>
  )
}

function filterReviewItems(items: AdminReviewItemSummary[], keyword: string, category: string, sort: SortValue) {
  const normalizedKeyword = keyword.trim().toLowerCase()

  return [...items]
    .filter((item) => (category === '全部' ? true : item.categoryName === category))
    .filter((item) => {
      if (!normalizedKeyword) {
        return true
      }

      return `${item.title} ${item.categoryName} ${item.sellerNickname} ${item.studentNoMasked ?? ''}`
        .toLowerCase()
        .includes(normalizedKeyword)
    })
    .sort((left, right) => {
      if (sort === 'price_desc') {
        return right.priceCent - left.priceCent
      }

      if (sort === 'price_asc') {
        return left.priceCent - right.priceCent
      }

      return new Date(right.submittedAt ?? right.createdAt).getTime() - new Date(left.submittedAt ?? left.createdAt).getTime()
    })
}

function normalizeSort(value: string | null): SortValue {
  return sortOptions.some((option) => option.value === value) ? (value as SortValue) : 'submitted_desc'
}

function formatPrice(priceCent: number) {
  const price = priceCent / 100
  return `¥ ${Number.isInteger(price) ? price.toFixed(0) : price.toFixed(2)}`
}

function formatReviewTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '刚刚'
  }

  const now = new Date()
  const today = now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const time = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })

  if (date.toDateString() === today) {
    return `今天 ${time}`
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${time}`
  }

  return `${date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })} ${time}`
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
