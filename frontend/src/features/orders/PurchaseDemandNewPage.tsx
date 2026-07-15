import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { listCategories } from '../../api/category.api'
import { createDemand } from '../../api/demand.api'
import { queryKeys } from '../../api/queryKeys'
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

const conditions = ['全部', '全新', '九成新', '八成新', '可小刀']
const deliveryModes = [
  { label: '可自提', icon: MapPin },
  { label: '校内配送', icon: Truck },
  { label: '都可以', icon: PackageSearch },
]
const pickupSpots = ['芙蓉园门口', '翔安一期食堂', '思明校门口', '图书馆附近', '宿舍楼下']

export function PurchaseDemandNewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit') ?? ''
  const isEditMode = Boolean(editId)
  useDocumentTitle(isEditMode ? '厦大闲置 - 编辑求购' : '厦大闲置 - 发布求购')
  const shouldReduceMotion = useReducedMotion() ?? false
  const [keyword, setKeyword] = useState('')
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [condition, setCondition] = useState('全部')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [deliveryMode, setDeliveryMode] = useState('可自提')
  const [pickupSpot, setPickupSpot] = useState('')
  const [description, setDescription] = useState('')
  const [privateContact, setPrivateContact] = useState(true)
  const [draftSaved, setDraftSaved] = useState(false)
  const [notice, setNotice] = useState('')

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list,
    queryFn: listCategories,
  })
  const categories = categoriesQuery.data?.data ?? []
  const selectedCategoryId = categoryId ?? categories[0]?.id ?? null
  const selectedCategory = categories.find((item) => item.id === selectedCategoryId)
  const descriptionCount = description.length
  const isPublishReady = useMemo(
    () => title.trim().length > 0 && description.trim().length > 0 && selectedCategoryId !== null,
    [description, selectedCategoryId, title],
  )

  const createMutation = useMutation({
    mutationFn: () =>
      createDemand({
        title: title.trim(),
        description: buildDescription({ condition, deliveryMode, description, pickupSpot }),
        categoryId: selectedCategoryId ?? 0,
        budgetMinCent: yuanToCent(minBudget),
        budgetMaxCent: yuanToCent(maxBudget),
        keywords: buildKeywords(title, selectedCategory?.name, condition, description),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demands'] })
      navigate('/orders/purchase/demand/mine?created=1')
    },
    onError: (error) => {
      setNotice(error instanceof Error ? error.message : '发布失败，请稍后再试')
    },
  })

  function saveDraft() {
    setDraftSaved(true)
    setNotice('草稿只保存在当前页面状态，后端暂未提供求购草稿接口')
  }

  function publishDemand() {
    if (isEditMode) {
      setNotice('后端暂未提供求购编辑接口，不能保存修改')
      return
    }

    if (!isPublishReady || createMutation.isPending) {
      setNotice('请填写标题、分类和详细描述')
      return
    }

    setDraftSaved(false)
    setNotice('')
    createMutation.mutate()
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
        <h1>{isEditMode ? '编辑求购' : '发布求购'}</h1>
        <p>{isEditMode ? '后端暂未开放求购编辑，当前只支持发布新求购和关闭求购' : '填写想要的物品，系统会帮你匹配可能商品'}</p>
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
              <CategorySegments
                options={categories.map((item) => ({ label: item.name, value: item.id }))}
                value={selectedCategoryId}
                onChange={setCategoryId}
              />
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
              <button type="button" className="primary" disabled={createMutation.isPending || isEditMode} onClick={publishDemand}>
                {isEditMode ? '暂不支持编辑' : createMutation.isPending ? '发布中' : '发布求购'}
              </button>
              <button type="button" onClick={saveDraft}>
                保存草稿
              </button>
            </div>

            {draftSaved ? <p className="demand-form-toast">草稿已保存</p> : null}
            {notice ? <p className="demand-form-toast" role="status">{notice}</p> : null}

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
              <li><CheckCircle2 size={19} />标题写清型号</li>
              <li><CheckCircle2 size={19} />成色要求越明确越好</li>
              <li><CheckCircle2 size={19} />预算范围越清楚越容易匹配</li>
              <li><CheckCircle2 size={19} />写明自提地点方便同学联系</li>
              <li><CheckCircle2 size={19} />联系方式默认隐藏</li>
              <li><CheckCircle2 size={19} />通过私信沟通更安全</li>
            </ul>
          </section>

          <section className="order-flow-panel demand-preview-panel">
            <h2>发布后匹配</h2>
            <div className="match-preview-list">
              <article>
                <img src={messageHelperImage} alt="" />
                <div>
                  <h3>真实商品匹配</h3>
                  <strong>按分类、预算、关键词计算</strong>
                  <p>发布成功后可在“我的求购 / 匹配结果”查看后端返回的匹配商品</p>
                </div>
              </article>
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

function CategorySegments({
  onChange,
  options,
  value,
}: {
  onChange: (value: number) => void
  options: Array<{ label: string; value: number }>
  value: number | null
}) {
  if (options.length === 0) {
    return <p className="demand-form-toast">暂无可用分类，请确认后端类目接口</p>
  }

  return (
    <div className="demand-segments">
      {options.map((item) => (
        <button type="button" className={value === item.value ? 'active' : undefined} onClick={() => onChange(item.value)} key={item.value}>
          {item.label}
        </button>
      ))}
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

function yuanToCent(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : undefined
}

function buildDescription({
  condition,
  deliveryMode,
  description,
  pickupSpot,
}: {
  condition: string
  deliveryMode: string
  description: string
  pickupSpot: string
}) {
  const details = [
    description.trim(),
    condition === '全部' ? '' : `期望成色：${condition}`,
    `取货方式：${deliveryMode}`,
    pickupSpot ? `自提地点：${pickupSpot}` : '',
  ].filter(Boolean)

  return details.join('\n')
}

function buildKeywords(title: string, category?: string, condition?: string, description?: string) {
  const tokens = `${title} ${category ?? ''} ${condition ?? ''} ${description ?? ''}`
    .replace(/[，。！？、,.!?]/g, ' ')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2)

  return Array.from(new Set(tokens)).slice(0, 8)
}
