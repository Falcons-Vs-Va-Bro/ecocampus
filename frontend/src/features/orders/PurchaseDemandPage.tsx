import {
  AlarmClock,
  CalendarDays,
  ChevronDown,
  Handshake,
  MessageCircle,
  Search,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useMemo, useState } from 'react'
import basketballImage from '../../assets/favorites/items/basketball.jpg'
import calculatorImage from '../../assets/favorites/items/calculator.jpg'
import deskLampImage from '../../assets/favorites/items/desk-lamp.jpg'
import guitarImage from '../../assets/favorites/items/instruments-guitar.png'
import mathBooksImage from '../../assets/favorites/items/math-books.jpg'
import suitcaseImage from '../../assets/favorites/items/suitcase.jpg'
import messageHelperImage from '../../assets/messages/message-helper.webp'
import { MarketplaceShell } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import './OrdersPage.css'

type DemandStatus = 'matching' | 'talking' | 'matched' | 'expiring'

interface DemandItem {
  author: string
  budget: string
  category: string
  description: string
  id: number
  image: string
  publishedAt: string
  status: DemandStatus
  title: string
}

const purchaseNav = [
  { label: '我的订单', to: '/orders/purchase' },
  { label: '求购广场', to: '/orders/purchase/demand' },
  { label: '发布求购', to: '/orders/purchase/demand/new' },
  { label: '我的求购 / 匹配结果', to: '/orders/purchase/demand/mine' },
]

const categories = ['全部', '教材教辅', '数码电子', '宿舍用品', '运动户外', '生活日用', '美妆个护', '乐器文具', '票务转让', '其他']
const budgets = ['全部', '0-50', '50-100', '100-300', '300以上']
const statuses: Array<{ label: string; value: DemandStatus | '全部' }> = [
  { label: '全部', value: '全部' },
  { label: '待匹配', value: 'matching' },
  { label: '沟通中', value: 'talking' },
  { label: '已匹配', value: 'matched' },
  { label: '即将过期', value: 'expiring' },
]

const demandItems: DemandItem[] = [
  {
    id: 1,
    title: '求高等数学教材',
    budget: '¥20-40',
    category: '教材教辅',
    description: '需要可用的高等数学教材或笔记，有的同学联系我，谢谢！',
    author: '林同学',
    publishedAt: '10 分钟前',
    status: 'matching',
    image: mathBooksImage,
  },
  {
    id: 2,
    title: '求小台灯或护眼灯',
    budget: '¥30-60',
    category: '宿舍用品',
    description: '宿舍学习用，需要一盏亮度可调的台灯或护眼灯，最好九成新及以上。',
    author: '陈同学',
    publishedAt: '25 分钟前',
    status: 'talking',
    image: deskLampImage,
  },
  {
    id: 3,
    title: '求二手计算器',
    budget: '¥20-80',
    category: '数码电子',
    description: '考试用计算器，希望功能正常，屏幕清晰，有的同学联系。',
    author: '王同学',
    publishedAt: '1 小时前',
    status: 'matching',
    image: calculatorImage,
  },
  {
    id: 4,
    title: '求吉他变调夹',
    budget: '¥10-25',
    category: '乐器文具',
    description: '吉他变调夹一个，最好金属材质，夹得稳，有的联系我！',
    author: '周同学',
    publishedAt: '2 小时前',
    status: 'matching',
    image: guitarImage,
  },
  {
    id: 5,
    title: '求20寸行李箱',
    budget: '¥60-120',
    category: '生活日用',
    description: '周末短途旅行用，20寸左右行李箱，轮子灵活，外观无明显破损。',
    author: '黄同学',
    publishedAt: '今天 09:30',
    status: 'expiring',
    image: suitcaseImage,
  },
  {
    id: 6,
    title: '求篮球或羽毛球拍',
    budget: '¥30-100',
    category: '运动户外',
    description: '想买篮球或羽毛球拍一副，参加校园活动用，可正常使用即可。',
    author: '许同学',
    publishedAt: '昨天',
    status: 'matched',
    image: basketballImage,
  },
]

const statusCopy: Record<DemandStatus, { label: string; tone: 'blue' | 'orange' | 'green' | 'red' }> = {
  matching: { label: '待匹配', tone: 'orange' },
  talking: { label: '沟通中', tone: 'blue' },
  matched: { label: '已匹配', tone: 'green' },
  expiring: { label: '即将过期', tone: 'red' },
}

