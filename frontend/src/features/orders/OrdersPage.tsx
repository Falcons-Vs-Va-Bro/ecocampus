import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  ChevronDown,
  CircleX,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import type { OrderListParams, OrderRole, OrderSummary } from '../../api/order.api'
import { listOrders, updateOrderStatus } from '../../api/order.api'
import { queryKeys } from '../../api/queryKeys'
import messageHelperImage from '../../assets/messages/message-helper.webp'
import { MarketplaceShell } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import type { OrderStatus } from '../../types/api'
import './OrdersPage.css'

const emptyOrders: OrderSummary[] = []

const purchaseNav = [
  { label: '我的订单', to: '/orders/purchase' },
  { label: '出售订单', to: '/orders/sale' },
  { label: '求购广场', to: '/orders/purchase/demand' },
  { label: '发布求购', to: '/orders/purchase/demand/new' },
  { label: '我的求购 / 匹配结果', to: '/orders/purchase/demand/mine' },
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

export function OrdersPage({ role = 'BUYER' }: { role?: OrderRole }) {
  const isSale = role === 'SELLER'
  const pageLabel = isSale ? '出售订单' : '购买订单'
  useDocumentTitle(`厦大闲置 - ${pageLabel}`)

  const queryClient = useQueryClient()
  const shouldReduceMotion = useReducedMotion() ?? false
  const [keyword, setKeyword] = useState('')
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
  const displayStats = useMemo(
    () => ({
      PENDING_COMMUNICATION: orders.filter((order) => order.status === 'PENDING_COMMUNICATION').length,
      WAITING_PICKUP: orders.filter((order) => order.status === 'WAITING_PICKUP').length,
      COMPLETED: orders.filter((order) => order.status === 'COMPLETED').length,
      CANCELLED: orders.filter((order) => order.status === 'CANCELLED').length,
    }),
    [orders],
  )
  const visibleOrders = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return orders
      .filter((order) => (status === 'ALL' ? true : order.status === status))
      .filter((order) => {
        if (!normalizedKeyword) {
          return true
        }

        return `${order.itemTitle} ${isSale ? order.buyerNickname ?? '' : order.sellerNickname ?? ''} ${order.remark ?? ''}`
          .toLowerCase()
          .includes(normalizedKeyword)
      })
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  }, [isSale, keyword, orders, status])

  function mutateStatus(orderId: number, targetStatus: OrderStatus, remark: string) {
    updateStatusMutation.mutate({ orderId, targetStatus, remark })
  }

  return (
    <MarketplaceShell
      activeUserLabel={pageLabel}
      keyword={keyword}
      mainClassName={classNames('orders-main', isSale && 'sale-orders-main')}
      onKeywordChange={setKeyword}
      onSearch={() => undefined}
      searchLabel={`搜索${pageLabel}`}
      searchPlaceholder="搜索商品名称、类别、关键词..."
    >
      <motion.section
        className="favorites-heading orders-heading"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.18 }}
      >
        <h1>{pageLabel}</h1>
        <p>{isSale ? '处理买家沟通、自提确认与成交记录' : '查看交易进度，确认沟通、自提与完成状态'}</p>
      </motion.section>

      <section className={classNames('orders-layout', isSale && 'sale-orders-layout')}>
        <div className="orders-list-panel">
          {!isSale ? <nav className="order-section-tabs" aria-label={`${pageLabel}导航`}>
            {purchaseNav.map((item) => (
              <a className={item.label === (isSale ? '出售订单' : '我的订单') ? 'active' : undefined} href={item.to} key={item.label}>
                {item.label}
              </a>
            ))}
          </nav> : null}

          <section className="order-stat-strip" aria-label="订单统计">
            <OrderStat icon={<MessageCircle size={42} />} label="待沟通" value={displayStats.PENDING_COMMUNICATION} />
            <OrderStat icon={<MapPin size={44} />} label={isSale ? '待买家自提' : '待自提'} tone="orange" value={displayStats.WAITING_PICKUP} />
            <OrderStat icon={<CheckCircle2 size={46} />} label="已完成" tone="green" value={displayStats.COMPLETED} />
            <OrderStat icon={<CircleX size={42} />} label="已取消" tone="gray" value={displayStats.CANCELLED} />
          </section>

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
                placeholder={isSale ? '搜索出售订单' : '搜索我的订单'}
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
              <p>请确认 mock 模式或后端接口可用。</p>
              <button type="button" onClick={() => ordersQuery.refetch()}>
                重新加载
              </button>
            </div>
          ) : null}

          {!ordersQuery.isLoading && !ordersQuery.isError && visibleOrders.length === 0 ? (
            <div className="orders-empty-state">
              <h2>没有符合条件的订单</h2>
              <p>换个状态或关键词再看看。</p>
            </div>
          ) : null}

          {!ordersQuery.isLoading && !ordersQuery.isError && visibleOrders.length > 0 ? (
            <div className={classNames('order-card-grid', isSale && 'sale-order-card-grid')}>
              {visibleOrders.map((order, index) => (
                <OrderCard
                  isMutating={updateStatusMutation.isPending}
                  onStatusChange={mutateStatus}
                  order={order}
                  role={role}
                  reduceMotion={shouldReduceMotion}
                  index={index}
                  key={order.id}
                />
              ))}
            </div>
          ) : null}
        </div>

        <aside className={classNames('orders-side-panels', isSale && 'sale-orders-side-panels')}>
          <section className={classNames('order-tips-panel', isSale && 'sale-tips-panel')}>
            <h2>{isSale ? '卖家提示' : '订单提示'}</h2>
            <span className="painted-asset order-panel-art" aria-hidden="true">
              <img src={messageHelperImage} alt="" />
            </span>
            {isSale ? (
              <>
                <TipPoint icon={<CheckCircle2 size={20} />} text="及时回复买家" />
                <TipPoint icon={<CheckCircle2 size={20} />} text="交付前确认价格和地点" />
                <TipPoint icon={<CheckCircle2 size={20} />} text="线下交付后再确认已交付" />
                <TipPoint icon={<CheckCircle2 size={20} />} text="取消后商品可重新上架" />
              </>
            ) : (
              <>
                <TipPoint icon={<ShieldCheck size={20} />} text="待沟通时请确认价格、取货时间和地点" />
                <TipPoint icon={<CheckCircle2 size={20} />} text="待自提订单由买家确认自提后完成" />
                <TipPoint icon={<MessageCircle size={20} />} text="卖家也可在沟通后标记交易完成" />
              </>
            )}
          </section>

          <section className="order-flow-panel">
            <h2>状态流转</h2>
            <div className="order-flow-line" aria-label="订单状态流转">
              <FlowStep label="待沟通" tone="blue" />
              <FlowStep label={isSale ? '待买家自提' : '待自提'} tone="orange" />
              <FlowStep label="已完成" tone="green" />
              <FlowStep label="已取消" tone="gray" side />
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
  const status = statusCopy[order.status]
  const pickupText =
    order.deliveryMode === 'SELF_PICKUP'
      ? `取货：${order.remark ?? '线下自提'}`
      : `配送：${order.remark ?? '校内配送'}`

  return (
    <motion.article
      className={classNames('order-card', role === 'SELLER' && 'sale-order-card')}
      initial={reduceMotion ? false : { opacity: 0, y: 16, rotate: index % 2 === 0 ? -0.2 : 0.2 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.3, delay: 0.12 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -3, rotate: index % 2 === 0 ? -0.15 : 0.15 }}
    >
      <a className="order-image" href={`/items/${order.itemId}`} aria-label={`查看 ${order.itemTitle}`}>
        {order.itemCoverImageUrl ? <img src={order.itemCoverImageUrl} alt={order.itemTitle} loading="lazy" /> : <span>暂无图片</span>}
      </a>

      <div className="order-card-body">
        <header>
          <div>
            <h2>{order.itemTitle}</h2>
            <strong>{typeof order.itemPriceCent === 'number' ? formatPrice(order.itemPriceCent) : '价格待同步'}</strong>
          </div>
          <span className={`order-status-badge order-status-badge--${status.tone}`}>
            {role === 'SELLER' && order.status === 'WAITING_PICKUP' ? '待买家自提' : status.label}
          </span>
        </header>

        <p>{role === 'SELLER' ? `买家：${order.buyerNickname ?? `用户 #${order.buyerId}`}` : `卖家：${order.sellerNickname ?? `用户 #${order.sellerId}`}`}</p>
        {role === 'SELLER' ? <p>交易备注：{order.remark ?? '待沟通确认'}</p> : null}
        <p>{role === 'SELLER' ? `履约方式：${formatDelivery(order.deliveryMode)}` : pickupText}</p>
        {role === 'SELLER' ? <p>最新状态：{order.remark ?? status.label}</p> : null}

        <footer>{renderOrderActions(order, isMutating, onStatusChange, role)}</footer>
      </div>
    </motion.article>
  )
}

