import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  BookOpen,
  Box,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Dumbbell,
  Grid3X3,
  Home,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Pencil,
  PlusCircle,
  Search,
  ShoppingBasket,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  User,
} from 'lucide-react'
import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createAddress as createAddressRequest,
  deleteAddress as deleteAddressRequest,
  listAddresses,
  updateAddress as updateAddressRequest,
} from '../../api/profile.api'
import type { Address, UpsertAddressRequest } from '../../api/profile.api'
import { queryKeys } from '../../api/queryKeys'
import campusGateImage from '../../assets/favorites/campus-gate.webp'
import campusSidebarImage from '../../assets/favorites/campus-sidebar.webp'
import profileVerifyCardImage from '../../assets/favorites/profile-verify-card.webp'
import { UnifiedMarketplacePage } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useCurrentUserIdentity } from '../../hooks/useCurrentUserIdentity'
import { useUnreadMessageCount } from '../../hooks/useUnreadMessageCount'
import './ProfilePage.css'
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
  { label: '乐器文具', icon: Pencil, to: '/items/instruments' },
  { label: '票务转让', icon: ClipboardList, to: '/items/tickets' },
  { label: '其他', icon: Box, to: '/items/others' },
]

const userNav = [
  { label: '我的收藏', icon: Star, to: '/favorites' },
  { label: '我的发布', icon: Store, to: '/items/mine' },
  { label: '购买订单', icon: ClipboardList, to: '/orders/purchase' },
  { label: '出售订单', icon: BriefcaseBusiness, to: '/orders/sale' },
  { label: '消息中心', icon: MessageCircle, to: '/messages' },
  { label: '个人中心', icon: User, to: '/profile', active: true },
]

