import {
  Bell,
  BookOpen,
  Box,
  BriefcaseBusiness,
  Building2,
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
import type { ChangeEvent } from 'react'
import { useRef, useState } from 'react'
import campusGateImage from '../../assets/favorites/campus-gate.png'
import campusSidebarImage from '../../assets/favorites/campus-sidebar.png'
import profileVerifyCardImage from '../../assets/favorites/profile-verify-card.png'
import { UnifiedMarketplacePage } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
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
  { label: '消息中心', icon: MessageCircle, to: '/messages', badge: 3 },
  { label: '个人中心', icon: User, to: '/profile', active: true },
]

interface Address {
  id: number
  title: string
  detail: string
  contact: string
  mode: '自提' | '送货'
  isDefault: boolean
  icon: typeof MapPin
}

const initialAddresses: Address[] = [
  { id: 1, title: '默认自提点', detail: '芙蓉园门口快递柜旁', contact: '陈同学  138****6721', mode: '自提', isDefault: true, icon: MapPin },
  { id: 2, title: '宿舍收货地址', detail: '海韵学生公寓 3 号楼 502', contact: '陈同学  138****6721', mode: '送货', isDefault: false, icon: Building2 },
  { id: 3, title: '教学楼自提点', detail: '嘉庚楼一楼大厅公告栏旁', contact: '陈同学  138****6721', mode: '自提', isDefault: false, icon: Building2 },
  { id: 4, title: '图书馆门口', detail: '翔安校区图书馆南门', contact: '陈同学  138****6721', mode: '自提', isDefault: false, icon: BookOpen },
]

export function ProfilePage() {
  useDocumentTitle('厦大闲置 - 个人中心')
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [addresses, setAddresses] = useState(initialAddresses)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [studentNo, setStudentNo] = useState('2023****5123')
  const [phoneNumber, setPhoneNumber] = useState('138****6721')
  const [draftStudentNo, setDraftStudentNo] = useState(studentNo)
  const [draftPhoneNumber, setDraftPhoneNumber] = useState(phoneNumber)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [phoneVisible, setPhoneVisible] = useState(true)
  const [messageReminder, setMessageReminder] = useState(true)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  function setDefaultAddress(addressId: number) {
    setAddresses((current) => current.map((item) => ({ ...item, isDefault: item.id === addressId })))
  }

  function deleteAddress(addressId: number) {
    setAddresses((current) => current.filter((item) => item.id !== addressId))
  }

  function addAddress() {
    setAddresses((current) => [
      ...current,
      {
        id: Date.now(),
        title: '新的常用地址',
        detail: '请编辑填写详细地点',
        contact: '陈同学  138****6721',
        mode: '自提',
        isDefault: false,
        icon: MapPin,
      },
    ])
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
    window.location.href = '/login'
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
          <NoticeButton label="通知" count={3}>
            <Bell size={25} />
          </NoticeButton>
          <NoticeButton label="私信" count={2}>
            <Mail size={26} />
          </NoticeButton>
          <button type="button" className="profile-user-button">
            <span className="profile-avatar mini">海</span>
            <strong>海风吹过嘉庚楼</strong>
            <em>学生</em>
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
                {item.badge ? <b>{item.badge}</b> : null}
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
                  {avatarPreview ? <img src={avatarPreview} alt="" /> : '海'}
                </div>
                <div>
                  <h2>海风吹过嘉庚楼</h2>
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
                    已核验
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
                <button type="button" onClick={addAddress}>
                  <PlusCircle size={20} />
                  新增地址
                </button>
              </header>
              <div className="address-grid">
                {addresses.map((address) => (
                  <AddressCard address={address} onDelete={deleteAddress} onSetDefault={setDefaultAddress} key={address.id} />
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

function AddressCard({
  address,
  onDelete,
  onSetDefault,
}: {
  address: Address
  onDelete: (addressId: number) => void
  onSetDefault: (addressId: number) => void
}) {
  return (
    <article className="address-card">
      <header>
        <div>
          <address.icon size={28} />
          <h3>{address.title}</h3>
          {address.isDefault ? <span>默认</span> : null}
        </div>
        <em>{address.mode}</em>
      </header>
      <p>{address.detail}</p>
      <p>联系人：{address.contact}</p>
      <footer>
        {!address.isDefault ? (
          <button type="button" onClick={() => onSetDefault(address.id)}>
            设为默认
          </button>
        ) : null}
        <button type="button">编辑</button>
        <button type="button" className="danger" onClick={() => onDelete(address.id)}>
          删除
        </button>
      </footer>
    </article>
  )
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
      <span>{count}</span>
    </button>
  )
}
