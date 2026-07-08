import {
  Bell,
  BookOpen,
  Box,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Dumbbell,
  Grid3X3,
  Home,
  Lightbulb,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Pencil,
  Plus,
  Save,
  Search,
  ShoppingBasket,
  Sparkles,
  Star,
  Store,
  User,
  X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import campusGateImage from '../../assets/favorites/campus-gate.png'
import campusSidebarImage from '../../assets/favorites/campus-sidebar.png'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import './EditItemPage.css'
import { mineItems, statusLabels } from './myItems.mock'

const categoryNav = [
  { label: '首页', icon: Home, to: '/' },
  { label: '全部分类', icon: Grid3X3, to: '/items' },
  { label: '教材教辅', icon: BookOpen, to: '/items' },
  { label: '数码电子', icon: Camera, to: '/items' },
  { label: '宿舍用品', icon: Package, to: '/items' },
  { label: '运动户外', icon: Dumbbell, to: '/items' },
  { label: '生活日用', icon: ShoppingBasket, to: '/items' },
  { label: '美妆个护', icon: Sparkles, to: '/items' },
  { label: '乐器文具', icon: Pencil, to: '/items' },
  { label: '票务转让', icon: ClipboardList, to: '/items' },
  { label: '其他', icon: Box, to: '/items' },
]

const userNav = [
  { label: '我的收藏', icon: Star, to: '/favorites' },
  { label: '我的发布', icon: Store, to: '/items/mine', active: true },
  { label: '购买订单', icon: ClipboardList, to: '/orders' },
  { label: '出售订单', icon: BriefcaseBusiness, to: '/orders' },
  { label: '消息中心', icon: MessageCircle, to: '/messages', badge: 3 },
  { label: '个人中心', icon: User, to: '/profile' },
]

const categoryOptions = ['教材教辅', '数码电子', '宿舍用品', '运动户外', '生活日用', '美妆个护', '乐器文具', '票务转让', '其他']
const conditions = ['全新', '九成新', '八成新', '可小刀'] as const
const deliveryModes = ['自提', '送货到校'] as const
const pickupPlaces = ['芙蓉园门口', '翔安一期食堂', '思明校门口', '海韵教学楼']
const publishedItemsStorageKey = 'ecocampus:published-items'

export function EditItemPage() {
  const { id } = useParams()
  const item = [...readPublishedItems(), ...mineItems].find((current) => String(current.id) === id) ?? mineItems[0]
  useDocumentTitle(`厦大闲置 - 编辑${item.title}`)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState(() => [
    { id: `${item.id}-cover`, src: item.image },
    { id: `${item.id}-side`, src: item.image },
    { id: `${item.id}-detail`, src: item.image },
  ])
  const [isCategoryOpen, setIsCategoryOpen] = useState(true)
  const [category, setCategory] = useState(item.detailCategory)
  const [condition, setCondition] = useState<(typeof conditions)[number]>(item.condition)
  const [deliveryMode, setDeliveryMode] = useState<(typeof deliveryModes)[number]>(item.deliveryMode)
  const [pickupPlace, setPickupPlace] = useState(item.pickupPlace)
  const [description, setDescription] = useState(item.description)
  const priceValue = item.price.replace('¥', '')
  const originalPriceValue = item.originalPrice.replace('¥', '')

  return (
    <div className="edit-page">
      <header className="edit-topbar">
        <a className="edit-brand" href="/">
          <img src={campusGateImage} alt="" aria-hidden="true" />
          <span>
            <strong>厦大闲置</strong>
            <small>厦门大学校园二手交易平台</small>
          </span>
        </a>

        <form className="edit-search">
          <Search size={24} />
          <input aria-label="搜索商品" placeholder="搜索商品名称、类别、关键词..." />
          <button type="submit">搜索</button>
        </form>

        <div className="edit-userbar" aria-label="用户快捷入口">
          <NoticeButton label="通知" count={3}>
            <Bell size={25} />
          </NoticeButton>
          <NoticeButton label="私信" count={2}>
            <Mail size={26} />
          </NoticeButton>
          <button type="button" className="edit-profile-button">
            <span className="edit-avatar">海</span>
            <strong>海风吹过嘉庚楼</strong>
            <em>学生</em>
            <ChevronDown size={17} />
          </button>
        </div>
      </header>

      <div className="edit-layout">
        <aside className="edit-sidebar">
          <nav className="edit-nav" aria-label="商品分类">
            {categoryNav.map((item) => (
              <a href={item.to} key={item.label}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <nav className="edit-nav edit-nav-user" aria-label="个人中心">
            {userNav.map((item) => (
              <a className={item.active ? 'active' : undefined} href={item.to} key={item.label}>
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.badge ? <b>{item.badge}</b> : null}
              </a>
            ))}
          </nav>
          <img className="edit-sidebar-sketch" src={campusSidebarImage} alt="" aria-hidden="true" />
        </aside>

        <main className="edit-main">
          <section className="edit-form-card">
            <header className="edit-heading">
              <div>
                <h1>编辑商品</h1>
                <p>修改已发布商品信息，提交后返回我的发布</p>
                <nav aria-label="当前位置">
                  <a href="/items/mine">我的发布</a>
                  <span>/ {item.title} / 编辑</span>
                </nav>
              </div>
              <div className="current-status">
                <span>当前状态：</span>
                <strong>{statusLabels[item.status]}</strong>
                <small>修改关键信息后可能需要重新审核</small>
              </div>
            </header>

            <EditRow label="商品图片">
              <div className="edit-upload-row">
                {images.map((image) => (
                  <div className="edit-preview" key={image.id}>
                    <img src={image.src} alt="" aria-hidden="true" />
                    <button type="button" aria-label="删除图片" onClick={() => setImages((current) => current.filter((currentImage) => currentImage.id !== image.id))}>
                      <X size={15} />
                    </button>
                  </div>
                ))}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="edit-file-input"
                  onChange={(event) => {
                    const fileCount = event.currentTarget.files?.length ?? 0
                    setImages((current) => [
                      ...current,
                      ...Array.from({ length: Math.max(0, Math.min(fileCount, 9 - current.length)) }, (_, index) => ({
                        id: `upload-${Date.now()}-${index}`,
                        src: item.image,
                      })),
                    ])
                    event.currentTarget.value = ''
                  }}
                />
                <button type="button" className="edit-add-image" onClick={() => fileInputRef.current?.click()} aria-label="继续添加图片">
                  <Camera size={35} />
                  <Plus size={24} />
                </button>
                <div className="edit-upload-actions">
                  <button type="button">更换封面</button>
                  <button type="button" onClick={() => fileInputRef.current?.click()}>
                    继续添加
                  </button>
                  <p>最多 9 张，拖动可调整顺序</p>
                </div>
              </div>
            </EditRow>

            <EditRow label="商品标题">
              <input className="edit-input full" defaultValue={item.title} />
            </EditRow>

            <EditRow label="商品分类">
              <div className="edit-category-wrap">
                <button type="button" className="edit-select-button" aria-expanded={isCategoryOpen} onClick={() => setIsCategoryOpen((current) => !current)}>
                  {category}
                  <ChevronDown size={18} />
                </button>
                {isCategoryOpen ? (
                  <div className="edit-category-menu">
                    {categoryOptions.map((item) => (
                      <button
                        type="button"
                        className={category.startsWith(item) ? 'active' : undefined}
                        onClick={() => {
                          setCategory(item === '宿舍用品' ? '宿舍用品 / 台灯照明' : item)
                          setIsCategoryOpen(false)
                        }}
                        key={item}
                      >
                        <BookOpen size={17} />
                        {item}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </EditRow>

            <div className="edit-price-row">
              <EditRow label="出售价格">
                <div className="edit-price-input">
                  <span>¥</span>
                  <input defaultValue={priceValue} />
                </div>
              </EditRow>
              <EditRow label="原价（选填）">
                <div className="edit-price-input">
                  <span>¥</span>
                  <input defaultValue={originalPriceValue} />
                </div>
              </EditRow>
            </div>

            <EditRow label="成色">
              <div className="edit-chips">
                {conditions.map((item) => (
                  <button type="button" className={condition === item ? 'active' : undefined} onClick={() => setCondition(item)} key={item}>
                    {item}
                  </button>
                ))}
              </div>
            </EditRow>

            <EditRow label="交易方式">
              <div className="edit-chips">
                {deliveryModes.map((item) => (
                  <button type="button" className={deliveryMode === item ? 'active' : undefined} onClick={() => setDeliveryMode(item)} key={item}>
                    {item}
                  </button>
                ))}
              </div>
            </EditRow>

            <EditRow label="自提地址">
              <div className="edit-pickup">
                <button type="button" className="edit-select-button">
                  <MapPin size={17} />
                  {pickupPlace}
                  <ChevronDown size={18} />
                </button>
                <div className="edit-chips">
                  {pickupPlaces.map((item) => (
                    <button type="button" className={pickupPlace === item ? 'active' : undefined} onClick={() => setPickupPlace(item)} key={item}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </EditRow>

            <EditRow label="商品描述">
              <div className="edit-description">
                <textarea maxLength={200} value={description} onChange={(event) => setDescription(event.target.value)} />
                <span>{description.length} / 200</span>
              </div>
            </EditRow>

            <footer className="edit-actions">
              <button type="button" className="primary">
                保存修改
              </button>
              <a href="/items/mine">取消返回</a>
              <button type="button" className="danger">
                下架商品
              </button>
            </footer>
          </section>

          <aside className="edit-panels">
            <section className="edit-panel">
              <h2>编辑规则</h2>
              <ul>
                <li>
                  <CheckCircle2 size={18} />
                  <span>价格、标题、图片变更会重新进入审核</span>
                </li>
                <li>
                  <CheckCircle2 size={18} />
                  <span>审核期间商品暂不展示</span>
                </li>
                <li>
                  <CheckCircle2 size={18} />
                  <span>审核通过后自动恢复上架</span>
                </li>
              </ul>
              <ClipboardCheck className="edit-panel-art" size={130} />
            </section>

            <section className="edit-panel edit-flow-panel">
              <h2>提交后去向</h2>
              <div className="edit-flow">
                <span>
                  <Save size={42} />
                  保存修改
                </span>
                <b>→</b>
                <span>
                  <Store size={42} />
                  返回我的发布
                </span>
              </div>
              <p>也可从我的发布继续编辑或下架</p>
            </section>

            <section className="edit-tip">
              <Lightbulb size={30} />
              <span>若只修改自提地址，可快速保存</span>
            </section>
          </aside>
        </main>
      </div>
    </div>
  )
}

function EditRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="edit-row">
      <span>{label}</span>
      {children}
    </label>
  )
}

function NoticeButton({ children, label, count }: { children: React.ReactNode; label: string; count: number }) {
  return (
    <button type="button" className="edit-notice-button" aria-label={label}>
      {children}
      <span>{count}</span>
    </button>
  )
}

function readPublishedItems() {
  try {
    const storedValue = window.localStorage.getItem(publishedItemsStorageKey)
    return storedValue ? (JSON.parse(storedValue) as typeof mineItems) : []
  } catch {
    return []
  }
}
