import {
  CheckCircle2,
  ClipboardList,
  Info,
  Lock,
  MapPin,
  MessageCircle,
  PackageSearch,
  Search,
  Truck,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import airpodsImage from '../../assets/favorites/items/airpods.webp'
import mathBooksImage from '../../assets/favorites/items/math-books.webp'
import mechanicalKeyboardImage from '../../assets/favorites/items/mechanical-keyboard.webp'
import messageHelperImage from '../../assets/messages/message-helper.webp'
import { MarketplaceShell } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import './OrdersPage.css'

const purchaseNav = [
  { label: '我的订单', to: '/orders/purchase' },
  { label: '求购广场', to: '/orders/purchase/demand' },
  { label: '发布求购', to: '/orders/purchase/demand/new' },
  { label: '我的求购 / 匹配结果', to: '/orders/purchase/demand/mine' },
]

const categories = ['教材教辅', '数码电子', '宿舍用品', '运动户外', '生活日用', '美妆个护', '乐器文具', '票务转让', '其他']
const conditions = ['全部', '全新', '九成新', '八成新', '可小刀']
const deliveryModes = [
  { label: '可自提', icon: MapPin },
  { label: '校内配送', icon: Truck },
  { label: '都可以', icon: PackageSearch },
]
const pickupSpots = ['芙蓉园门口', '翔安一期食堂', '思明校门口', '图书馆附近', '宿舍楼下']

const matchPreview = [
  { title: '教材', price: '¥25-35', meta: '九成新 · 可自提', image: mathBooksImage },
  { title: 'AirPods', price: '¥380-450', meta: '九成新 · 可自提', image: airpodsImage },
  { title: '机械键盘', price: '¥120-180', meta: '八成新 · 可自提', image: mechanicalKeyboardImage },
]

const editableDemands: Record<string, {
  category: string
  deliveryMode: string
  description: string
  maxBudget: string
  minBudget: string
  pickupSpot: string
  title: string
}> = {
  '1': {
    title: '想收高等数学第七版教材',
    category: '教材教辅',
    minBudget: '20',
    maxBudget: '40',
    deliveryMode: '可自提',
    pickupSpot: '芙蓉园门口',
    description: '希望上下册齐全，笔记少一点，期末复习前能自取。',
  },
  '2': {
    title: '求 AirPods 二代或三代',
    category: '数码电子',
    minBudget: '200',
    maxBudget: '450',
    deliveryMode: '可自提',
    pickupSpot: '图书馆附近',
    description: '希望电池健康还可以，外壳无明显磕碰，能当面试用。',
  },
}

export function PurchaseDemandNewPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit') ?? ''
  const editingDemand = editableDemands[editId]
  useDocumentTitle(editingDemand ? '厦大闲置 - 编辑求购' : '厦大闲置 - 发布求购')
  const shouldReduceMotion = useReducedMotion() ?? false
  const [keyword, setKeyword] = useState('')
  const [title, setTitle] = useState(editingDemand?.title ?? '')
  const [category, setCategory] = useState(editingDemand?.category ?? '教材教辅')
  const [condition, setCondition] = useState('全部')
  const [minBudget, setMinBudget] = useState(editingDemand?.minBudget ?? '')
  const [maxBudget, setMaxBudget] = useState(editingDemand?.maxBudget ?? '')
  const [deliveryMode, setDeliveryMode] = useState(editingDemand?.deliveryMode ?? '可自提')
  const [pickupSpot, setPickupSpot] = useState(editingDemand?.pickupSpot ?? '')
  const [description, setDescription] = useState(editingDemand?.description ?? '')
  const [privateContact, setPrivateContact] = useState(true)
  const [draftSaved, setDraftSaved] = useState(false)
  const [published, setPublished] = useState(false)

  const descriptionCount = description.length
  const isPublishReady = useMemo(() => title.trim().length > 0 && description.trim().length > 0, [description, title])

  function saveDraft() {
    setDraftSaved(true)
    setPublished(false)
  }

  function publishDemand() {
    if (!isPublishReady) {
      return
    }
    setPublished(true)
    setDraftSaved(false)
    if (editingDemand) {
      navigate(`/orders/purchase/demand/mine?updated=${editId}`)
    }
  }

  return (
    <MarketplaceShell
      activeUserLabel="购买订单"
      keyword={keyword}
      mainClassName="orders-main demand-new-main"
      onKeywordChange={setKeyword}
      onSearch={() => undefined}
      searchLabel="搜索商品名称、类别、关键词"
      searchPlaceholder="搜索商品名称、类别、关键词..."
    >
      <motion.section
        className="favorites-heading orders-heading"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.18 }}
      >
        <h1>{editingDemand ? '编辑求购' : '发布求购'}</h1>
        <p>{editingDemand ? '修改求购信息后保存，系统会重新计算匹配结果' : '填写想要的物品，系统会帮你匹配可能商品'}</p>
      </motion.section>

      <section className="orders-layout">
        <div className="orders-list-panel">
          <nav className="order-section-tabs" aria-label="购买订单导航">
            {purchaseNav.map((item) => (
              <a className={item.label === '发布求购' ? 'active' : undefined} href={item.to} key={item.label}>
                {item.label}
              </a>
            ))}
          </nav>

          <section className="demand-form-panel">
            <FormRow index={1} label="需求标题">
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：想收高等数学第七版教材" />
            </FormRow>

            <FormRow index={2} label="期望分类">
              <Segmented options={categories} value={category} onChange={setCategory} />
            </FormRow>

            <FormRow index={3} label="期望成色">
              <Segmented options={conditions} value={condition} onChange={setCondition} />
            </FormRow>

            <FormRow index={4} label="预算范围">
              <div className="budget-row">
                <input value={minBudget} onChange={(event) => setMinBudget(event.target.value)} placeholder="最低预算" inputMode="numeric" />
                <span>-</span>
                <input value={maxBudget} onChange={(event) => setMaxBudget(event.target.value)} placeholder="最高预算" inputMode="numeric" />
              </div>
            </FormRow>

            <FormRow index={5} label="期望取货方式">
              <div className="icon-segments">
                {deliveryModes.map((item) => (
                  <button
                    type="button"
                    className={deliveryMode === item.label ? 'active' : undefined}
                    onClick={() => setDeliveryMode(item.label)}
                    key={item.label}
                  >
                    <item.icon size={19} />
                    {item.label}
                  </button>
                ))}
              </div>
            </FormRow>

            <FormRow index={6} label="自提地点">
              <div className="pickup-row">
                <select value={pickupSpot} onChange={(event) => setPickupSpot(event.target.value)}>
                  <option value="">请选择自提地点</option>
                  {pickupSpots.map((item) => (
                    <option value={item} key={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <Segmented options={pickupSpots} value={pickupSpot} onChange={setPickupSpot} />
              </div>
            </FormRow>

            <FormRow index={7} label="详细描述">
              <div className="description-box">
                <textarea
                  maxLength={300}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="描述型号、成色、可接受价格、交易地点等"
                />
                <span>{descriptionCount} / 300</span>
              </div>
            </FormRow>

            <FormRow index={8} label="联系方式">
              <div className="contact-row">
                <button type="button" aria-pressed={privateContact} onClick={() => setPrivateContact((current) => !current)}>
                  <Lock size={18} />
                  <span className={privateContact ? 'checked' : undefined} />
                  默认隐藏，通过私信沟通
                  <Info size={17} />
                </button>
                <p>发布后其他同学只能通过平台私信联系你，保护隐私</p>
              </div>
            </FormRow>

            <div className="demand-form-actions">
              <button type="button" className="primary" onClick={publishDemand}>
                {editingDemand ? '保存修改' : '发布求购'}
              </button>
              <button type="button" onClick={saveDraft}>
                保存草稿
              </button>
            </div>

            {draftSaved ? <p className="demand-form-toast">草稿已保存</p> : null}
            {published ? <p className="demand-form-toast">求购已发布，系统正在为你匹配</p> : null}

            <div className="demand-form-flow" aria-label="发布流程">
              <FlowIcon icon={<ClipboardList size={52} />} title="发布求购" text="填写需求信息" />
              <b>→</b>
              <FlowIcon icon={<Search size={52} />} title="系统匹配" text="为你匹配合适商品" />
              <b>→</b>
              <FlowIcon icon={<MessageCircle size={52} />} title="我的求购查看推荐" text="在求购列表查看推荐" />
              <b>→</b>
              <FlowIcon icon={<PackageSearch size={52} />} title="私信沟通" text="与卖家私信沟通" />
            </div>
          </section>
        </div>

        <aside className="orders-side-panels">
          <section className="order-tips-panel demand-helper-panel">
            <h2>求购小助手</h2>
            <span className="painted-asset demand-panel-art" aria-hidden="true">
              <img src={messageHelperImage} alt="" />
            </span>
            <ul>
              <li>
                <CheckCircle2 size={19} />
                标题写清型号
              </li>
              <li>
                <CheckCircle2 size={19} />
                成色要求越明确越好
              </li>
              <li>
                <CheckCircle2 size={19} />
                预算范围越清楚越容易匹配
              </li>
              <li>
                <CheckCircle2 size={19} />
                写明自提地点方便同学联系
              </li>
              <li>
                <CheckCircle2 size={19} />
                联系方式默认隐藏
              </li>
              <li>
                <CheckCircle2 size={19} />
                通过私信沟通更安全
              </li>
            </ul>
          </section>

          <section className="order-flow-panel demand-preview-panel">
            <h2>可能匹配预览</h2>
            <div className="match-preview-list">
              {matchPreview.map((item) => (
                <article key={item.title}>
                  <img src={item.image} alt="" />
                  <div>
                    <h3>{item.title}</h3>
                    <strong>{item.price}</strong>
                    <p>{item.meta}</p>
                  </div>
                </article>
              ))}
            </div>
            <a href="/orders/purchase/demand">查看更多匹配商品</a>
          </section>
        </aside>
      </section>
    </MarketplaceShell>
  )
}

function FormRow({ children, index, label }: { children: React.ReactNode; index: number; label: string }) {
  return (
    <div className="demand-form-row">
      <label>
        {index}. {label}
      </label>
      <div>{children}</div>
    </div>
  )
}

function Segmented({ onChange, options, value }: { onChange: (value: string) => void; options: string[]; value: string }) {
  return (
    <div className="demand-segments">
      {options.map((item) => (
        <button type="button" className={value === item ? 'active' : undefined} onClick={() => onChange(item)} key={item}>
          {item}
        </button>
      ))}
    </div>
  )
}

function FlowIcon({ icon, text, title }: { icon: React.ReactNode; text: string; title: string }) {
  return (
    <span>
      {icon}
      <strong>{title}</strong>
      <small>{text}</small>
    </span>
  )
}
