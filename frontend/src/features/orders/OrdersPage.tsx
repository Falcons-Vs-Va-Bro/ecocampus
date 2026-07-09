import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  ChevronDown,
  CircleX,
  Info,
  MapPin,
  MessageCircle,
  PackageCheck,
  RotateCcw,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { OrderListParams, OrderRole, OrderSummary } from '../../api/order.api'
import { listOrders, updateOrderStatus } from '../../api/order.api'
import { getMockOrderMeta } from '../../api/mock/orders.mock'
import { queryKeys } from '../../api/queryKeys'
import messageHelperImage from '../../assets/messages/message-helper.webp'
import { MarketplaceShell } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import type { OrderStatus } from '../../types/api'
import './OrdersPage.css'

const emptyOrders: OrderSummary[] = []

const roleOptions: Array<{ label: string; value: OrderRole }> = [
  { label: '购买订单', value: 'BUYER' },
  { label: '出售订单', value: 'SELLER' },
]

const statusOptions: Array<{ label: string; value: OrderStatus | 'ALL' }> = [
  { label: '全部', value: 'ALL' },
  { label: '待沟通', value: 'PENDING_COMMUNICATION' },
  { label: '待自提', value: 'WAITING_PICKUP' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已取消', value: 'CANCELLED' },
]

const statusCopy: Record<OrderStatus, { label: string; tone: 'blue' | 'orange' | 'green' | 'gray' }> = {
  PENDING_COMMUNICATION: { label: '待沟通', tone: 'blue' },
  WAITING_PICKUP: { label: '待自提', tone: 'orange' },
  COMPLETED: { label: '已完成', tone: 'green' },
  CANCELLED: { label: '已取消', tone: 'gray' },
}

export function OrdersPage() {
  useDocumentTitle('厦大闲置 - 我的订单')

  const queryClient = useQueryClient()
  const shouldReduceMotion = useReducedMotion() ?? false
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState('')
  const role = normalizeOrderRole(searchParams.get('role'))
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL')

  const orderParams = useMemo<OrderListParams>(() => ({ role, page: 1, size: 50 }), [role])
  const ordersQuery = useQuery({
    queryKey: queryKeys.orders.list(orderParams),
    queryFn: () => listOrders(orderParams),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, targetStatus, remark }: { orderId: number; targetStatus: OrderStatus; remark: string }) =>
      updateOrderStatus(orderId, { targetStatus, remark }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  const orders = ordersQuery.data?.data.items ?? emptyOrders
  const stats = useMemo(() => getOrderStats(orders), [orders])

  const visibleOrders = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return orders
      .filter((order) => (status === 'ALL' ? true : order.status === status))
      .filter((order) => {
        if (!normalizedKeyword) {
          return true
        }

        const meta = getMockOrderMeta(order.id)
        return `${order.itemTitle} ${order.remark ?? ''} ${meta?.sellerName ?? ''} ${meta?.buyerName ?? ''} ${
          meta?.pickupSpot ?? ''
        }`
          .toLowerCase()
          .includes(normalizedKeyword)
      })
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  }, [keyword, orders, status])

  function mutateStatus(orderId: number, targetStatus: OrderStatus, remark: string) {
    updateStatusMutation.mutate({ orderId, targetStatus, remark })
  }

  function selectRole(nextRole: OrderRole) {
    if (searchParams.get('role') !== nextRole) {
      const nextSearchParams = new URLSearchParams(searchParams)
      nextSearchParams.set('role', nextRole)
      setSearchParams(nextSearchParams)
    }

    setStatus('ALL')
  }

  return (
    <MarketplaceShell
      activeUserLabel={role === 'BUYER' ? '购买订单' : '出售订单'}
      keyword={keyword}
      mainClassName="orders-main"
      onKeywordChange={setKeyword}
      onSearch={() => undefined}
      searchLabel="搜索我的订单"
      searchPlaceholder="搜索商品、同学、取货地点..."
    >
      <motion.section
        className="favorites-heading orders-heading"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.24 }}
      >
        <h1>我的订单</h1>
        <p>查看交易进度，确认沟通、自提与完成状态</p>
      </motion.section>

      <section className="orders-layout">
        <div className="orders-list-panel">
          <section className="order-stat-strip" aria-label="订单统计">
            <OrderStat icon={<MessageCircle size={40} />} label="待沟通" value={stats.PENDING_COMMUNICATION} />
            <OrderStat icon={<MapPin size={40} />} label="待自提" tone="orange" value={stats.WAITING_PICKUP} />
            <OrderStat icon={<CheckCircle2 size={42} />} label="已完成" tone="green" value={stats.COMPLETED} />
            <OrderStat icon={<CircleX size={40} />} label="已取消" tone="gray" value={stats.CANCELLED} />
          </section>

          <div className="order-role-tabs" role="tablist" aria-label="订单角色">
            {roleOptions.map((item) => (
              <button
                type="button"
                className={role === item.value ? 'active' : undefined}
                onClick={() => selectRole(item.value)}
                role="tab"
                aria-selected={role === item.value}
                key={item.value}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="order-toolbar">
            <div className="order-status-tabs" role="tablist" aria-label="订单状态">
              {statusOptions.map((item) => (
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
                aria-label="搜索订单"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索我的订单"
              />
            </form>

            <button type="button" className="order-sort-button">
              最近更新
              <ChevronDown size={17} />
            </button>
          </div>

          {ordersQuery.isLoading ? (
            <div className="order-card-grid" aria-label="订单加载中">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="order-card skeleton" key={index}>
                  <span />
                  <div />
                </div>
              ))}
            </div>
          ) : null}

          {ordersQuery.isError ? (
            <div className="orders-empty-state">
              <h2>订单加载失败</h2>
              <p>请确认已启用 mock 模式或后端接口可用。</p>
              <button type="button" onClick={() => ordersQuery.refetch()}>
                重新加载
              </button>
            </div>
          ) : null}

          {!ordersQuery.isLoading && !ordersQuery.isError && visibleOrders.length === 0 ? (
            <div className="orders-empty-state">
              <h2>没有符合条件的订单</h2>
              <p>换个状态、角色或关键词再看看。</p>
            </div>
          ) : null}

          {!ordersQuery.isLoading && !ordersQuery.isError && visibleOrders.length > 0 ? (
            <div className="order-card-grid">
              {visibleOrders.map((order, index) => (
                <OrderCard
                  isMutating={updateStatusMutation.isPending}
                  onStatusChange={mutateStatus}
                  order={order}
                  reduceMotion={shouldReduceMotion}
                  role={role}
                  index={index}
                  key={order.id}
                />
              ))}
            </div>
          ) : null}
        </div>

        <aside className="orders-side-panels">
          <section className="order-tips-panel">
            <h2>订单提示</h2>
            <TipPoint icon={<ShieldCheck size={20} />} text="待沟通时请确认价格、取货时间和地点" />
            <TipPoint icon={<CheckCircle2 size={20} />} text="待自提订单由买家确认自提后完成" />
            <TipPoint icon={<MessageCircle size={20} />} text="沟通后仍可标记交易完成或取消订单" />
            <span className="painted-asset order-panel-art" aria-hidden="true">
              <img src={messageHelperImage} alt="" />
            </span>
          </section>

          <section className="order-flow-panel">
            <h2>状态流转</h2>
            <div className="order-flow-line" aria-label="订单状态流转">
              <FlowStep label="待沟通" tone="blue" />
              <FlowStep label="待自提" tone="orange" />
              <FlowStep label="已完成" tone="green" />
            </div>
            <p>
              <XCircle size={21} />
              无法继续交易时可取消订单
            </p>
          </section>
        </aside>
      </section>
    </MarketplaceShell>
  )
}

interface OrderCardProps {
  index: number
  isMutating: boolean
  onStatusChange: (orderId: number, targetStatus: OrderStatus, remark: string) => void
  order: OrderSummary
  reduceMotion: boolean
  role: OrderRole
}

function OrderCard({ index, isMutating, onStatusChange, order, reduceMotion, role }: OrderCardProps) {
  const meta = getMockOrderMeta(order.id)
  const status = statusCopy[order.status]
  const counterpartyLabel = role === 'BUYER' ? '卖家' : '买家'
  const counterpartyName = role === 'BUYER' ? (meta?.sellerName ?? `用户 #${order.sellerId}`) : (meta?.buyerName ?? `用户 #${order.buyerId}`)
  const pickupText =
    order.deliveryMode === 'SELF_PICKUP'
      ? `取货：${meta?.pickupSpot ?? '线下自提'}`
      : `配送：${meta?.pickupSpot ?? '校内配送'}`

  return (
    <motion.article
      className="order-card"
      initial={reduceMotion ? false : { opacity: 0, y: 16, rotate: index % 2 === 0 ? -0.25 : 0.25 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.32, delay: 0.18 + index * 0.045, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -3, rotate: index % 2 === 0 ? -0.2 : 0.2 }}
    >
      <a className="order-image" href={`/items/${order.itemId}`} aria-label={`查看 ${order.itemTitle}`}>
        {meta?.coverImageUrl ? <img src={meta.coverImageUrl} alt={order.itemTitle} loading="lazy" /> : <span>待同步</span>}
      </a>

      <div className="order-card-body">
        <header>
          <div>
            <h2>{order.itemTitle}</h2>
            <strong>{meta ? formatPrice(meta.priceCent) : '价格待同步'}</strong>
          </div>
          <span className={`order-status-badge order-status-badge--${status.tone}`}>{status.label}</span>
        </header>

        <p>
          {counterpartyLabel}：{counterpartyName}
        </p>
        <p>{pickupText}</p>
        <p>{meta?.timelineText ?? order.remark ?? formatDate(order.createdAt)}</p>

        <footer>{renderOrderActions(order, role, isMutating, onStatusChange)}</footer>
      </div>
    </motion.article>
  )
}

function renderOrderActions(
  order: OrderSummary,
  role: OrderRole,
  isMutating: boolean,
  onStatusChange: (orderId: number, targetStatus: OrderStatus, remark: string) => void,
) {
  if (order.status === 'PENDING_COMMUNICATION') {
    if (role === 'SELLER') {
      return (
        <>
          <ActionButton
            icon={<PackageCheck size={17} />}
            disabled={isMutating}
            onClick={() => onStatusChange(order.id, 'WAITING_PICKUP', '卖家已确认自提安排')}
            primary
          >
            确认自提
          </ActionButton>
          <ActionLink href="/messages" icon={<MessageCircle size={17} />}>
            联系买家
          </ActionLink>
        </>
      )
    }

    return (
      <>
        <ActionLink href="/messages" icon={<MessageCircle size={17} />} primary>
          继续沟通
        </ActionLink>
        <ActionButton
          icon={<XCircle size={17} />}
          disabled={isMutating}
          onClick={() => onStatusChange(order.id, 'CANCELLED', '买家取消订单')}
          danger
        >
          取消订单
        </ActionButton>
      </>
    )
  }

  if (order.status === 'WAITING_PICKUP') {
    return (
      <>
        {role === 'BUYER' ? (
          <ActionButton
            icon={<CheckCircle2 size={17} />}
            disabled={isMutating}
            onClick={() => onStatusChange(order.id, 'COMPLETED', '买家已确认完成')}
            primary
          >
            确认完成
          </ActionButton>
        ) : (
          <ActionLink href="/messages" icon={<MessageCircle size={17} />} primary>
            提醒自提
          </ActionLink>
        )}
        <ActionLink href="/messages" icon={<MessageCircle size={17} />}>
          联系对方
        </ActionLink>
      </>
    )
  }

  if (order.status === 'COMPLETED') {
    return (
      <>
        <ActionLink href={`/items/${order.itemId}`} icon={<Info size={17} />} primary>
          查看详情
        </ActionLink>
        <ActionLink href="/" icon={<RotateCcw size={17} />}>
          再逛逛
        </ActionLink>
      </>
    )
  }

  return (
    <>
      <ActionLink href={`/items/${order.itemId}`} icon={<Info size={17} />}>
        查看原因
      </ActionLink>
      <ActionLink href="/" icon={<RotateCcw size={17} />}>
        重新看看
      </ActionLink>
    </>
  )
}

interface ActionButtonProps {
  children: ReactNode
  danger?: boolean
  disabled?: boolean
  icon: ReactNode
  onClick: () => void
  primary?: boolean
}

function ActionButton({ children, danger, disabled, icon, onClick, primary }: ActionButtonProps) {
  return (
    <button
      type="button"
      className={classNames('order-action', primary && 'primary', danger && 'danger')}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  )
}

interface ActionLinkProps {
  children: ReactNode
  href: string
  icon: ReactNode
  primary?: boolean
}

function ActionLink({ children, href, icon, primary }: ActionLinkProps) {
  return (
    <a className={classNames('order-action', primary && 'primary')} href={href}>
      {icon}
      {children}
    </a>
  )
}

interface OrderStatProps {
  icon: ReactNode
  label: string
  tone?: 'orange' | 'green' | 'gray'
  value: number
}

function OrderStat({ icon, label, tone, value }: OrderStatProps) {
  return (
    <div className={classNames('order-stat', tone && `order-stat--${tone}`)}>
      {icon}
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  )
}

interface TipPointProps {
  icon: ReactNode
  text: string
}

function TipPoint({ icon, text }: TipPointProps) {
  return (
    <p className="order-tip-point">
      <span>{icon}</span>
      {text}
    </p>
  )
}

interface FlowStepProps {
  label: string
  tone: 'blue' | 'orange' | 'green'
}

function FlowStep({ label, tone }: FlowStepProps) {
  return (
    <span className={`order-flow-step order-flow-step--${tone}`}>
      {label}
    </span>
  )
}

function getOrderStats(orders: OrderSummary[]) {
  return orders.reduce(
    (stats, order) => ({
      ...stats,
      [order.status]: stats[order.status] + 1,
    }),
    {
      PENDING_COMMUNICATION: 0,
      WAITING_PICKUP: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    } satisfies Record<OrderStatus, number>,
  )
}

function normalizeOrderRole(value: string | null): OrderRole {
  return value === 'SELLER' ? 'SELLER' : 'BUYER'
}

function formatPrice(priceCent: number) {
  return `¥${(priceCent / 100).toFixed(2)}`
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '刚刚更新'
  }

  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
