import { CheckCircle2, ClipboardCheck, Lightbulb, Plus, Save, Store, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { listCategories, type Category } from '../../api/category.api'
import { uploadImage } from '../../api/file.api'
import { getMyItem, setItemOffShelf, updateItem, type OwnedItemDetail } from '../../api/item.api'
import { queryKeys } from '../../api/queryKeys'
import { UnifiedMarketplacePage } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import type { DeliveryMode, ItemStatus } from '../../types/api'
import './EditItemPage.css'
import '../../styles/marketplace-consistency.css'

const statusLabels: Record<ItemStatus, string> = {
  DRAFT: '草稿',
  PENDING_REVIEW: '审核中',
  ON_SALE: '已上架',
  OFF_SHELF: '已下架',
  REJECTED: '审核驳回',
  VIOLATION_REMOVED: '违规下架',
  SOLD: '已售出',
  DELETED: '已删除',
}

export function EditItemPage() {
  const { id = '' } = useParams()
  const itemQuery = useQuery({ queryKey: queryKeys.items.detail(`mine-${id}`), queryFn: () => getMyItem(id), enabled: Boolean(id) })
  const categoriesQuery = useQuery({ queryKey: queryKeys.categories.list, queryFn: listCategories })
  const item = itemQuery.data?.data
  useDocumentTitle(`厦大闲置 - ${item ? `编辑${item.title}` : '编辑商品'}`)

  return (
    <UnifiedMarketplacePage activeUserLabel="我的发布">
      <div className="edit-page">
        {itemQuery.isLoading ? <p className="edit-image-error">正在读取商品真实信息…</p> : null}
        {itemQuery.isError ? <p className="edit-image-error" role="alert">商品加载失败，可能已售出、违规下架或不属于当前账号。</p> : null}
        {item ? <EditItemForm item={item} categories={categoriesQuery.data?.data ?? []} /> : null}
      </div>
    </UnifiedMarketplacePage>
  )
}

function EditItemForm({ item, categories }: { item: OwnedItemDetail; categories: Category[] }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description)
  const [categoryId, setCategoryId] = useState(item.categoryId)
  const [price, setPrice] = useState((item.priceCent / 100).toFixed(2))
  const [deliveryModes, setDeliveryModes] = useState<DeliveryMode[]>([...item.deliveryModes])
  const [images, setImages] = useState<string[]>([...item.imageUrls])
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const editable = !['VIOLATION_REMOVED', 'SOLD', 'DELETED'].includes(item.status)

  const saveMutation = useMutation({
    mutationFn: () => updateItem(item.id, {
      title: title.trim(),
      description: description.trim(),
      categoryId,
      priceCent: parsePriceCent(price) ?? -1,
      deliveryModes,
      imageUrls: images,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['items', 'mine'] })
      navigate('/items/mine?tab=reviewing', { replace: true })
    },
    onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : '保存失败'),
  })
  const offShelfMutation = useMutation({
    mutationFn: () => setItemOffShelf(item.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['items', 'mine'] })
      navigate('/items/mine?tab=off_shelf', { replace: true })
    },
    onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : '下架失败'),
  })

  async function addImages(files: File[]) {
    const selected = files.slice(0, 9 - images.length)
    if (selected.length === 0) return
    setIsUploading(true)
    try {
      const uploaded = await Promise.all(selected.map((file) => uploadImage(file, 'ITEM')))
      setImages((current) => [...current, ...uploaded.map((response) => response.data.url)].slice(0, 9))
      setError('')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : '图片上传失败')
    } finally {
      setIsUploading(false)
    }
  }

  function save() {
    if (!editable) return setError('当前商品状态不可编辑')
    if (!title.trim()) return setError('请填写商品标题')
    if (!description.trim()) return setError('请填写商品描述')
    if (parsePriceCent(price) == null) return setError('请输入有效价格')
    if (deliveryModes.length === 0) return setError('请至少选择一种交易方式')
    if (images.length === 0) return setError('请至少保留一张商品图片')
    setError('')
    saveMutation.mutate()
  }

  function toggleDelivery(mode: DeliveryMode) {
    setDeliveryModes((current) => current.includes(mode) ? current.filter((value) => value !== mode) : [...current, mode])
  }

  return (
    <main className="edit-main">
      <section className="edit-form-card">
        <header className="edit-heading">
          <div><h1>编辑商品</h1><p>页面读取并保存数据库中的真实商品信息</p><nav><a href="/items/mine">我的发布</a><span> / {item.title} / 编辑</span></nav></div>
          <div className="current-status"><span>当前状态：</span><strong>{statusLabels[item.status]}</strong><small>保存后重新进入管理员审核</small></div>
        </header>

        <EditRow label="商品图片">
          <div className="edit-upload-row">
            {images.map((image) => <div className="edit-preview" key={image}><img src={image} alt="商品图片" /><button type="button" aria-label="删除图片" onClick={() => setImages((current) => current.filter((value) => value !== image))}><X size={15} /></button></div>)}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif" multiple className="edit-file-input" onChange={(event) => { void addImages(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = '' }} />
            {images.length < 9 ? <button type="button" className="edit-add-image" disabled={isUploading} onClick={() => fileInputRef.current?.click()} aria-label="继续添加图片"><Plus size={28} /></button> : null}
            <div className="edit-upload-actions"><p>{isUploading ? '正在上传到 Mac mini…' : `已上传 ${images.length} / 9 张`}</p></div>
          </div>
        </EditRow>
        <EditRow label="商品标题"><input className="edit-input" value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} /></EditRow>
        <EditRow label="商品分类">
          <select className="edit-input" value={categoryId} onChange={(event) => setCategoryId(Number(event.target.value))}>
            {categories.map((category) => <option value={category.id} key={category.id}>{category.parentId ? '　└ ' : ''}{category.name}</option>)}
          </select>
        </EditRow>
        <EditRow label="出售价格"><div className="edit-price-input"><span>¥</span><input value={price} inputMode="decimal" onChange={(event) => setPrice(event.target.value)} /></div></EditRow>
        <EditRow label="交易方式">
          <div className="edit-chips">
            <button type="button" className={deliveryModes.includes('SELF_PICKUP') ? 'active' : ''} onClick={() => toggleDelivery('SELF_PICKUP')}>自提</button>
            <button type="button" className={deliveryModes.includes('DELIVER_TO_SCHOOL') ? 'active' : ''} onClick={() => toggleDelivery('DELIVER_TO_SCHOOL')}>送货到校</button>
          </div>
        </EditRow>
        <EditRow label="商品描述"><div className="edit-description"><textarea maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} /><span>{description.length} / 2000</span></div></EditRow>
        {error ? <p className="edit-image-error" role="alert">{error}</p> : null}
        {!editable ? <p className="edit-image-error">违规下架、已售出或已删除商品不可编辑。</p> : null}
        <footer className="edit-actions">
          <button type="button" className="primary" disabled={!editable || isUploading || saveMutation.isPending} onClick={save}>{saveMutation.isPending ? '正在保存…' : '保存修改'}</button>
          <a href="/items/mine">取消返回</a>
          {item.status !== 'OFF_SHELF' && editable ? <button type="button" className="danger" disabled={offShelfMutation.isPending} onClick={() => offShelfMutation.mutate()}>{offShelfMutation.isPending ? '正在下架…' : '下架商品'}</button> : null}
        </footer>
      </section>

      <aside className="edit-panels">
        <section className="edit-panel"><h2>真实编辑规则</h2><ul><li><CheckCircle2 size={18} /><span>标题、价格、类目、图片和描述均落库</span></li><li><CheckCircle2 size={18} /><span>保存后进入待审核状态</span></li><li><CheckCircle2 size={18} /><span>下架后买家立即不可见</span></li></ul><ClipboardCheck className="edit-panel-art" size={130} /></section>
        <section className="edit-panel edit-flow-panel"><h2>提交后去向</h2><div className="edit-flow"><span><Save size={42} />保存修改</span><b>→</b><span><Store size={42} />管理员复核</span></div><p>审核通过后恢复上架</p></section>
        <section className="edit-tip"><Lightbulb size={30} /><span>违规下架与已售商品不允许绕过状态机再次编辑</span></section>
      </aside>
    </main>
  )
}

function EditRow({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="edit-row"><span>{label}</span>{children}</label>
}

function parsePriceCent(value: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return null
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : null
}