export function ProfilePage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const identity = useCurrentUserIdentity()
  const unreadMessageCount = useUnreadMessageCount()
  useDocumentTitle('厦大闲置 - 个人中心')
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [studentNo, setStudentNo] = useState('2023****5123')
  const [phoneNumber, setPhoneNumber] = useState('138****6721')
  const [draftStudentNo, setDraftStudentNo] = useState(studentNo)
  const [draftPhoneNumber, setDraftPhoneNumber] = useState(phoneNumber)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [phoneVisible, setPhoneVisible] = useState(true)
  const [messageReminder, setMessageReminder] = useState(true)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const displayNickname = identity.currentUser?.nickname ?? identity.nickname
  const verificationLabel = verificationStatusLabel(identity.currentUser?.verificationStatus)

  const addressesQuery = useQuery({
    queryKey: queryKeys.profile.addresses,
    queryFn: listAddresses,
    enabled: identity.isAuthenticated,
  })

  const refreshAddresses = () => queryClient.invalidateQueries({ queryKey: queryKeys.profile.addresses })

  const createAddressMutation = useMutation({
    mutationFn: createAddressRequest,
    onSuccess: () => {
      setIsAddingAddress(false)
      refreshAddresses()
    },
  })

  const updateAddressMutation = useMutation({
    mutationFn: ({ addressId, payload }: { addressId: number; payload: UpsertAddressRequest }) => updateAddressRequest(addressId, payload),
    onSuccess: refreshAddresses,
  })

  const deleteAddressMutation = useMutation({
    mutationFn: deleteAddressRequest,
    onSuccess: refreshAddresses,
  })

  const addresses = addressesQuery.data?.data ?? []
  const addressMutationError = createAddressMutation.error ?? updateAddressMutation.error ?? deleteAddressMutation.error

  useEffect(() => {
    if (!identity.currentUser) {
      return
    }

    const nextStudentNo = identity.currentUser.studentNoMasked ?? '尚未提交'
    const nextPhone = maskAccount(identity.currentUser.phone)
    setStudentNo(nextStudentNo)
    setPhoneNumber(nextPhone)
    setDraftStudentNo(nextStudentNo)
    setDraftPhoneNumber(nextPhone)
  }, [identity.currentUser])

  function setDefaultAddress(address: Address) {
    updateAddressMutation.mutate({ addressId: address.id, payload: toAddressPayload(address, true) })
  }

  function deleteAddress(addressId: number) {
    deleteAddressMutation.mutate(addressId)
  }

  function updateAddress(addressId: number, payload: UpsertAddressRequest) {
    updateAddressMutation.mutate({ addressId, payload })
  }

  function createAddress(payload: UpsertAddressRequest) {
    createAddressMutation.mutate(payload)
  }

  function startEditProfile() {
    setDraftStudentNo(studentNo)
    setDraftPhoneNumber(phoneNumber)
    setIsEditingProfile(true)
  }

  function saveProfile() {
    setStudentNo(draftStudentNo.trim() || studentNo)
    setPhoneNumber(draftPhoneNumber.trim() || phoneNumber)
    setIsEditingProfile(false)
  }

  function cancelEditProfile() {
    setDraftStudentNo(studentNo)
    setDraftPhoneNumber(phoneNumber)
    setIsEditingProfile(false)
  }

  function changeAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    if (!file) {
      return
    }
    setAvatarPreview(URL.createObjectURL(file))
    event.currentTarget.value = ''
  }

  function confirmLogout() {
    identity.logout()
    navigate('/login', { replace: true })
  }

  return (
    <UnifiedMarketplacePage activeUserLabel="个人中心">
      <div className="profile-page">
      <header className="profile-topbar">
        <a className="profile-brand" href="/">
          <img src={campusGateImage} alt="" aria-hidden="true" />
          <span>
            <strong>厦大闲置</strong>
            <small>厦门大学校园二手交易平台</small>
          </span>
        </a>

        <form className="profile-search">
          <Search size={24} />
          <input aria-label="搜索商品" placeholder="搜索商品名称、类别、关键词..." />
          <button type="submit">搜索</button>
        </form>

        <div className="profile-userbar" aria-label="用户快捷入口">
          <NoticeButton label="通知" count={0}>
            <Bell size={25} />
          </NoticeButton>
          <NoticeButton label="私信" count={unreadMessageCount}>
            <Mail size={26} />
          </NoticeButton>
          <button type="button" className="profile-user-button">
            <span className="profile-avatar mini">{identity.avatarText}</span>
            <strong>{displayNickname}</strong>
            <em>{identity.roleLabel}</em>
            <ChevronDown size={17} />
          </button>
        </div>
      </header>

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <nav className="profile-nav" aria-label="商品分类">
            {categoryNav.map((item) => (
              <a href={item.to} key={item.label}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <nav className="profile-nav profile-nav-user" aria-label="个人中心">
            {userNav.map((item) => (
              <a className={item.active ? 'active' : undefined} href={item.to} key={item.label}>
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.to === '/messages' && unreadMessageCount > 0 ? <b>{unreadMessageCount}</b> : null}
              </a>
            ))}
          </nav>

          <img className="profile-sidebar-sketch" src={campusSidebarImage} alt="" aria-hidden="true" />
        </aside>

        <main className="profile-main">
          <section className="profile-content">
            <header className="profile-heading">
              <h1>个人中心</h1>
              <p>管理个人资料、校园核验与常用地址</p>
            </header>

            <section className="profile-card">
              <div className="student-card">
                <div className="profile-avatar large" aria-hidden="true">
                  {avatarPreview ? <img src={avatarPreview} alt="" /> : identity.avatarText}
                </div>
                <div>
                  <h2>{displayNickname}</h2>
                  {isEditingProfile ? (
                    <div className="profile-edit-fields">
                      <label>
                        <span>学号</span>
                        <input value={draftStudentNo} onChange={(event) => setDraftStudentNo(event.target.value)} />
                      </label>
                      <label>
                        <span>手机号</span>
                        <input value={draftPhoneNumber} onChange={(event) => setDraftPhoneNumber(event.target.value)} />
                      </label>
                    </div>
                  ) : (
                    <>
                      <p>学号：{studentNo}</p>
                      <p>手机号：{phoneNumber}</p>
                    </>
                  )}
                  <div className="profile-tags">
                    <span>厦门大学</span>
                    <span>学生认证</span>
                  </div>
                </div>
              </div>
              <div className="profile-verify-info">
                <p>
                  校园核验：
                  <strong>
                    <CheckCircle2 size={19} />
                    {verificationLabel}
                  </strong>
                </p>
                <p>
                  查看核验 <a href="/verify">/verify</a>
                </p>
              </div>
              <div className="profile-actions">
                {isEditingProfile ? (
                  <>
                    <button type="button" onClick={saveProfile}>
                      <Pencil size={20} />
                      保存资料
                    </button>
                    <button type="button" onClick={cancelEditProfile}>
                      <XCircleIcon />
                      取消编辑
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={startEditProfile}>
                    <Pencil size={20} />
                    编辑资料
                  </button>
                )}
                <input ref={avatarInputRef} type="file" accept="image/*" className="profile-avatar-input" onChange={changeAvatar} />
                <button type="button" onClick={() => avatarInputRef.current?.click()}>
                  <User size={20} />
                  更换头像
                </button>
              </div>
            </section>

            <section className="address-panel">
              <header>
                <div>
                  <h2>常用地址</h2>
                  <p>可添加多个自提点或校内送货地址</p>
                </div>
                <button type="button" disabled={isAddingAddress} onClick={() => setIsAddingAddress(true)}>
                  <PlusCircle size={20} />
                  新增地址
                </button>
              </header>
              <div className="address-grid">
                {addressesQuery.isLoading ? <p className="address-status">正在加载常用地址…</p> : null}
                {addressesQuery.isError ? (
                  <p className="address-status address-status-error">
                    常用地址加载失败
                    <button type="button" onClick={() => addressesQuery.refetch()}>重新加载</button>
                  </p>
                ) : null}
                {addressMutationError ? <p className="address-status address-status-error">地址保存失败：{addressMutationError.message}</p> : null}
                {isAddingAddress ? (
                  <NewAddressCard
                    isPending={createAddressMutation.isPending}
                    onCancel={() => setIsAddingAddress(false)}
                    onCreate={createAddress}
                  />
                ) : null}
                {!addressesQuery.isLoading && !addressesQuery.isError && addresses.length === 0 && !isAddingAddress ? (
                  <p className="address-status">还没有常用地址，点击“新增地址”添加第一条。</p>
                ) : null}
                {addresses.map((address) => (
                  <AddressCard
                    address={address}
                    isPending={updateAddressMutation.isPending || deleteAddressMutation.isPending}
                    onDelete={deleteAddress}
                    onSetDefault={setDefaultAddress}
                    onUpdate={updateAddress}
                    key={address.id}
                  />
                ))}
              </div>
            </section>

            <section className="settings-row">
              <div className="setting-card">
                <Lock size={25} />
                <div>
                  <h3>隐私设置</h3>
                  <p>手机号仅交易双方可见</p>
                </div>
                <Toggle checked={phoneVisible} onClick={() => setPhoneVisible((current) => !current)} label="手机号可见" />
              </div>
              <div className="setting-card">
                <Bell size={25} />
                <div>
                  <h3>消息提醒</h3>
                  <p>订单状态变化提醒</p>
                </div>
                <Toggle checked={messageReminder} onClick={() => setMessageReminder((current) => !current)} label="消息提醒" />
              </div>
            </section>

            <button type="button" className="logout-button" onClick={() => setShowLogoutDialog(true)}>
              <LogOut size={22} />
              退出登录
            </button>
          </section>

          <aside className="profile-panels">
            <section className="profile-panel">
              <h2>资料提示</h2>
              <ul>
                <li>
                  <CheckCircle2 size={18} />
                  <span>校园核验通过后可发布闲置和求购</span>
                </li>
                <li>
                  <CheckCircle2 size={18} />
                  <span>手机号仅用于交易沟通，不会公开展示</span>
                </li>
                <li>
                  <CheckCircle2 size={18} />
                  <span>默认地址会优先用于自提和校内配送</span>
                </li>
              </ul>
              <div className="profile-panel-art" aria-hidden="true">
                <img className="profile-panel-art-image" src={profileVerifyCardImage} alt="" />
              </div>
            </section>

            <section className="profile-panel profile-address-help">
              <h2>地址管理</h2>
              <div className="address-steps">
                <span>
                  <PlusCircle size={36} /> 新增地址
                </span>
                <b>↓</b>
                <span>
                  <Star size={36} /> 设为默认
                </span>
                <b>↓</b>
                <span>
                  <ShoppingCart size={36} /> 交易时选择
                </span>
              </div>
              <p>可为不同校区和宿舍保存多个地址</p>
            </section>
          </aside>
        </main>
      </div>

      {showLogoutDialog ? (
        <div className="logout-dialog-backdrop" role="presentation">
          <section className="logout-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-dialog-title">
            <h2 id="logout-dialog-title">真的要退出吗？</h2>
            <p>退出后需要重新登录才能继续管理收藏、发布和订单。</p>
            <div className="logout-dialog-actions">
              <button type="button" className="logout-dialog-cancel" onClick={() => setShowLogoutDialog(false)}>
                手滑了
              </button>
              <button type="button" className="logout-dialog-confirm" onClick={confirmLogout}>
                我是认真的
              </button>
            </div>
          </section>
        </div>
      ) : null}
      </div>
    </UnifiedMarketplacePage>
  )
}

function XCircleIcon() {
  return <span className="x-circle-icon">×</span>
}

function maskAccount(value: string) {
  if (value.length <= 7) {
    return value
  }

  return `${value.slice(0, 3)}****${value.slice(-4)}`
}

function verificationStatusLabel(status?: string) {
  switch (status) {
    case 'VERIFIED':
      return '已核验'
    case 'PENDING_REVIEW':
      return '审核中'
    case 'REJECTED':
      return '未通过'
    case 'BLACKLISTED':
      return '已限制'
    default:
      return '未核验'
  }
}

function AddressCard({
  address,
  isPending,
  onDelete,
  onSetDefault,
  onUpdate,
}: {
  address: Address
  isPending: boolean
  onDelete: (addressId: number) => void
  onSetDefault: (address: Address) => void
  onUpdate: (addressId: number, payload: UpsertAddressRequest) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftCampusArea, setDraftCampusArea] = useState(address.campusArea)
  const [draftDetail, setDraftDetail] = useState(address.detail)
  const [draftReceiverName, setDraftReceiverName] = useState(address.receiverName)
  const [draftReceiverPhone, setDraftReceiverPhone] = useState(address.receiverPhone)

  function startEditing() {
    setDraftCampusArea(address.campusArea)
    setDraftDetail(address.detail)
    setDraftReceiverName(address.receiverName)
    setDraftReceiverPhone(address.receiverPhone)
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
  }

  function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onUpdate(address.id, {
      campusArea: draftCampusArea.trim(),
      detail: draftDetail.trim(),
      receiverName: draftReceiverName.trim(),
      receiverPhone: draftReceiverPhone.trim(),
      isDefault: address.isDefault,
    })
    setIsEditing(false)
  }

  return (
    <article className="address-card">
      <form onSubmit={saveAddress}>
        <header>
          <div>
            <MapPin size={28} />
            {isEditing ? (
              <input
                className="address-title-input"
                aria-label="校区或区域"
                maxLength={80}
                required
                value={draftCampusArea}
                onChange={(event) => setDraftCampusArea(event.target.value)}
                autoFocus
              />
            ) : (
              <h3>{address.campusArea}</h3>
            )}
            {address.isDefault ? <span>默认</span> : null}
          </div>
        </header>
        {isEditing ? (
          <div className="address-edit-fields">
            <label>
              <span>详细地点</span>
              <input maxLength={255} required value={draftDetail} onChange={(event) => setDraftDetail(event.target.value)} />
            </label>
            <label>
              <span>收货人</span>
              <input maxLength={40} required value={draftReceiverName} onChange={(event) => setDraftReceiverName(event.target.value)} />
            </label>
            <label>
              <span>手机号</span>
              <input inputMode="tel" pattern="1[0-9]{10}" required value={draftReceiverPhone} onChange={(event) => setDraftReceiverPhone(event.target.value)} />
            </label>
          </div>
        ) : (
          <>
            <p>{address.detail}</p>
            <p>联系人：{address.receiverName} {maskPhone(address.receiverPhone)}</p>
          </>
        )}
        <footer>
          {isEditing ? (
            <>
              <button type="submit">保存</button>
              <button type="button" onClick={cancelEditing}>取消</button>
            </>
          ) : (
            <>
              {!address.isDefault ? (
                <button type="button" disabled={isPending} onClick={() => onSetDefault(address)}>
                  设为默认
                </button>
              ) : null}
              <button type="button" disabled={isPending} onClick={startEditing}>编辑</button>
            </>
          )}
          <button type="button" className="danger" disabled={isPending} onClick={() => onDelete(address.id)}>
            删除
          </button>
        </footer>
      </form>
    </article>
  )
}

