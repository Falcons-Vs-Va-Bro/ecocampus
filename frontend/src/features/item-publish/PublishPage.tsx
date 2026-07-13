import {
  Bell,
  BookOpen,
  Box,
  Camera,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Dumbbell,
  Gift,
  Grid3X3,
  Heart,
  Home,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Paperclip,
  Plus,
  Search,
  Send,
  ShoppingBasket,
  Sparkles,
  Star,
  Store,
  User,
  X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import campusGateImage from '../../assets/favorites/campus-gate.png'
import campusSidebarImage from '../../assets/favorites/campus-sidebar.png'
import deskLampImage from '../../assets/favorites/items/desk-lamp.jpg'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useUnreadMessageCount } from '../../hooks/useUnreadMessageCount'
import './PublishPage.css'
import type { MineItem } from './myItems.mock'

const categoryNav = [
  { label: '首页', icon: Home, to: '/' },
  { label: '全部分类', icon: Grid3X3, to: '/items' },
  { label: '教材教辅', icon: BookOpen, to: '/items/textbook' },
  { label: '数码电子', icon: Camera, to: '/items/digital' },
  { label: '宿舍用品', icon: Package, to: '/items/dorm' },
  { label: '运动户外', icon: Dumbbell, to: '/items/outdoors' },
  { label: '生活日用', icon: ShoppingBasket, to: '/items/daily-goods' },
  { label: '美妆个护', icon: Sparkles, to: '/items/make-up' },
  { label: '乐器文具', icon: Paperclip, to: '/items/instruments' },
  { label: '票务转让', icon: ClipboardList, to: '/items/tickets' },
  { label: '其他', icon: Box, to: '/items/others' },
]

const userNav = [
  { label: '我的收藏', icon: Star, to: '/favorites' },
  { label: '我的发布', icon: Store, to: '/items/mine' },
  { label: '购买订单', icon: ClipboardList, to: '/orders' },
  { label: '出售订单', icon: Store, to: '/orders/sales' },
  { label: '消息中心', icon: MessageCircle, to: '/messages' },
  { label: '个人中心', icon: User, to: '/profile' },
]

const categoryOptions = [
  { label: '教材教辅', icon: BookOpen },
  { label: '数码电子', icon: Camera },
  { label: '宿舍用品', icon: Package },
  { label: '运动户外', icon: Dumbbell },
  { label: '生活日用', icon: ShoppingBasket },
  { label: '美妆个护', icon: Sparkles },
  { label: '乐器文具', icon: Paperclip },
  { label: '票务转让', icon: ClipboardList },
  { label: '其他', icon: Heart },
]

const pickupPlaces = ['芙蓉园门口', '翔安一期食堂', '思明校门口', '海韵教学楼']
const deliveryModes = ['自提', '送货到校'] as const
const initialImages = [
  { id: 'sample-1', crop: false },
  { id: 'sample-2', crop: false },
  { id: 'sample-3', crop: true },
]
const publishedItemsStorageKey = 'ecocampus:published-items'
const publishDraftStorageKey = 'ecocampus:publish-draft'

interface PublishDraft {
  title: string
  price: string
  originalPrice: string
  selectedCategory: string
  deliveryMode: (typeof deliveryModes)[number]
  pickupPlace: string
  customPickupPlace: string
  description: string
  uploadedImageCount: number
}