function renderOrderActions(
  order: OrderSummary,
  isMutating: boolean,
  onStatusChange: (orderId: number, targetStatus: OrderStatus, remark: string) => void,
  role: OrderRole,
) {
  if (role === 'SELLER') {
    return renderSaleOrderActions(order, isMutating, onStatusChange)
  }

  if (order.status === 'PENDING_COMMUNICATION') {
    return (
      <>
        <ActionLink href="/messages" primary>
          联系卖家
        </ActionLink>
        <ActionButton disabled={isMutating} onClick={() => onStatusChange(order.id, 'CANCELLED', '买家取消订单')} danger>
          取消订单
        </ActionButton>
      </>
    )
  }

  if (order.status === 'WAITING_PICKUP') {
    return (
      <>
        <ActionButton disabled={isMutating} onClick={() => onStatusChange(order.id, 'COMPLETED', '买家已确认自提')} primary>
          确认自提
        </ActionButton>
        <ActionLink href="/messages">联系卖家</ActionLink>
      </>
    )
  }

  if (order.status === 'COMPLETED') {
    return (
      <>
        <ActionLink href={`/items/${order.itemId}`} primary>
          查看详情
        </ActionLink>
        <ActionLink href="/">再次购买</ActionLink>
      </>
    )
  }

  return (
    <>
      <ActionLink href={`/items/${order.itemId}`}>查看详情</ActionLink>
    </>
  )
}