export function PurchaseDemandPage() {
  useDocumentTitle('厦大闲置 - 求购广场')
  const shouldReduceMotion = useReducedMotion() ?? false
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('全部')
  const [budget, setBudget] = useState('全部')
  const [status, setStatus] = useState<DemandStatus | '全部'>('全部')

  const visibleDemands = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return demandItems.filter((item) => {
      const matchesCategory = category === '全部' || item.category === category
      const matchesStatus = status === '全部' || item.status === status
      const matchesKeyword =
        !normalizedKeyword ||
        `${item.title} ${item.category} ${item.description} ${item.author}`.toLowerCase().includes(normalizedKeyword)
      const matchesBudget = budget === '全部' || item.budget.includes(budget.replace('以上', ''))
      return matchesCategory && matchesStatus && matchesKeyword && matchesBudget
    })
  }, [budget, category, keyword, status])

  return (
    <MarketplaceShell
      activeUserLabel="购买订单"
      keyword={keyword}
      mainClassName="orders-main demand-main"
      onKeywordChange={setKeyword}
      onSearch={() => undefined}
      searchLabel="搜索求购需求"
      searchPlaceholder="搜索商品名称、类别、关键词..."
    >
      <motion.section
        className="favorites-heading orders-heading"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.18 }}
      >
        <h1>求购广场</h1>
        <p>看看同学们正在寻找的闲置物品，合适就发起私信</p>
      </motion.section>

      <section className="orders-layout">
        <div className="orders-list-panel">
          <nav className="order-section-tabs" aria-label="购买订单导航">
            {purchaseNav.map((item) => (
              <a className={item.label === '求购广场' ? 'active' : undefined} href={item.to} key={item.label}>
                {item.label}
              </a>
            ))}
          </nav>

          <section className="order-stat-strip demand-stat-strip" aria-label="求购统计">
            <DemandStat icon={<MessageCircle size={42} />} label="活跃求购" value={128} />
            <DemandStat icon={<CalendarDays size={42} />} label="今日新增" tone="orange" value={26} />
            <DemandStat icon={<Handshake size={44} />} label="已匹配" tone="green" value={46} />
            <DemandStat icon={<AlarmClock size={42} />} label="即将过期" tone="red" value={18} />
          </section>

          <section className="demand-filters" aria-label="求购筛选">
            <FilterRow label="分类：" options={categories} value={category} onChange={setCategory} />
            <FilterRow label="预算：" options={budgets} value={budget} onChange={setBudget} />
            <FilterRow
              label="状态："
              options={statuses.map((item) => item.label)}
              value={statuses.find((item) => item.value === status)?.label ?? '全部'}
              onChange={(nextLabel) => setStatus(statuses.find((item) => item.label === nextLabel)?.value ?? '全部')}
            />
            <form
              className="order-inner-search demand-search"
              onSubmit={(event) => {
                event.preventDefault()
              }}
            >
              <Search size={22} />
              <input
                aria-label="搜索求购需求"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索求购需求"
              />
            </form>
            <button type="button" className="order-sort-button demand-sort">
              最新发布
              <ChevronDown size={17} />
            </button>
          </section>

          <div className="demand-card-grid">
            {visibleDemands.map((item, index) => (
              <DemandCard demand={item} index={index} reduceMotion={shouldReduceMotion} key={item.id} />
            ))}
          </div>
        </div>

        <aside className="orders-side-panels">
          <section className="order-tips-panel demand-tips-panel">
            <h2>求购提示</h2>
            <span className="painted-asset demand-panel-art" aria-hidden="true">
              <img src={messageHelperImage} alt="" />
            </span>
            <p>
              发布求购时写清预算、分类和取货范围；点击“我有此物”可向发布者发起私信；沟通确认后可转为订单继续交易。
            </p>
          </section>

          <section className="order-flow-panel demand-quick-panel">
            <h2>快捷筛选</h2>
            <div className="demand-quick-buttons">
              <button type="button" onClick={() => setStatus('matching')}>
                待匹配
              </button>
              <button type="button" onClick={() => setStatus('全部')}>
                今日新增
              </button>
              <button type="button" onClick={() => setStatus('expiring')}>
                即将过期
              </button>
              <button type="button" onClick={() => setStatus('talking')}>
                可私信
              </button>
              <button type="button" onClick={() => setStatus('matched')}>
                已匹配
              </button>
            </div>
          </section>
        </aside>
      </section>
    </MarketplaceShell>
  )
}

function FilterRow({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: string[]
  value: string
}) {
  return (
    <div className="demand-filter-row">
      <strong>{label}</strong>
      <div>
        {options.map((item) => (
          <button type="button" className={value === item ? 'active' : undefined} onClick={() => onChange(item)} key={item}>
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}

function DemandStat({
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
    <div className={classNames('order-stat', tone && `demand-stat--${tone}`)}>
      {icon}
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  )
}

function DemandCard({ demand, index, reduceMotion }: { demand: DemandItem; index: number; reduceMotion: boolean }) {
  const status = statusCopy[demand.status]
  const secondaryAction = demand.status === 'talking' || demand.status === 'matched' ? '继续沟通' : '我有此物'

  return (
    <motion.article
      className="demand-card"
      initial={reduceMotion ? false : { opacity: 0, y: 16, rotate: index % 2 === 0 ? -0.2 : 0.2 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.3, delay: 0.12 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -3, rotate: index % 2 === 0 ? -0.15 : 0.15 }}
    >
      <img src={demand.image} alt={demand.title} />
      <div className="demand-card-body">
        <header>
          <div>
            <h2>{demand.title}</h2>
            <strong>{demand.budget}</strong>
          </div>
          <span className={`demand-status demand-status--${status.tone}`}>{status.label}</span>
        </header>
        <p>期望分类：{demand.category}</p>
        <p>{demand.description}</p>
        <p>发布者：{demand.author}</p>
        <small>{demand.publishedAt}</small>
        <footer>
          <a href={`/demands/${demand.id}`}>查看详情</a>
          <a href="/messages">{secondaryAction}</a>
        </footer>
      </div>
    </motion.article>
  )
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
