import {
  ArrowLeft,
  BookOpen,
  Box,
  CalendarDays,
  Check,
  Clock3,
  Eye,
  Heart,
  LockKeyhole,
  MessageCircle,
  PackageCheck,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import messageHelperImage from '../../assets/messages/message-helper.webp'
import { MarketplaceShell } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { isDemandFavorited, subscribeDemandFavorites, toggleDemandFavorite } from './demandFavorites'
import { demandItems, demandStatusCopy, getDemandById, type DemandItem } from './demandData'
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

export function PurchaseDemandDetailPage() {
  const { id } = useParams()
  const demand = getDemandById(id)
  const [keyword, setKeyword] = useState('')
  const [, setFavoriteVersion] = useState(0)

  useDocumentTitle(`厦大闲置 - ${demand?.title ?? '求购详情'}`)
  useEffect(() => subscribeDemandFavorites(() => setFavoriteVersion((value) => value + 1)), [])

  if (!demand) {
    return (
      <MarketplaceShell activeUserLabel="购买订单" keyword={keyword} onKeywordChange={setKeyword} searchLabel="搜索求购需求">
        <section className="demand-detail-missing">
          <h1>没有找到这条求购</h1>
          <p>该需求可能已关闭或链接有误。</p>
          <a href="/orders/purchase/demand">返回求购广场</a>
        </section>
      </MarketplaceShell>
    )
  }

  const status = demandStatusCopy[demand.status]
  const favorited = isDemandFavorited(demand.id)
  const matches = demandItems.filter((item) => item.id !== demand.id && item.category === demand.category).concat(
    demandItems.filter((item) => item.id !== demand.id && item.category !== demand.category),
  ).slice(0, 3)

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
                <strong>{demand.budget}</strong>
                <div className="demand-detail-tags">
                  <span>{demand.category}</span><span>{demand.condition}</span><span>{demand.pickup}</span>
                </div>
              </div>
            </div>
            <img src={demand.image} alt={demand.title} />
            <footer>
              <span><Clock3 size={18} />发布时间 {demand.publishedAtFull}</span>
              <span><CalendarDays size={18} />有效期 还剩{demand.expiresIn}</span>
              <span><Eye size={18} />{demand.views}次浏览</span>
              <span><MessageCircle size={18} />{demand.responses}位同学回应</span>
            </footer>
          </article>

          <div className="demand-detail-two-column">
            <section className="demand-detail-panel demand-description-panel">
              <h2>详细描述</h2>
              <div className="demand-description-lines">
                {demand.detailLines.map((line) => <p key={line}><span />{line}</p>)}
              </div>
              <div className="demand-detail-tags">{demand.keywords.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </section>
            <section className="demand-detail-panel demand-author-panel">
              <h2>发布者信息</h2>
              <div className="demand-author-card"><span className="demand-author-avatar">海</span><div><strong>{demand.author}</strong><em>学生认证</em><p>2024级 / {demand.campus}</p></div></div>
              <div className="demand-author-stats"><span>历史求购 <strong>3条</strong></span><span>响应率 <strong>较高</strong></span></div>
              <p className="demand-privacy"><LockKeyhole size={18} />联系方式默认隐藏，保护双方隐私</p>
            </section>
          </div>

          <div className="demand-action-row">
            <section className="demand-detail-panel demand-response-panel">
              <h2>我有此物</h2>
              <div className="demand-response-actions">
                <button type="button" onClick={() => toggleDemandFavorite(demand)}><Heart size={19} fill={favorited ? 'currentColor' : 'none'} />{favorited ? '已收藏需求' : '收藏需求'}</button>
                <a href="/messages"><MessageCircle size={19} />发起私信</a>
                <a className="primary" href="/messages"><PackageCheck size={20} />提交给求购者</a>
              </div>
            </section>
            <section className="demand-detail-panel demand-match-panel">
              <header><h2>可能适合回应的闲置</h2><a href="/items/mine">查看更多</a></header>
              <div className="demand-match-list">{matches.map((item) => <MatchCard item={item} key={item.id} />)}</div>
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
            <dl><div><dt>预算</dt><dd>{demand.budget}</dd></div><div><dt>分类</dt><dd>{demand.category}</dd></div><div><dt>地点</dt><dd>{demand.campus}</dd></div><div><dt>状态</dt><dd>{status.label}</dd></div><div><dt>剩余</dt><dd>{demand.expiresIn}</dd></div></dl>
          </section>
          <section className="demand-detail-panel demand-similar-panel">
            <header><h2>相似求购</h2><a href="/orders/purchase/demand">查看更多</a></header>
            {demandItems.filter((item) => item.id !== demand.id).slice(0, 3).map((item) => <a href={`/orders/purchase/demand/${item.id}/detail`} key={item.id}><Search size={18} />{item.title}</a>)}
          </section>
          <section className="demand-detail-panel demand-safe-panel"><ShieldCheck size={24} /><div><strong>校园安全交易</strong><p>建议在校内公共区域当面验货，平台外付款请谨慎。</p></div></section>
        </aside>
      </section>
    </MarketplaceShell>
  )
}

function MatchCard({ item }: { item: DemandItem }) {
  return <a className="demand-match-card" href={`/orders/purchase/demand/${item.id}/detail`}><img src={item.image} alt="" /><div><strong>{item.title.replace(/^求/, '')}</strong><span>匹配度 {72 + item.id * 3}%</span><b>{item.budget.split(' - ')[0]}</b></div></a>
}
