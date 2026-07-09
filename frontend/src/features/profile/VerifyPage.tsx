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
  FileImage,
  Grid3X3,
  Home,
  Hourglass,
  IdCard,
  Mail,
  MessageCircle,
  Package,
  Pencil,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Star,
  Store,
  User,
  XCircle,
} from 'lucide-react'
import { useRef, useState } from 'react'
import campusGateImage from '../../assets/favorites/campus-gate.png'
import campusSidebarImage from '../../assets/favorites/campus-sidebar.png'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import './VerifyPage.css'

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
  { label: '出售订单', icon: BriefcaseBusiness, to: '/orders' },
  { label: '消息中心', icon: MessageCircle, to: '/messages', badge: 3 },
  { label: '个人中心', icon: User, to: '/profile', active: true },
]

const tabs = ['未核验', '审核中', '已通过', '已拒绝'] as const

export function VerifyPage() {
  useDocumentTitle('厦大闲置 - 校园核验')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('未核验')
  const [studentCardUploaded, setStudentCardUploaded] = useState(false)
  const [name, setName] = useState('陈同学')
  const [college, setCollege] = useState('信息学院')
  const [grade, setGrade] = useState('2023级')
  const [submittedAt, setSubmittedAt] = useState('2024-05-18 14:30')

  function submitVerification() {
    setSubmittedAt(new Date().toLocaleString('zh-CN', { hour12: false }))
    setActiveTab('审核中')
  }

  function withdrawVerification() {
    setActiveTab('未核验')
  }

  return (
    <div className="verify-page">
      <header className="verify-topbar">
        <a className="verify-brand" href="/">
          <img src={campusGateImage} alt="" aria-hidden="true" />
          <span>
            <strong>厦大闲置</strong>
            <small>厦门大学校园二手交易平台</small>
          </span>
        </a>

        <form className="verify-search">
          <Search size={24} />
          <input aria-label="搜索商品" placeholder="搜索商品名称、类别、关键词..." />
          <button type="submit">搜索</button>
        </form>

        <div className="verify-userbar" aria-label="用户快捷入口">
          <NoticeButton label="通知" count={3}>
            <Bell size={25} />
          </NoticeButton>
          <NoticeButton label="私信" count={2}>
            <Mail size={26} />
          </NoticeButton>
          <button type="button" className="verify-profile-button">
            <span className="verify-avatar">海</span>
            <strong>海风吹过嘉庚楼</strong>
            <em>学生</em>
            <ChevronDown size={17} />
          </button>
        </div>
      </header>

      <div className="verify-layout">
        <aside className="verify-sidebar">
          <nav className="verify-nav" aria-label="商品分类">
            {categoryNav.map((item) => (
              <a href={item.to} key={item.label}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <nav className="verify-nav verify-nav-user" aria-label="个人中心">
            {userNav.map((item) => (
              <a className={item.active ? 'active' : undefined} href={item.to} key={item.label}>
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.badge ? <b>{item.badge}</b> : null}
              </a>
            ))}
          </nav>

          <img className="verify-sidebar-sketch" src={campusSidebarImage} alt="" aria-hidden="true" />
        </aside>

        <main className="verify-main">
          <section className="verify-content">
            <header className="verify-heading">
              <h1>校园核验</h1>
              <p>完成第二次认证，强化交易信任与校园身份标识</p>
            </header>

            <section className="verify-progress">
              <div>
                <span>1</span>
                <strong>手机号绑定</strong>
                <em>
                  <CheckCircle2 size={18} />
                  已绑定 138****6721
                </em>
              </div>
              <b>--------→</b>
              <div>
                <span>2</span>
                <strong>校园资料提交</strong>
                <button type="button">管理员审核</button>
              </div>
              <p>需先绑定手机号后才能提交校园核验</p>
            </section>

            <nav className="verify-tabs" role="tablist" aria-label="核验状态">
              {tabs.map((tab) => (
                <button
                  type="button"
                  className={activeTab === tab ? 'active' : undefined}
                  aria-selected={activeTab === tab}
                  role="tab"
                  onClick={() => setActiveTab(tab)}
                  key={tab}
                >
                  {tab}
                </button>
              ))}
            </nav>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="verify-file-input"
              onChange={(event) => {
                setStudentCardUploaded(Boolean(event.currentTarget.files?.length))
                event.currentTarget.value = ''
              }}
            />

            <section className="verify-card-grid">
              {activeTab === '未核验' ? (
                <article className="verify-card submit">
                  <h2>未核验：提交资料</h2>
                  <div className="submit-body">
                    <button type="button" className={studentCardUploaded ? 'upload-card uploaded' : 'upload-card'} onClick={() => fileInputRef.current?.click()}>
                      <Camera size={46} />
                      <span>{studentCardUploaded ? '已选择学生证图片' : '上传学生证图片'}</span>
                      <small>支持 JPG / PNG，信息需清晰可见</small>
                    </button>
                    <div className="verify-form">
                      <label>
                        姓名：
                        <input value={name} onChange={(event) => setName(event.target.value)} />
                      </label>
                      <label>
                        院系：
                        <input value={college} onChange={(event) => setCollege(event.target.value)} />
                      </label>
                      <label>
                        年级：
                        <input value={grade} onChange={(event) => setGrade(event.target.value)} />
                      </label>
                    </div>
                  </div>
                  <button type="button" className="primary" onClick={submitVerification}>
                    提交核验
                  </button>
                  <p>提交后进入审核中状态</p>
                </article>
              ) : null}

              {activeTab === '审核中' ? (
                <article className="verify-card pending">
                  <header>
                    <h2>审核中：等待管理员审核</h2>
                    <span>审核中</span>
                  </header>
                  <div className="status-row">
                    <Hourglass size={112} />
                    <div>
                      <p>姓名：{name}</p>
                      <p>院系：{college}</p>
                      <p>年级：{grade}</p>
                      <p>提交时间：{submittedAt}</p>
                      <div className="mock-review-actions">
                        <button type="button" onClick={withdrawVerification}>
                          撤销申请
                        </button>
                      </div>
                      <small>审核期间资料不可编辑</small>
                    </div>
                  </div>
                </article>
              ) : null}

              {activeTab === '已通过' ? (
                <article className="verify-card success">
                  <h2>已通过：认证成功</h2>
                  <div className="status-row">
                    <User size={116} />
                    <div>
                      <p>通过时间：2024-05-19 09:20</p>
                      <p>全站展示学生认证标识</p>
                      <em>厦门大学 <CheckCircle2 size={18} /> 已认证</em>
                      <a href="/publish">去发布商品</a>
                      <a href="/profile">返回个人中心</a>
                    </div>
                  </div>
                </article>
              ) : null}

              {activeTab === '已拒绝' ? (
                <article className="verify-card rejected">
                  <header>
                    <h2>已拒绝：重新提交</h2>
                    <span>
                      <XCircle size={18} />
                      审核未通过
                    </span>
                  </header>
                  <div className="reject-body">
                    <div>
                      <p>拒绝原因：</p>
                      <strong>学生证照片模糊，姓名与学号区域无法识别</strong>
                    </div>
                    <button type="button" className="upload-card compact" onClick={() => fileInputRef.current?.click()}>
                      <Camera size={42} />
                      重新上传学生证
                    </button>
                  </div>
                  <button type="button" className="primary" onClick={submitVerification}>
                    重新提交
                  </button>
                  <p>修改后将再次进入管理员审核</p>
                </article>
              ) : null}
            </section>

            <a className="back-profile" href="/profile">← 返回个人中心</a>
          </section>

          <aside className="verify-panels">
            <section className="verify-panel">
              <h2>核验说明</h2>
              <ul>
                <li>
                  <CheckCircle2 size={18} />
                  <span>手机号绑定是校园核验前置条件</span>
                </li>
                <li>
                  <CheckCircle2 size={18} />
                  <span>学生证图片仅用于管理员审核</span>
                </li>
                <li>
                  <CheckCircle2 size={18} />
                  <span>通过后全局显示“已认证”标识</span>
                </li>
                <li>
                  <CheckCircle2 size={18} />
                  <span>未通过可查看原因并重新提交</span>
                </li>
              </ul>
              <IdCard className="verify-panel-art" size={136} />
            </section>

            <section className="verify-panel verify-flow-panel">
              <h2>审核流程</h2>
              <div className="verify-flow">
                <span>
                  <Phone size={36} />
                  绑定手机号
                </span>
                <b>↓</b>
                <span>
                  <FileImage size={36} />
                  上传学生证
                </span>
                <b>↓</b>
                <span>
                  <User size={36} />
                  管理员审核
                </span>
                <b>↓</b>
                <span>
                  <ShieldCheck size={38} />
                  获得已认证标识
                </span>
              </div>
              <p>审核结果会同步到消息中心</p>
            </section>
          </aside>
        </main>
      </div>
    </div>
  )
}

function NoticeButton({ children, label, count }: { children: React.ReactNode; label: string; count: number }) {
  return (
    <button type="button" className="verify-notice-button" aria-label={label}>
      {children}
      <span>{count}</span>
    </button>
  )
}
