import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  Bird,
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
  IdCard,
  KeyRound,
  Mail,
  MessageCircle,
  Package,
  Pencil,
  Phone,
  Radio,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Star,
  Store,
  User,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import {
  requestPhoneVerificationCode,
  submitCampusVerification,
  type PhoneVerificationCodeResponse,
} from '../../api/auth.api'
import { queryKeys } from '../../api/queryKeys'
import campusGateImage from '../../assets/favorites/campus-gate.webp'
import campusSidebarImage from '../../assets/favorites/campus-sidebar.webp'
import { UnifiedMarketplacePage } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useUnreadMessageCount } from '../../hooks/useUnreadMessageCount'
import { useAuthStore } from '../../stores/auth.store'
import './VerifyPage.css'
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

export function VerifyPage() {
  const unreadMessageCount = useUnreadMessageCount()
  const queryClient = useQueryClient()
  const reduceMotion = useReducedMotion() ?? false
  const fileInputRef = useRef<HTMLInputElement>(null)
  const accessToken = useAuthStore((state) => state.accessToken)
  const role = useAuthStore((state) => state.role)
  const verificationStatus = useAuthStore((state) => state.verificationStatus)
  const setSession = useAuthStore((state) => state.setSession)

  const [studentCardUploaded, setStudentCardUploaded] = useState(false)
  const [mobilePhone, setMobilePhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [delivery, setDelivery] = useState<PhoneVerificationCodeResponse>()
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [resendSeconds, setResendSeconds] = useState(0)
  const [realName, setRealName] = useState('')
  const [studentNo, setStudentNo] = useState('')
  const [college, setCollege] = useState('')
  const [grade, setGrade] = useState('')
  const [formError, setFormError] = useState('')
  const [completedUser, setCompletedUser] = useState<{ phone: string; studentNoMasked?: string }>()

  useDocumentTitle('厦大闲置 - 校园核验')

  useEffect(() => {
    if (resendSeconds <= 0) return undefined
    const timer = window.setInterval(() => setResendSeconds((current) => Math.max(0, current - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [resendSeconds])

  const sendCodeMutation = useMutation({
    mutationFn: () => requestPhoneVerificationCode({ mobilePhone }),
    onSuccess: (response) => {
      setDelivery(response.data)
      setDeliveryPhone(mobilePhone)
      setVerificationCode('')
      setResendSeconds(response.data.resendAfterSeconds)
      setFormError('')
    },
    onError: (error) => setFormError(error instanceof Error ? error.message : '白鹭暂时迷路了，请稍后重试'),
  })

  const phoneConfirmed = Boolean(
    delivery
    && deliveryPhone === mobilePhone
    && verificationCode === delivery.demoCode,
  )

  const submitMutation = useMutation({
    mutationFn: () => submitCampusVerification({
      realName,
      studentNo,
      college,
      grade,
      mobilePhone,
      verificationCode,
    }),
    onSuccess: (response) => {
      if (accessToken) {
        setSession({
          accessToken,
          role: role === 'ADMIN' ? 'ADMIN' : 'USER',
          verificationStatus: 'VERIFIED',
        })
      }
      setCompletedUser({ phone: response.data.phone, studentNoMasked: response.data.studentNoMasked })
      setFormError('')
      queryClient.setQueryData(queryKeys.auth.me, response)
    },
    onError: (error) => setFormError(error instanceof Error ? error.message : '核验失败，请检查填写内容'),
  })

  const isCompleted = verificationStatus === 'VERIFIED' || Boolean(completedUser)

  function sendCode() {
    if (!/^1[3-9]\d{9}$/.test(mobilePhone)) {
      setFormError('请输入 11 位中国大陆手机号')
      return
    }
    if (resendSeconds > 0) return
    sendCodeMutation.mutate()
  }

  function submitVerification() {
    if (!phoneConfirmed) {
      setFormError('先接收并填写白鹭送来的 6 位演示码')
      return
    }
    if (!realName.trim() || !/^\d{8,20}$/.test(studentNo) || !college.trim() || !grade.trim()) {
      setFormError('请完整填写姓名、8–20 位学号、院系和年级')
      return
    }
    submitMutation.mutate()
  }

  return (
    <UnifiedMarketplacePage activeUserLabel="个人中心">
      <div className="verify-page">
        <header className="verify-topbar">
          <a className="verify-brand" href="/">
            <img src={campusGateImage} alt="" aria-hidden="true" />
            <span><strong>厦大闲置</strong><small>厦门大学校园二手交易平台</small></span>
          </a>
          <form className="verify-search" onSubmit={(event) => event.preventDefault()}>
            <Search size={24} />
            <input aria-label="搜索商品" placeholder="搜索商品名称、类别、关键词..." />
            <button type="submit">搜索</button>
          </form>
          <div className="verify-userbar" aria-label="用户快捷入口">
            <NoticeButton label="通知" count={0}><Bell size={25} /></NoticeButton>
            <NoticeButton label="私信" count={unreadMessageCount}><Mail size={26} /></NoticeButton>
            <button type="button" className="verify-profile-button">
              <span className="verify-avatar">海</span><strong>海风吹过嘉庚楼</strong><em>学生</em><ChevronDown size={17} />
            </button>
          </div>
        </header>

        <div className="verify-layout">
          <aside className="verify-sidebar">
            <nav className="verify-nav" aria-label="商品分类">
              {categoryNav.map((item) => <a href={item.to} key={item.label}><item.icon size={20} /><span>{item.label}</span></a>)}
            </nav>
            <nav className="verify-nav verify-nav-user" aria-label="个人中心">
              {userNav.map((item) => (
                <a className={item.active ? 'active' : undefined} href={item.to} key={item.label}>
                  <item.icon size={20} /><span>{item.label}</span>
                  {item.to === '/messages' && unreadMessageCount > 0 ? <b>{unreadMessageCount}</b> : null}
                </a>
              ))}
            </nav>
            <img className="verify-sidebar-sketch" src={campusSidebarImage} alt="" aria-hidden="true" />
          </aside>

          <main className="verify-main">
            <section className="verify-content">
              <header className="verify-heading">
                <div><span className="verify-eyebrow"><Radio size={17} /> 厦大白鹭短信站</span><h1>校园双重核验</h1></div>
                <p>手机号演示验证 + 校园身份资料，完成后解锁交易功能</p>
              </header>

              <section className="verify-progress" aria-label="核验进度">
                <ProgressStep done={Boolean(delivery)} number="1" label="白鹭送码" />
                <b>→</b>
                <ProgressStep done={phoneConfirmed} number="2" label="手机号确认" />
                <b>→</b>
                <ProgressStep done={isCompleted} number="3" label="校园身份" />
              </section>

              {isCompleted ? (
                <motion.article className="verify-card success verify-finish-card" initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="verify-celebration" aria-hidden="true"><Bird size={82} /><span>✦</span><span>✦</span><span>✦</span></div>
                  <h2>双重核验完成</h2>
                  <p>手机号 {completedUser?.phone ?? '已绑定'} · 学号 {completedUser?.studentNoMasked ?? '已核验'}</p>
                  <em>厦门大学 <CheckCircle2 size={18} /> 已认证</em>
                  <div className="verify-finish-actions"><a href="/publish">去发布商品</a><a href="/profile">返回个人中心</a></div>
                </motion.article>
              ) : (
                <div className="verify-workspace">
                  <article className="verify-card phone-station-card">
                    <header><div><small>STEP 01</small><h2>召唤白鹭送验证码</h2></div><span className="demo-badge">课堂模拟 · 非真实短信</span></header>
                    <p className="station-intro">输入手机号后，白鹭会从嘉庚楼信号塔带回一封 5 分钟有效的演示信。</p>
                    <label className="phone-field">
                      <Phone size={23} />
                      <input value={mobilePhone} onChange={(event) => { setMobilePhone(event.target.value.replace(/\D/g, '').slice(0, 11)); setFormError('') }} inputMode="tel" autoComplete="tel" placeholder="请输入 11 位手机号" aria-label="手机号" />
                      <button type="button" disabled={sendCodeMutation.isPending || resendSeconds > 0} onClick={sendCode}>
                        {sendCodeMutation.isPending ? '正在呼叫…' : resendSeconds > 0 ? `${resendSeconds}s 后重发` : delivery ? '重新送码' : '呼叫白鹭'}
                      </button>
                    </label>

                    <AnimatePresence mode="wait">
                      {delivery ? (
                        <motion.div
                          className="egret-delivery"
                          initial={reduceMotion ? false : { opacity: 0, x: 80, rotate: 4 }}
                          animate={{ opacity: 1, x: 0, rotate: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ type: 'spring', stiffness: 170, damping: 18 }}
                          key={delivery.demoCode}
                        >
                          <motion.span className="egret-bird" animate={reduceMotion ? undefined : { y: [0, -6, 0], rotate: [-2, 2, -2] }} transition={{ duration: 2.1, repeat: Infinity }}><Bird size={48} /></motion.span>
                          <div><small>{delivery.deliveryMessage}</small><strong>{delivery.demoCode}</strong><p>发送至 {delivery.maskedPhone} · 5 分钟内有效</p></div>
                          <button type="button" onClick={() => setVerificationCode(delivery.demoCode)}>让白鹭帮我填入</button>
                        </motion.div>
                      ) : (
                        <div className="egret-waiting"><Bird size={42} /><span>白鹭正在芙蓉湖边待命</span></div>
                      )}
                    </AnimatePresence>

                    <label className={phoneConfirmed ? 'code-field confirmed' : 'code-field'}>
                      <KeyRound size={22} />
                      <input value={verificationCode} onChange={(event) => { setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setFormError('') }} inputMode="numeric" autoComplete="one-time-code" placeholder="填写 6 位演示码" aria-label="验证码" />
                      <span>{phoneConfirmed ? <><CheckCircle2 size={18} /> 手机号已确认</> : '等待信封口令'}</span>
                    </label>
                  </article>

                  <article className={phoneConfirmed ? 'verify-card campus-form-card unlocked' : 'verify-card campus-form-card'}>
                    <header><div><small>STEP 02</small><h2>填写校园身份</h2></div>{phoneConfirmed ? <span className="unlocked-badge"><CheckCircle2 size={17} /> 已解锁</span> : <span className="locked-badge">先完成手机号确认</span>}</header>
                    <div className="campus-form-body" aria-disabled={!phoneConfirmed}>
                      <button type="button" className={studentCardUploaded ? 'upload-card uploaded' : 'upload-card'} disabled={!phoneConfirmed} onClick={() => fileInputRef.current?.click()}>
                        <Camera size={42} /><span>{studentCardUploaded ? '已选择学生证图片' : '上传学生证图片'}</span><small>仅作课堂界面演示，不会上传服务器</small>
                      </button>
                      <div className="verify-form">
                        <label><span>姓名</span><input disabled={!phoneConfirmed} value={realName} onChange={(event) => setRealName(event.target.value)} placeholder="请输入真实姓名" /></label>
                        <label><span>学号</span><input disabled={!phoneConfirmed} value={studentNo} onChange={(event) => setStudentNo(event.target.value.replace(/\D/g, '').slice(0, 20))} inputMode="numeric" placeholder="8–20 位数字" /></label>
                        <label><span>院系</span><input disabled={!phoneConfirmed} value={college} onChange={(event) => setCollege(event.target.value)} placeholder="例如：信息学院" /></label>
                        <label><span>年级</span><input disabled={!phoneConfirmed} value={grade} onChange={(event) => setGrade(event.target.value)} placeholder="例如：2023级" /></label>
                      </div>
                    </div>
                    {formError ? <p className="verify-form-error" role="alert">{formError}</p> : null}
                    <button type="button" className="primary" disabled={!phoneConfirmed || submitMutation.isPending} onClick={submitVerification}>
                      {submitMutation.isPending ? '正在核验…' : '完成双重核验'}
                    </button>
                  </article>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="verify-file-input" onChange={(event) => { setStudentCardUploaded(Boolean(event.currentTarget.files?.length)); event.currentTarget.value = '' }} />
              <a className="back-profile" href="/profile">← 返回个人中心</a>
            </section>

            <aside className="verify-panels">
              <section className="verify-panel verify-story-panel"><Bird className="verify-panel-art" size={116} /><h2>为什么是白鹭？</h2><p>真实短信需要运营商服务。课堂演示中，白鹭承担“投递员”，后端仍负责随机码、过期时间和一次性校验。</p></section>
              <section className="verify-panel verify-flow-panel">
                <h2>核验说明</h2>
                <ul>
                  <li><CheckCircle2 size={18} /><span>验证码随机生成，5 分钟有效</span></li>
                  <li><CheckCircle2 size={18} /><span>验证成功后立即失效</span></li>
                  <li><CheckCircle2 size={18} /><span>演示码不会冒充真实短信</span></li>
                  <li><ShieldCheck size={18} /><span>手机号与学号不可重复绑定</span></li>
                </ul>
                <div className="verify-mini-flow"><Phone size={28} /><b>→</b><IdCard size={30} /><b>→</b><ShieldCheck size={31} /></div>
              </section>
              <section className="verify-panel verify-note-panel"><FileImage size={34} /><p>学生证图片目前只提供交互展示，不会保存敏感证件文件。</p></section>
            </aside>
          </main>
        </div>
      </div>
    </UnifiedMarketplacePage>
  )
}

function ProgressStep({ done, label, number }: { done: boolean; label: string; number: string }) {
  return <div className={done ? 'done' : undefined}><span>{done ? <CheckCircle2 size={23} /> : number}</span><strong>{label}</strong></div>
}

function NoticeButton({ children, label, count }: { children: React.ReactNode; label: string; count: number }) {
  return <button type="button" className="verify-notice-button" aria-label={label}>{children}{count > 0 ? <span>{count}</span> : null}</button>
}
