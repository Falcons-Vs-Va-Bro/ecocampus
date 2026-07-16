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
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { listCategories, type Category } from '../../api/category.api'
import { uploadImage } from '../../api/file.api'
import { createItem } from '../../api/item.api'
import { queryKeys } from '../../api/queryKeys'
import campusGateImage from '../../assets/favorites/campus-gate.webp'
import campusSidebarImage from '../../assets/favorites/campus-sidebar.webp'
import { UnifiedMarketplacePage } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useUnreadMessageCount } from '../../hooks/useUnreadMessageCount'
import './PublishPage.css'
import '../../styles/marketplace-consistency.css'

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
  { label: '购买订单', icon: ClipboardList, to: '/orders/purchase' },
  { label: '出售订单', icon: Store, to: '/orders/sale' },
  { label: '消息中心', icon: MessageCircle, to: '/messages' },
  { label: '个人中心', icon: User, to: '/profile' },
]

const pickupPlaces = ['芙蓉园门口', '翔安一期食堂', '思明校门口', '海韵教学楼']
const deliveryModes = ['自提', '送货到校'] as const
const publishDraftStorageKey = 'ecocampus:publish-draft'

interface UploadedImage {
  id: string
  src: string
}

interface PublishDraft {
  title: string
  price: string
  originalPrice: string
  selectedCategory: string
  deliveryMode: (typeof deliveryModes)[number]
  pickupPlace: string
  customPickupPlace: string
  description: string
  uploadedImages?: string[]
  uploadedImageCount?: number
}

export function PublishPage() {
  const unreadMessageCount = useUnreadMessageCount()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(() => createDraftImages(draft))
  const [uploadError, setUploadError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const categoriesQuery = useQuery({ queryKey: queryKeys.categories.list, queryFn: listCategories })

  async function submitPublish() {
    if (isUploading || isSubmitting) {
      return
    }

    if (uploadedImages.length === 0) {
      setUploadError('请至少上传一张商品图片')
      return
    }

    const normalizedTitle = title.trim()
    const normalizedDescription = description.trim()
    const categoryId = resolveCategoryId(categoriesQuery.data?.data ?? [], selectedCategory)
    const priceCent = parsePriceCent(price)

    if (!normalizedTitle) {
      setUploadError('请填写商品标题')
      return
    }
    if (!categoryId) {
      setUploadError(categoriesQuery.isError ? '类目加载失败，请刷新页面后重试' : '请选择商品分类')
      return
    }
    if (priceCent == null) {
      setUploadError('请填写有效的出售价格')
      return
    }
    if (!normalizedDescription) {
      setUploadError('请填写商品描述')
      return
    }

    setIsSubmitting(true)
    setUploadError('')
    try {
      await createItem({
        title: normalizedTitle,
        description: pickupPlace ? `${normalizedDescription}\n交易地点：${pickupPlace}` : normalizedDescription,
        categoryId,
        priceCent,
        deliveryModes: [deliveryMode === '自提' ? 'SELF_PICKUP' : 'DELIVER_TO_SCHOOL'],
        imageUrls: uploadedImages.map((image) => image.src),
      })
      window.localStorage.removeItem(publishDraftStorageKey)
      await queryClient.invalidateQueries({ queryKey: ['items', 'mine'] })
      navigate('/items/mine?tab=reviewing', { replace: true })
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '提交失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
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
      uploadedImages: uploadedImages.map((image) => image.src),
    }
    try {
      window.localStorage.setItem(publishDraftStorageKey, JSON.stringify(draftValue))
    } catch {
      setUploadError('图片占用空间过大，请减少图片数量后再保存草稿')
      return
    }
    window.location.href = '/items/mine'
  }

  async function addImages(files: File[]) {
    const selectedFiles = files.slice(0, 9 - uploadedImages.length)
    if (selectedFiles.length === 0) {
      return
    }

    setIsUploading(true)
    try {
      const uploaded = await Promise.all(selectedFiles.map((file) => uploadImage(file, 'ITEM')))
      const nextImages = uploaded.map((result, index) => ({
        id: `uploaded-${Date.now()}-${index}`,
        src: result.data.url,
      }))
      setUploadedImages((current) => [...current, ...nextImages].slice(0, 9))
      setUploadError('')
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '图片上传失败，请重新选择')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <UnifiedMarketplacePage activeUserLabel="我的发布">
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
                    key={image.id}
                    onRemove={() => setUploadedImages((current) => current.filter((item) => item.id !== image.id))}
                    src={image.src}
                  />
                ))}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  multiple
                  className="visually-hidden-file"
                  onChange={(event) => {
                    void addImages(Array.from(event.currentTarget.files ?? []))
                    event.currentTarget.value = ''
                  }}
                />
                <button
                  type="button"
                  className="add-image-button"
                  aria-label="继续添加图片"
                  disabled={uploadedImages.length >= 9 || isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus size={34} />
                </button>
                <p className="upload-hint">{isUploading ? '图片上传中...' : '最多 9 张，首图将作为封面'}</p>
                {uploadError ? <p className="upload-error" role="alert">{uploadError}</p> : null}
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
                    {(categoriesQuery.data?.data ?? []).map((category) => {
                      const label = categoryDisplayName(category, categoriesQuery.data?.data ?? [])
                      return (
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedCategory === label}
                        className={selectedCategory === label ? 'active' : undefined}
                        onClick={() => {
                          setSelectedCategory(label)
                          setIsCategoryOpen(false)
                        }}
                        key={category.id}
                      >
                        <BookOpen size={17} />
                        <span>{label}</span>
                      </button>
                      )
                    })}
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
              <button type="button" className="primary" disabled={isSubmitting || isUploading} onClick={() => void submitPublish()}>
                {isSubmitting ? '提交中...' : '提交发布'}
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
    </UnifiedMarketplacePage>
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

function PreviewImage({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="preview-image">
      <img src={src} alt="商品图片预览" />
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

function readPublishDraft(): PublishDraft | null {
  try {
    const storedValue = window.localStorage.getItem(publishDraftStorageKey)
    return storedValue ? (JSON.parse(storedValue) as PublishDraft) : null
  } catch {
    return null
  }
}

function createDraftImages(draft: PublishDraft | null): UploadedImage[] {
  return (draft?.uploadedImages ?? [])
    .filter((src) => src.startsWith('/uploads/') || src.startsWith('http://') || src.startsWith('https://'))
    .slice(0, 9)
    .map((src, index) => ({
      id: `draft-${index}`,
      src,
    }))
}

function resolveCategoryId(categories: Category[], label: string) {
  return categories.find((category) => categoryDisplayName(category, categories) === label)?.id
}

function categoryDisplayName(category: Category, categories: Category[]) {
  const rootLabel = category.name === '教材' ? '教材教辅' : category.name === '数码' ? '数码电子' : category.name
  if (!category.parentId) return rootLabel
  const parent = categories.find((item) => item.id === category.parentId)
  const parentLabel = parent?.name === '教材' ? '教材教辅' : parent?.name === '数码' ? '数码电子' : parent?.name
  return `${parentLabel ?? '二级类目'} / ${category.name}`
}

function parsePriceCent(value: string) {
  const normalized = value.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null
  }

  const amount = Number(normalized)
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : null
}