export function PublishPage() {
  const unreadMessageCount = useUnreadMessageCount()
  useDocumentTitle('厦大闲置 - 发布闲置商品')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const draft = readPublishDraft()
  const [title, setTitle] = useState(draft?.title ?? '')
  const [price, setPrice] = useState(draft?.price ?? '')
  const [originalPrice, setOriginalPrice] = useState(draft?.originalPrice ?? '')
  const [selectedCategory, setSelectedCategory] = useState(draft?.selectedCategory ?? '')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [deliveryMode, setDeliveryMode] = useState<(typeof deliveryModes)[number]>(draft?.deliveryMode ?? '自提')
  const [pickupPlace, setPickupPlace] = useState(draft?.pickupPlace ?? '')
  const [customPickupPlace, setCustomPickupPlace] = useState(draft?.customPickupPlace ?? '')
  const [description, setDescription] = useState(draft?.description ?? '')
  const [uploadedImages, setUploadedImages] = useState(() =>
    draft ? createDraftImages(draft.uploadedImageCount) : initialImages,
  )

  function submitPublish() {
    const normalizedTitle = title.trim() || '新发布的闲置商品'
    const normalizedPrice = formatCurrency(price || '0.00')
    const normalizedOriginalPrice = originalPrice.trim() ? formatCurrency(originalPrice) : '¥0.00'
    const categoryName = selectedCategory || '其他'
    const now = new Date()
    const newItem: MineItem = {
      id: now.getTime(),
      title: normalizedTitle,
      price: normalizedPrice,
      originalPrice: normalizedOriginalPrice,
      category: categoryName,
      detailCategory: categoryName,
      condition: '九成新',
      deliveryMode,
      pickupPlace: pickupPlace || '待补充自提地址',
      description: description.trim() || '卖家暂未填写详细描述。',
      updatedAt: formatDateTime(now),
      image: deskLampImage,
      status: 'reviewing',
    }
    const storedItems = readPublishedItems()
    window.localStorage.setItem(publishedItemsStorageKey, JSON.stringify([newItem, ...storedItems]))
    window.localStorage.removeItem(publishDraftStorageKey)
    window.location.href = '/items/mine?tab=reviewing'
  }

  function saveDraft() {
    const draftValue: PublishDraft = {
      title,
      price,
      originalPrice,
      selectedCategory,
      deliveryMode,
      pickupPlace,
      customPickupPlace,
      description,
      uploadedImageCount: uploadedImages.length,
    }
    window.localStorage.setItem(publishDraftStorageKey, JSON.stringify(draftValue))
    window.location.href = '/items/mine'
  }

  return (
    <div className="publish-page">
      <header className="publish-topbar">
        <a className="publish-brand" href="/">
          <img src={campusGateImage} alt="" aria-hidden="true" />
          <span>
            <strong>厦大闲置</strong>
            <small>厦门大学校园二手交易平台</small>
          </span>
        </a>

        <form className="publish-search">
          <Search size={24} />
          <input aria-label="搜索商品" placeholder="搜索商品名称、类别、关键词..." />
          <button type="submit">搜索</button>
        </form>

        <div className="publish-userbar" aria-label="用户快捷入口">
          <button type="button" className="publish-notice-button" aria-label="通知">
            <Bell size={25} />
          </button>
          <button type="button" className="publish-notice-button" aria-label="私信">
            <Mail size={26} />
            {unreadMessageCount > 0 ? <span>{unreadMessageCount}</span> : null}
          </button>
          <button type="button" className="publish-profile-button">
            <span className="publish-avatar">海</span>
            <strong>海风吹过嘉庚楼</strong>
            <em>学生</em>
            <ChevronDown size={17} />
          </button>
        </div>
      </header>

      <div className="publish-layout">
        <aside className="publish-sidebar">
          <nav className="publish-nav" aria-label="商品分类">
            {categoryNav.map((item) => (
              <a href={item.to} key={item.label}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <nav className="publish-nav publish-nav-user" aria-label="个人中心">
            {userNav.map((item) => (
              <a className={'active' in item && item.active ? 'active' : undefined} href={item.to} key={item.label}>
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.to === '/messages' && unreadMessageCount > 0 ? <b>{unreadMessageCount}</b> : null}
              </a>
            ))}
          </nav>

          <img className="publish-sidebar-sketch" src={campusSidebarImage} alt="" aria-hidden="true" />
        </aside>

        <main className="publish-main">
          <section className="publish-form-card">
            <header className="publish-heading">
              <h1>发布闲置商品</h1>
              <p>填写商品信息，提交后进入待审核状态</p>
            </header>

            <div className="publish-field publish-field-upload">
              <label>上传商品图片</label>
              <div className="upload-row">
                {uploadedImages.map((image) => (
                  <PreviewImage
                    crop={image.crop}
                    key={image.id}
                    onRemove={() => setUploadedImages((current) => current.filter((item) => item.id !== image.id))}
                  />
                ))}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="visually-hidden-file"
                  onChange={(event) => {
                    const fileCount = event.currentTarget.files?.length ?? 0
                    setUploadedImages((current) => [
                      ...current,
                      ...Array.from({ length: Math.max(0, Math.min(fileCount, 9 - current.length)) }, (_, index) => ({
                        id: `uploaded-${Date.now()}-${index}`,
                        crop: false,
                      })),
                    ])
                    event.currentTarget.value = ''
                  }}
                />
                <button
                  type="button"
                  className="add-image-button"
                  aria-label="继续添加图片"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus size={34} />
                </button>
                <p className="upload-hint">最多 9 张，首图将作为封面</p>
              </div>
            </div>

            <FormRow label="商品标题">
              <input
                className="publish-input full"
                placeholder="例如：护眼台灯 可调光"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </FormRow>

            <FormRow label="商品分类">
              <div className="category-select">
                <button
                  type="button"
                  aria-expanded={isCategoryOpen}
                  aria-haspopup="listbox"
                  onClick={() => setIsCategoryOpen((current) => !current)}
                >
                  <span className={selectedCategory ? 'selected' : undefined}>{selectedCategory || '请选择分类'}</span>
                  <ChevronDown size={18} />
                </button>
                {isCategoryOpen ? (
                  <div className="category-menu" role="listbox" aria-label="商品分类">
                    {categoryOptions.map((item) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedCategory === item.label}
                        className={selectedCategory === item.label ? 'active' : undefined}
                        onClick={() => {
                          setSelectedCategory(item.label)
                          setIsCategoryOpen(false)
                        }}
                        key={item.label}
                      >
                        <item.icon size={17} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </FormRow>

            <div className="publish-form-grid">
              <FormRow label="出售价格">
                <div className="price-input">
                  <span>¥</span>
                  <input placeholder="0.00" value={price} onChange={(event) => setPrice(event.target.value)} />
                </div>
              </FormRow>

              <FormRow label="原价（选填）">
                <div className="price-input optional">
                  <span>¥</span>
                  <input placeholder="可不填" value={originalPrice} onChange={(event) => setOriginalPrice(event.target.value)} />
                </div>
              </FormRow>
            </div>

            <FormRow label="交易方式">
              <div className="segmented-control">
                {deliveryModes.map((item) => (
                  <button
                    type="button"
                    className={deliveryMode === item ? 'active' : undefined}
                    aria-pressed={deliveryMode === item}
                    onClick={() => setDeliveryMode(item)}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </FormRow>

            <FormRow label="自提地址">
              <div className="pickup-field">
                <button type="button">
                  <MapPin size={16} />
                  {pickupPlace || '请选择自提地点'}
                </button>
                <div className="place-chips">
                  {pickupPlaces.map((item) => (
                    <button
                      type="button"
                      className={pickupPlace === item ? 'active' : undefined}
                      aria-pressed={pickupPlace === item}
                      onClick={() => {
                        setPickupPlace(item)
                        setCustomPickupPlace('')
                      }}
                      key={item}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <input
                  className="custom-pickup-input"
                  value={customPickupPlace}
                  placeholder="输入自定义自提地址"
                  onChange={(event) => {
                    setCustomPickupPlace(event.target.value)
                    setPickupPlace(event.target.value)
                  }}
                />
              </div>
            </FormRow>

            <FormRow label="商品描述">
              <div className="description-box">
                <textarea
                  placeholder="描述成色、使用时间、配件、交易说明等"
                  maxLength={200}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
                <span>{description.length} / 200</span>
              </div>
            </FormRow>

            <footer className="publish-actions">
              <button type="button" className="primary" onClick={submitPublish}>
                提交发布
              </button>
              <button type="button" onClick={saveDraft}>
                保存草稿
              </button>
            </footer>
          </section>

          <aside className="publish-side-panels">
            <section className="publish-panel publish-notice-panel">
              <div>
                <h2>发布须知</h2>
                <ul>
                  <li>
                    <CheckCircle2 size={18} />
                    <span>真实图片，信息准确</span>
                  </li>
                  <li>
                    <CheckCircle2 size={18} />
                    <span>禁止发布违禁及违规商品</span>
                  </li>
                  <li>
                    <CheckCircle2 size={18} />
                    <span>交易前请确认地点与方式</span>
                  </li>
                </ul>
              </div>
              <ClipboardCheck className="notice-art" size={130} />
            </section>

            <section className="publish-panel publish-flow-panel">
              <h2>审核流程</h2>
              <div className="review-flow">
                <FlowStep icon={Send} label="提交商品" tone="blue" />
                <span>→</span>
                <FlowStep icon={User} label="管理员审核" tone="green" />
                <span>→</span>
                <FlowStep icon={Store} label="审核通过后上架" tone="orange" />
              </div>
              <p>
                发布后状态：<strong>待审核</strong>
              </p>
            </section>

            <section className="publish-panel publish-success-panel">
              <Gift size={116} />
              <p>发布成功后可跳转至</p>
              <p>商品详情或我的发布</p>
            </section>
          </aside>
        </main>
      </div>
    </div>
  )
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="publish-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function PreviewImage({ crop = false, onRemove }: { crop?: boolean; onRemove: () => void }) {
  return (
    <div className="preview-image">
      <img src={deskLampImage} alt="" aria-hidden="true" />
      {crop ? <span className="preview-crop" /> : null}
      <button type="button" aria-label="删除图片" onClick={onRemove}>
        <X size={16} />
      </button>
    </div>
  )
}

function FlowStep({ icon: Icon, label, tone }: { icon: typeof Send; label: string; tone: 'blue' | 'green' | 'orange' }) {
  return (
    <div className={`flow-step ${tone}`}>
      <span>
        <Icon size={37} />
      </span>
      <strong>{label}</strong>
    </div>
  )
}

function readPublishedItems(): MineItem[] {
  try {
    const storedValue = window.localStorage.getItem(publishedItemsStorageKey)
    return storedValue ? (JSON.parse(storedValue) as MineItem[]) : []
  } catch {
    return []
  }
}

function readPublishDraft(): PublishDraft | null {
  try {
    const storedValue = window.localStorage.getItem(publishDraftStorageKey)
    return storedValue ? (JSON.parse(storedValue) as PublishDraft) : null
  } catch {
    return null
  }
}

function createDraftImages(count: number) {
  const imageCount = Math.max(0, Math.min(9, count))
  return Array.from({ length: imageCount }, (_, index) => ({
    id: `draft-${index}`,
    crop: index === 2,
  }))
}

function formatCurrency(value: string) {
  const normalizedValue = value.replace(/[^\d.]/g, '')
  const amount = Number.parseFloat(normalizedValue)
  return `¥${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}`
}

function formatDateTime(date: Date) {
  const datePart = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part) => String(part).padStart(2, '0'))
    .join('-')
  const timePart = [date.getHours(), date.getMinutes()].map((part) => String(part).padStart(2, '0')).join(':')
  return `${datePart} ${timePart}`
}