function renderSaleOrderActions(
  order: OrderSummary,
  isMutating: boolean,
  onStatusChange: (orderId: number, targetStatus: OrderStatus, remark: string) => void,
) {
  if (order.status === 'PENDING_COMMUNICATION') {
    return (
      <>
        <ActionLink href="/messages">联系买家</ActionLink>
        <ActionButton disabled={isMutating} onClick={() => onStatusChange(order.id, 'WAITING_PICKUP', '卖家已确认可交易')} primary>
          确认可交易
        </ActionButton>
        <ActionButton disabled={isMutating} onClick={() => onStatusChange(order.id, 'CANCELLED', '卖家取消订单')} danger>
          取消订单
        </ActionButton>
      </>
    )
  }

  if (order.status === 'WAITING_PICKUP') {
    return (
      <>
        <ActionLink href="/messages">联系买家</ActionLink>
        <ActionButton disabled={isMutating} onClick={() => onStatusChange(order.id, 'COMPLETED', '卖家已确认交付')} primary>
          确认已交付
        </ActionButton>
        <ActionLink href="/messages">修改地点</ActionLink>
      </>
    )
  }

  if (order.status === 'COMPLETED') {
    return (
      <>
        <ActionLink href={`/items/${order.itemId}`}>查看详情</ActionLink>
        <ActionLink href="/publish">再次发布</ActionLink>
      </>
    )
  }

  return (
    <>
      <ActionLink href={`/items/${order.itemId}`}>查看原因</ActionLink>
      <ActionLink href="/items/mine">重新上架</ActionLink>
    </>
  )
}

interface ActionButtonProps {
  children: ReactNode
  danger?: boolean
  disabled?: boolean
  onClick: () => void
  primary?: boolean
}

function ActionButton({ children, danger, disabled, onClick, primary }: ActionButtonProps) {
  return (
    <button
      type="button"
      className={classNames('order-action', primary && 'primary', danger && 'danger')}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

interface ActionLinkProps {
  children: ReactNode
  href: string
  primary?: boolean
}

function ActionLink({ children, href, primary }: ActionLinkProps) {
  return (
    <a className={classNames('order-action', primary && 'primary')} href={href}>
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
  side?: boolean
  tone: 'blue' | 'orange' | 'green' | 'gray'
}

function FlowStep({ label, side, tone }: FlowStepProps) {
  return <span className={classNames('order-flow-step', `order-flow-step--${tone}`, side && 'side')}>{label}</span>
}

function formatPrice(priceCent: number) {
  return `¥${(priceCent / 100).toFixed(2)}`
}

function formatDelivery(deliveryMode: OrderSummary['deliveryMode']) {
  return deliveryMode === 'SELF_PICKUP' ? '线下自提' : '校内配送'
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