function NewAddressCard({
  isPending,
  onCancel,
  onCreate,
}: {
  isPending: boolean
  onCancel: () => void
  onCreate: (payload: UpsertAddressRequest) => void
}) {
  const [campusArea, setCampusArea] = useState('')
  const [detail, setDetail] = useState('')
  const [receiverName, setReceiverName] = useState('')
  const [receiverPhone, setReceiverPhone] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onCreate({
      campusArea: campusArea.trim(),
      detail: detail.trim(),
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      isDefault,
    })
  }

  return (
    <article className="address-card address-create-card">
      <form onSubmit={submit}>
        <header>
          <div><MapPin size={28} /><h3>新增常用地址</h3></div>
        </header>
        <div className="address-edit-fields">
          <label>
            <span>校区区域</span>
            <input maxLength={80} placeholder="例如：思明校区" required value={campusArea} onChange={(event) => setCampusArea(event.target.value)} />
          </label>
          <label>
            <span>详细地点</span>
            <input maxLength={255} placeholder="宿舍楼、门牌或自提点" required value={detail} onChange={(event) => setDetail(event.target.value)} />
          </label>
          <label>
            <span>收货人</span>
            <input maxLength={40} required value={receiverName} onChange={(event) => setReceiverName(event.target.value)} />
          </label>
          <label>
            <span>手机号</span>
            <input inputMode="tel" pattern="1[0-9]{10}" placeholder="11 位手机号" required value={receiverPhone} onChange={(event) => setReceiverPhone(event.target.value)} />
          </label>
          <label className="address-default-field">
            <span>默认地址</span>
            <input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} />
          </label>
        </div>
        <footer>
          <button type="submit" disabled={isPending}>{isPending ? '保存中…' : '保存地址'}</button>
          <button type="button" disabled={isPending} onClick={onCancel}>取消</button>
        </footer>
      </form>
    </article>
  )
}

function toAddressPayload(address: Address, isDefault: boolean): UpsertAddressRequest {
  return {
    receiverName: address.receiverName,
    receiverPhone: address.receiverPhone,
    campusArea: address.campusArea,
    detail: address.detail,
    isDefault,
  }
}

function maskPhone(value: string) {
  return value.length === 11 ? `${value.slice(0, 3)}****${value.slice(-4)}` : value
}

function Toggle({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" className={checked ? 'profile-toggle active' : 'profile-toggle'} aria-pressed={checked} aria-label={label} onClick={onClick}>
      <span />
    </button>
  )
}

function NoticeButton({ children, label, count }: { children: React.ReactNode; label: string; count: number }) {
  return (
    <button type="button" className="profile-notice-button" aria-label={label}>
      {children}
      {count > 0 ? <span>{count}</span> : null}
    </button>
  )
}
