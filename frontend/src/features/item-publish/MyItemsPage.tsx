import {
  Bell,
  BookOpen,
  Box,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock,
  ClipboardCheck,
  ClipboardList,
  Dumbbell,
  Eye,
  Grid3X3,
  Home,
  Mail,
  MessageCircle,
  Package,
  Pencil,
  Search,
  ShieldAlert,
  ShoppingBasket,
  Sparkles,
  Star,
  Store,
  User,
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { listMyItems, setItemOffShelf, setItemOnSale, type MyItemSummary } from '../../api/item.api'
import { queryKeys } from '../../api/queryKeys'
import campusGateImage from '../../assets/favorites/campus-gate.webp'
import campusSidebarImage from '../../assets/favorites/campus-sidebar.webp'
import { UnifiedMarketplacePage } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useUnreadMessageCount } from '../../hooks/useUnreadMessageCount'
import './MyItemsPage.css'
import '../../styles/marketplace-consistency.css'

type MineStatus = 'on_sale' | 'off_shelf' | 'reviewing' | 'rejected' | 'sold' | 'violation'

interface MineItem {
  id: number
  title: string
  price: string
  category: string
  updatedAt: string
  image: string
  status: MineStatus
}

const statusLabels: Record<MineStatus, string> = {
  on_sale: '已上架',
  off_shelf: '已下架',
  reviewing: '审核中',
  rejected: '审核驳回',
  sold: '已售出',
  violation: '违规下架',
}

const categoryNav = [
  { label: '首页', icon: Home, to: '/' },
  { label: '全部分类', icon: Grid3X3, to: '/items' },
  { label: '教材教辅', icon: BookOpen, to: '/items/textbook' },
  { label: '数码电子', icon: Camera, to: '/items/digital' },
  { label: '宿舍用品', icon: Package, to: '/items/dorm' },
  { label: '运动户外', icon: Dumbbell, to: '/items/outdoors' },
  { label: '生活日用', icon: ShoppingBasket, to: '/items/daily-goods' },
  { label: '美妆个护', icon: Sparkles, to: '/items/make-up' },
  { label: '乐器文具', icon: Pencil, to: '/items/instruments' },
  { label: '票务转让', icon: ClipboardList, to: '/items/tickets' },
  { label: '其他', icon: Box, to: '/items/others' },
]

const userNav = [
  { label: '我的收藏', icon: Star, to: '/favorites' },
  { label: '我的发布', icon: Store, to: '/items/mine', active: true },
  { label: '购买订单', icon: ClipboardList, to: '/orders/purchase' },
  { label: '出售订单', icon: BriefcaseBusiness, to: '/orders/sale' },
  { label: '消息中心', icon: MessageCircle, to: '/messages' },
  { label: '个人中心', icon: User, to: '/profile' },
]

const tabs = [
  { label: '在售', value: 'on_sale' },
  { label: '已下架', value: 'off_shelf' },
  { label: '审核中', value: 'reviewing' },
  { label: '审核驳回', value: 'rejected' },
  { label: '已售出', value: 'sold' },
  { label: '违规', value: 'violation' },
] as const

