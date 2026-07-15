import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  BookOpen,
  Box,
  CalendarDays,
  Check,
  Heart,
  LockKeyhole,
  MessageCircle,
  PackageCheck,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
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

const helperTips = ['回应前确认物品成色和型号', '报价尽量接近对方预算', '交易地点建议选择校内公共区域', '不要在平台外提前付款', '确认后可转为订单继续交易']

const tradeFlow = [
  { title: '查看需求', copy: '浏览求购详情', icon: Search },
  { title: '我有此物', copy: '匹配合适的闲置', icon: Box },
  { title: '私信沟通', copy: '协商细节与价格', icon: MessageCircle },
  { title: '确认交易', copy: '达成一致后确认', icon: PackageCheck },
  { title: '转为订单', copy: '生成订单继续交易', icon: BookOpen },
]

const demandStatusCopy: Record<DemandStatus, { label: string; tone: 'blue' | 'green' | 'gray' }> = {
  OPEN: { label: '开放中', tone: 'blue' },
  MATCHED: { label: '已匹配', tone: 'green' },
  CLOSED: { label: '已关闭', tone: 'gray' },
}

export function PurchaseDemandDetailPage() {
  const { id } = useParams()
  const [keyword, setKeyword] = useState('')
  const [, setFavoriteVersion] = useState(0)
  const demandsQuery = useQuery({
    queryKey: queryKeys.demands.list({ page: 1, size: 100 }),
    queryFn: () => listDemands({ page: 1, size: 100 }),
  })
  const demand = useMemo(
    () => demandsQuery.data?.data.items.find((item) => String(item.id) === String(id)),
    [demandsQuery.data?.data.items, id],
  )
  const similarDemands = useMemo(
    () => (demandsQuery.data?.data.items ?? []).filter((item) => item.id !== demand?.id).slice(0, 3),
    [demand?.id, demandsQuery.data?.data.items],
  )

  useDocumentTitle(`厦大闲置 - ${demand?.title ?? '求购详情'}`)
  useEffect(() => subscribeDemandFavorites(() => setFavoriteVersion((value) => value + 1)), [])

  if (demandsQuery.isLoading) {
    return (
      <MarketplaceShell activeUserLabel="购买订单" keyword={keyword} onKeywordChange={setKeyword} searchLabel="搜索求购需求">
        <section className="demand-detail-missing">
          <h1>正在加载求购详情</h1>
          <p>正在从后端求购列表中定位这条需求。</p>
        </section>
      </MarketplaceShell>
    )
  }

  if (demandsQuery.isError || !demand) {
    return (
      <MarketplaceShell activeUserLabel="购买订单" keyword={keyword} onKeywordChange={setKeyword} searchLabel="搜索求购需求">
        <section className="demand-detail-missing">
          <h1>没有找到这条求购</h1>
          <p>后端暂未提供单条求购详情接口；已关闭、非公开或不在当前列表内的需求无法在这里展示。</p>
          <a href="/orders/purchase/demand">返回求购广场</a>
        </section>
      </MarketplaceShell>
    )
  }

  const status = demandStatusCopy[demand.status]
  const favorited = isDemandFavorited(demand.id)

  return (
    <MarketplaceShell
      activeUserLabel="购买订单"
      keyword={keyword}
      mainClassName="orders-main demand-detail-main"
      onKeywordChange={setKeyword}
      onSearch={() => undefined}
      searchLabel="搜索求购需求"
      searchPlaceholder="搜索商品名称、类别、关键词..."
    >
      <section className="favorites-heading orders-heading demand-detail-heading">
        <div>
          <h1>求购详情</h1>
          <p>查看同学的求购需求，合适的话可以带着你的闲置来匹配</p>
        </div>
        <a href="/orders/purchase/demand"><ArrowLeft size={18} />返回求购广场</a>
      </section>

      <nav className="order-section-tabs demand-detail-tabs" aria-label="购买订单导航">
        {purchaseNav.map((item) => <a className={item.label === '求购广场' ? 'active' : undefined} href={item.to} key={item.label}>{item.label}</a>)}
      </nav>

      <section className="demand-detail-layout">
        <div className="demand-detail-content">
          <article className="demand-detail-hero">
            <div className="demand-detail-summary">
              <span className={`demand-status demand-status--${status.tone}`}>{status.label}</span>
              <div>
                <h2>{demand.title}</h2>
                <strong>{formatBudget(demand)}</strong>
                <div className="demand-detail-tags">
                  <span>{demand.categoryName}</span>
                  {demand.keywords.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>
            </div>
            <img src={messageHelperImage} alt="" />
            <footer>
              <span><CalendarDays size={18} />发布时间 {formatDate(demand.createdAt)}</span>
              <span><MessageCircle size={18} />通过平台私信回应</span>
            </footer>
          </article>

          <div className="demand-detail-two-column">
            <section className="demand-detail-panel demand-description-panel">
              <h2>详细描述</h2>
              <div className="demand-description-lines">
                {demand.description.split('\n').filter(Boolean).map((line) => <p key={line}><span />{line}</p>)}
              </div>
              <div className="demand-detail-tags">{demand.keywords.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </section>
            <section className="demand-detail-panel demand-author-panel">
              <h2>发布者信息</h2>
              <div className="demand-author-card">
                <span className="demand-author-avatar">求</span>
                <div><strong>求购发布者</strong><em>学生认证用户</em><p>后端列表接口暂未返回发布者昵称</p></div>
              </div>
              <p className="demand-privacy"><LockKeyhole size={18} />联系方式默认隐藏，保护双方隐私</p>
            </section>
          </div>

          <div className="demand-action-row">
            <section className="demand-detail-panel demand-response-panel">
              <h2>我有此物</h2>
              <div className="demand-response-actions">
                <button type="button" onClick={() => toggleDemandFavorite(toFavoriteItem(demand))}>
                  <Heart size={19} fill={favorited ? 'currentColor' : 'none'} />{favorited ? '已收藏需求' : '收藏需求'}
                </button>
                <a href="/messages"><MessageCircle size={19} />发起私信</a>
                <a className="primary" href="/messages"><PackageCheck size={20} />提交给求购者</a>
              </div>
            </section>
            <section className="demand-detail-panel demand-match-panel">
              <header><h2>相似公开求购</h2><a href="/orders/purchase/demand">查看更多</a></header>
              <div className="demand-match-list">{similarDemands.map((item) => <MatchCard item={item} key={item.id} />)}</div>
            </section>
          </div>

          <section className="demand-trade-flow" aria-label="求购交易流程">
            {tradeFlow.map(({ title, copy, icon: Icon }, index) => (
              <div key={title}><span><Icon size={28} /></span><strong>{title}</strong><small>{copy}</small>{index < tradeFlow.length - 1 ? <b>→</b> : null}</div>
            ))}
          </section>
        </div>

        <aside className="demand-detail-sidebar">
          <section className="demand-detail-panel demand-helper-panel">
            <h2>求购小助手</h2><img src={messageHelperImage} alt="求购沟通提示" />
            <ul>{helperTips.map((tip) => <li key={tip}><Check size={18} />{tip}</li>)}</ul>
          </section>
          <section className="demand-detail-panel demand-overview-panel">
            <h2>需求概览</h2>
            <dl>
              <div><dt>预算</dt><dd>{formatBudget(demand)}</dd></div>
              <div><dt>分类</dt><dd>{demand.categoryName}</dd></div>
              <div><dt>状态</dt><dd>{status.label}</dd></div>
              <div><dt>关键词</dt><dd>{demand.keywords.length}</dd></div>
            </dl>
          </section>
          <section className="demand-detail-panel demand-similar-panel">
            <header><h2>相似求购</h2><a href="/orders/purchase/demand">查看更多</a></header>
            {similarDemands.map((item) => <a href={`/orders/purchase/demand/${item.id}/detail`} key={item.id}><Search size={18} />{item.title}</a>)}
          </section>
          <section className="demand-detail-panel demand-safe-panel"><ShieldCheck size={24} /><div><strong>校园安全交易</strong><p>建议在校内公共区域当面验货，平台外付款请谨慎。</p></div></section>
        </aside>
      </section>
    </MarketplaceShell>
  )
}

function MatchCard({ item }: { item: DemandSummary }) {
  return (
    <a className="demand-match-card" href={`/orders/purchase/demand/${item.id}/detail`}>
      <img src={messageHelperImage} alt="" />
      <div>
        <strong>{item.title}</strong>
        <span>{item.categoryName}</span>
        <b>{formatBudget(item)}</b>
      </div>
    </a>
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