export function MyItemsPage() {
  const unreadMessageCount = useUnreadMessageCount()
  const queryClient = useQueryClient()
  useDocumentTitle('厦大闲置 - 我的发布')
  const [activeTab, setActiveTab] = useState<MineStatus>(() => getInitialTab())
  const [keyword, setKeyword] = useState('')
  const itemsQuery = useQuery({
    queryKey: queryKeys.items.mine({ page: 1, size: 100 }),
    queryFn: () => listMyItems({ page: 1, size: 100 }),
  })
  const statusMutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: number; status: MineStatus }) =>
      status === 'on_sale' ? setItemOnSale(itemId) : setItemOffShelf(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items', 'mine'] }),
  })
  const items = useMemo(() => (itemsQuery.data?.data.items ?? []).map(toMineItem), [itemsQuery.data])

  const counts = useMemo(
    () => ({
      on_sale: items.filter((item) => item.status === 'on_sale').length,
      reviewing: items.filter((item) => item.status === 'reviewing').length,
      off_shelf: items.filter((item) => item.status === 'off_shelf').length,
      violation: items.filter((item) => item.status === 'violation').length,
    }),
    [items],
  )

  const visibleItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    return items.filter((item) => {
      const statusMatched = activeTab === 'on_sale' ? item.status === 'on_sale' : item.status === activeTab
      const keywordMatched = normalizedKeyword
        ? `${item.title} ${item.category}`.toLowerCase().includes(normalizedKeyword)
        : true
      return statusMatched && keywordMatched
    })
  }, [activeTab, items, keyword])

  function setItemStatus(itemId: number, status: MineStatus) {
    statusMutation.mutate({ itemId, status })
  }

  return (
    <UnifiedMarketplacePage activeUserLabel="我的发布">
      <div className="mine-page">
      <header className="mine-topbar">
        <a className="mine-brand" href="/">
          <img src={campusGateImage} alt="" aria-hidden="true" />
          <span>
            <strong>厦大闲置</strong>
            <small>厦门大学校园二手交易平台</small>
          </span>
        </a>

        <form
          className="mine-search"
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          <Search size={24} />
          <input aria-label="搜索商品" placeholder="搜索商品名称、类别、关键词..." />
          <button type="submit">搜索</button>
        </form>

        <div className="mine-userbar" aria-label="用户快捷入口">
          <NoticeButton label="通知" count={0}>
            <Bell size={25} />
          </NoticeButton>
          <NoticeButton label="私信" count={unreadMessageCount}>
            <Mail size={26} />
          </NoticeButton>
          <button type="button" className="mine-profile-button">
            <span className="mine-avatar">海</span>
            <strong>海风吹过嘉庚楼</strong>
            <em>学生</em>
            <ChevronDown size={17} />
          </button>
        </div>
      </header>

      <div className="mine-layout">
        <aside className="mine-sidebar">
          <nav className="mine-nav" aria-label="商品分类">
            {categoryNav.map((item) => (
              <a href={item.to} key={item.label}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <nav className="mine-nav mine-nav-user" aria-label="个人中心">
            {userNav.map((item) => (
              <a className={item.active ? 'active' : undefined} href={item.to} key={item.label}>
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.to === '/messages' && unreadMessageCount > 0 ? <b>{unreadMessageCount}</b> : null}
              </a>
            ))}
          </nav>

          <img className="mine-sidebar-sketch" src={campusSidebarImage} alt="" aria-hidden="true" />
        </aside>

        <main className="mine-main">
          <section className="mine-content">
            <header className="mine-heading">
              <h1>我的发布</h1>
              <p>管理已发布商品，可编辑、下架或重新上架</p>
            </header>

            <section className="mine-stats" aria-label="发布统计">
              <StatCard icon={Store} label="在售" value={counts.on_sale} tone="green" />
              <StatCard icon={Clock} label="审核中" value={counts.reviewing} tone="orange" />
              <StatCard icon={Package} label="已下架" value={counts.off_shelf} tone="gray" />
              <StatCard icon={ShieldAlert} label="违规下架" value={counts.violation} tone="red" />
              <a className="new-item-button" href="/publish">
                <Pencil size={22} />
                发布新闲置
              </a>
            </section>

            <section className="mine-toolbar">
              <div className="mine-tabs" role="tablist" aria-label="商品状态">
                {tabs.map((tab) => (
                  <button
                    className={activeTab === tab.value ? 'active' : undefined}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    key={tab.value}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <label className="mine-list-search">
                <Search size={18} />
                <input
                  value={keyword}
                  placeholder="搜索我的商品"
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </label>

              <button type="button" className="sort-button">
                最近更新
                <ChevronDown size={17} />
              </button>
            </section>

            <section className="mine-card-grid" aria-label="我的商品列表">
              {itemsQuery.isLoading ? <p>正在加载真实发布记录...</p> : null}
              {itemsQuery.isError ? <p role="alert">发布记录加载失败，请稍后重试。</p> : null}
              {!itemsQuery.isLoading && !itemsQuery.isError && visibleItems.length === 0 ? <p>当前状态下暂无商品。</p> : null}
              {visibleItems.map((item) => (
                <MineItemCard item={item} onStatusChange={setItemStatus} key={item.id} />
              ))}
            </section>
          </section>

          <aside className="mine-panels">
            <section className="mine-panel">
              <h2>管理提示</h2>
              <ul>
                <li>
                  <CheckCircle2 size={18} />
                  <span>审核中商品暂不可上架</span>
                </li>
                <li>
                  <CheckCircle2 size={18} />
                  <span>下架后可重新编辑并上架</span>
                </li>
                <li>
                  <CheckCircle2 size={18} />
                  <span>违规下架需查看原因后处理</span>
                </li>
              </ul>
              <ClipboardCheck className="panel-art" size={132} />
            </section>

            <section className="mine-panel mine-help-panel">
              <h2>操作提示</h2>
              <p>
                <Pencil size={19} />
                点击编辑将进入
              </p>
              <a href="/items/1/edit">编辑商品</a>
              <p>
                <Eye size={19} />
                下架后商品对买家不可见，但会保留发布记录
              </p>
            </section>
          </aside>
        </main>
      </div>
      </div>
    </UnifiedMarketplacePage>
  )
}

function MineItemCard({ item, onStatusChange }: { item: MineItem; onStatusChange: (itemId: number, status: MineStatus) => void }) {
  const canToggle = item.status === 'on_sale' || item.status === 'off_shelf' || item.status === 'rejected'

  return (
    <article className="mine-card">
      <img src={item.image} alt="" aria-hidden="true" />
      <div className="mine-card-body">
        <header>
          <h3>{item.title}</h3>
          <span className={`status-pill ${item.status}`}>{statusLabels[item.status]}</span>
        </header>
        <strong>{item.price}</strong>
        <p>分类：{item.category}</p>
        <p>更新：{item.updatedAt}</p>
        <div className="mine-card-actions">
          {item.status === 'violation' ? <button type="button">查看原因</button> : null}
          <a href={`/items/${item.id}/edit`}>编辑</a>
          {item.status === 'on_sale' ? (
            <button type="button" className="danger" onClick={() => onStatusChange(item.id, 'off_shelf')}>
              下架
            </button>
          ) : null}
          {item.status === 'off_shelf' || item.status === 'rejected' ? (
            <button type="button" className="success" onClick={() => onStatusChange(item.id, 'on_sale')}>
              上架
            </button>
          ) : null}
          {item.status === 'reviewing' ? (
            <button type="button" className="warning" onClick={() => onStatusChange(item.id, 'off_shelf')}>
              撤回
            </button>
          ) : null}
        </div>
      </div>
      <footer>
        <span>{item.status === 'on_sale' ? '上架中' : statusLabels[item.status]}</span>
        <button
          type="button"
          className={item.status === 'on_sale' ? 'toggle active' : 'toggle'}
          aria-pressed={item.status === 'on_sale'}
          disabled={!canToggle}
          onClick={() => onStatusChange(item.id, item.status === 'on_sale' ? 'off_shelf' : 'on_sale')}
        >
          <span />
        </button>
      </footer>
    </article>
  )
}

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof Store; label: string; value: number; tone: string }) {
  return (
    <div className={`stat-card ${tone}`}>
      <Icon size={39} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function NoticeButton({ children, label, count }: { children: React.ReactNode; label: string; count: number }) {
  return (
    <button type="button" className="mine-notice-button" aria-label={label}>
      {children}
      {count > 0 ? <span>{count}</span> : null}
    </button>
  )
}

function toMineItem(item: MyItemSummary): MineItem {
  return {
    id: item.id,
    title: item.title,
    price: `¥${(item.priceCent / 100).toFixed(2)}`,
    category: item.categoryName === '教材' ? '教材教辅' : item.categoryName === '数码' ? '数码电子' : item.categoryName,
    updatedAt: formatItemTime(item.createdAt),
    image: item.coverImageUrl ?? campusGateImage,
    status: toMineStatus(item.status),
  }
}

function toMineStatus(status: MyItemSummary['status']): MineStatus {
  if (status === 'ON_SALE') return 'on_sale'
  if (status === 'PENDING_REVIEW') return 'reviewing'
  if (status === 'REJECTED') return 'rejected'
  if (status === 'SOLD') return 'sold'
  if (status === 'VIOLATION_REMOVED') return 'violation'
  return 'off_shelf'
}

function formatItemTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '时间未知'
  return date.toLocaleString('zh-CN', { hour12: false })
}

function getInitialTab(): MineStatus {
  const tab = new URLSearchParams(window.location.search).get('tab')
  return tab === 'reviewing' || tab === 'off_shelf' || tab === 'on_sale' || tab === 'rejected' || tab === 'sold' || tab === 'violation' ? tab : 'on_sale'
}
