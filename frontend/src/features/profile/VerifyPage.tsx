import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Camera,
  CheckCircle2,
  CircleAlert,
  FileImage,
  IdCard,
  KeyRound,
  MessageSquareText,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  requestPhoneVerificationCode,
  submitCampusVerification,
  type PhoneVerificationCodeResponse,
} from '../../api/auth.api'
import { queryKeys } from '../../api/queryKeys'
import { UnifiedMarketplacePage } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAuthStore } from '../../stores/auth.store'
import './VerifyPage.css'
import '../../styles/marketplace-consistency.css'

export function VerifyPage() {
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
  const [notificationVisible, setNotificationVisible] = useState(false)
  const [resendSeconds, setResendSeconds] = useState(0)
  const [phoneError, setPhoneError] = useState('')
  const [realName, setRealName] = useState('')
  const [studentNo, setStudentNo] = useState('')
  const [college, setCollege] = useState('')
  const [grade, setGrade] = useState('')
  const [formError, setFormError] = useState('')
  const [completedUser, setCompletedUser] = useState<{ phone: string; studentNoMasked?: string }>()

  useDocumentTitle('厦大闲置 - 校园身份认证')

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
      setNotificationVisible(true)
      setResendSeconds(response.data.resendAfterSeconds)
      setPhoneError('')
      setFormError('')
    },
    onError: (error) => setPhoneError(error instanceof Error ? error.message : '验证码发送失败，请稍后重试'),
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
      setNotificationVisible(false)
      setCompletedUser({ phone: response.data.phone, studentNoMasked: response.data.studentNoMasked })
      setFormError('')
      queryClient.setQueryData(queryKeys.auth.me, response)
    },
    onError: (error) => setFormError(error instanceof Error ? error.message : '认证失败，请检查填写内容'),
  })

  const isCompleted = verificationStatus === 'VERIFIED' || Boolean(completedUser)

  function sendCode() {
    if (!/^1[3-9]\d{9}$/.test(mobilePhone)) {
      setPhoneError('请输入有效的中国大陆手机号，例如 138 0000 6721')
      return
    }
    if (resendSeconds > 0) return
    sendCodeMutation.mutate()
  }

  function updateMobilePhone(value: string) {
    const nextPhone = value.replace(/\D/g, '').slice(0, 11)
    setMobilePhone(nextPhone)
    setPhoneError('')
    setFormError('')
    if (deliveryPhone && nextPhone !== deliveryPhone) {
      setVerificationCode('')
      setNotificationVisible(false)
    }
  }

  function submitVerification() {
    if (!phoneConfirmed) {
      setFormError('请先填写页面通知中的 6 位验证码')
      return
    }
    if (!realName.trim() || !/^\d{8,20}$/.test(studentNo) || !college.trim() || !grade.trim()) {
      setFormError('请完整填写姓名、8–20 位学号、院系和年级')
      return
    }
    submitMutation.mutate()
  }

  const smsNotification = createPortal(
    <AnimatePresence>
      {delivery && notificationVisible ? (
        <div className="sms-toast-layer" aria-live="assertive">
          <motion.aside
            className="web-sms-toast"
            role="status"
            aria-label="网页短信验证码通知"
            initial={reduceMotion ? false : { opacity: 0, y: -28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.24 }}
          >
            <span className="sms-toast-icon" aria-hidden="true"><MessageSquareText size={24} /></span>
            <div className="sms-toast-content">
              <header><strong>网页短信通知</strong><time>刚刚</time></header>
              <p>【厦大闲置】验证码 <strong>{delivery.demoCode}</strong>，5 分钟内有效。请勿向他人泄露。</p>
              <small>发送至 {delivery.maskedPhone} · 课堂模拟，不会产生真实短信</small>
              <button type="button" onClick={() => setVerificationCode(delivery.demoCode)}>填入验证码</button>
            </div>
            <button className="sms-toast-close" type="button" aria-label="关闭验证码通知" onClick={() => setNotificationVisible(false)}>
              <X size={18} />
            </button>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )

  return (
    <>
      {smsNotification}
      <UnifiedMarketplacePage activeUserLabel="个人中心">
        <div className="verify-page">
          <main className="verify-main">
            <section className="verify-content">
              <header className="verify-heading">
                <div>
                  <span className="verify-eyebrow"><ShieldCheck size={17} /> CAMPUS IDENTITY</span>
                  <h1>校园身份认证</h1>
                </div>
                <p>先验证手机号，再完善校园身份资料，认证后即可使用交易功能。</p>
              </header>

              <section className="verify-progress" aria-label="认证进度">
                <ProgressStep done={Boolean(delivery)} number="1" label="发送验证码" />
                <b aria-hidden="true">→</b>
                <ProgressStep done={phoneConfirmed} number="2" label="确认手机号" />
                <b aria-hidden="true">→</b>
                <ProgressStep done={isCompleted} number="3" label="完成认证" />
              </section>

              {isCompleted ? (
                <motion.article
                  className="verify-card success verify-finish-card"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span className="verify-success-icon"><ShieldCheck size={52} /></span>
                  <h2>校园身份认证完成</h2>
                  <p>手机号 {completedUser?.phone ?? '已绑定'} · 学号 {completedUser?.studentNoMasked ?? '已核验'}</p>
                  <em><CheckCircle2 size={18} /> 已认证</em>
                  <div className="verify-finish-actions"><a href="/publish">去发布商品</a><a href="/profile">返回个人中心</a></div>
                </motion.article>
              ) : (
                <div className="verify-workspace">
                  <article className="verify-card phone-verification-card">
                    <header>
                      <div><small>STEP 01</small><h2>验证手机号</h2></div>
                      <span className="demo-badge">网页模拟验证码</span>
                    </header>
                    <p className="verify-card-intro">输入手机号并发送验证码。验证码会显示在网页顶部通知中，不会发送真实短信。</p>

                    <div className="phone-verification-fields">
                      <div className="phone-input-group">
                        <label className={phoneError ? 'phone-field invalid' : 'phone-field'}>
                          <Phone size={22} />
                          <input
                            value={mobilePhone}
                            onChange={(event) => updateMobilePhone(event.target.value)}
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="请输入 11 位手机号"
                            aria-label="手机号"
                            aria-invalid={Boolean(phoneError)}
                            aria-describedby={phoneError ? 'phone-verification-error' : undefined}
                          />
                          <button type="button" disabled={sendCodeMutation.isPending || resendSeconds > 0} onClick={sendCode}>
                            {sendCodeMutation.isPending ? '发送中…' : resendSeconds > 0 ? `${resendSeconds}s 后重发` : delivery ? '重新发送' : '发送验证码'}
                          </button>
                        </label>
                        {phoneError ? (
                          <p className="phone-verification-error" id="phone-verification-error" role="alert">
                            <CircleAlert size={16} /> {phoneError}
                          </p>
                        ) : <small className="phone-format-hint">支持带空格输入，需使用有效的大陆手机号段</small>}
                      </div>

                      <label className={phoneConfirmed ? 'code-field confirmed' : 'code-field'}>
                        <KeyRound size={21} />
                        <input
                          value={verificationCode}
                          onChange={(event) => { setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setFormError('') }}
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          placeholder="请输入 6 位验证码"
                          aria-label="验证码"
                        />
                        <span>{phoneConfirmed ? <><CheckCircle2 size={17} /> 手机号已确认</> : '6 位数字'}</span>
                      </label>
                    </div>

                    {delivery ? (
                      <button className="show-sms-notification" type="button" onClick={() => setNotificationVisible(true)}>
                        <MessageSquareText size={17} /> 查看顶部验证码通知
                      </button>
                    ) : null}
                  </article>

                  <article className={phoneConfirmed ? 'verify-card campus-form-card unlocked' : 'verify-card campus-form-card'}>
                    <header>
                      <div><small>STEP 02</small><h2>填写校园身份</h2></div>
                      {phoneConfirmed
                        ? <span className="unlocked-badge"><CheckCircle2 size={17} /> 已解锁</span>
                        : <span className="locked-badge">请先验证手机号</span>}
                    </header>
                    <div className="campus-form-body" aria-disabled={!phoneConfirmed}>
                      <button
                        type="button"
                        className={studentCardUploaded ? 'upload-card uploaded' : 'upload-card'}
                        disabled={!phoneConfirmed}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera size={38} />
                        <span>{studentCardUploaded ? '已选择学生证图片' : '选择学生证图片'}</span>
                        <small>仅作课堂界面演示，不会上传服务器</small>
                      </button>
                      <div className="verify-form">
                        <label><span>姓名</span><input aria-label="姓名" disabled={!phoneConfirmed} value={realName} onChange={(event) => setRealName(event.target.value)} placeholder="请输入真实姓名" /></label>
                        <label><span>学号</span><input aria-label="学号" disabled={!phoneConfirmed} value={studentNo} onChange={(event) => setStudentNo(event.target.value.replace(/\D/g, '').slice(0, 20))} inputMode="numeric" placeholder="8–20 位数字" /></label>
                        <label><span>院系</span><input aria-label="院系" disabled={!phoneConfirmed} value={college} onChange={(event) => setCollege(event.target.value)} placeholder="例如：信息学院" /></label>
                        <label><span>年级</span><input aria-label="年级" disabled={!phoneConfirmed} value={grade} onChange={(event) => setGrade(event.target.value)} placeholder="例如：2023级" /></label>
                      </div>
                    </div>
                    {formError ? <p className="verify-form-error" role="alert">{formError}</p> : null}
                    <button type="button" className="primary" disabled={!phoneConfirmed || submitMutation.isPending} onClick={submitVerification}>
                      {submitMutation.isPending ? '正在认证…' : '完成校园身份认证'}
                    </button>
                  </article>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="verify-file-input"
                onChange={(event) => { setStudentCardUploaded(Boolean(event.currentTarget.files?.length)); event.currentTarget.value = '' }}
              />
              <a className="back-profile" href="/profile">← 返回个人中心</a>
            </section>

            <aside className="verify-panels">
              <section className="verify-panel">
                <h2>验证说明</h2>
                <ul>
                  <li><MessageSquareText size={18} /><span>验证码只显示在当前网页顶部通知中</span></li>
                  <li><CheckCircle2 size={18} /><span>验证码随机生成，5 分钟有效</span></li>
                  <li><CheckCircle2 size={18} /><span>认证成功后验证码立即失效</span></li>
                  <li><ShieldCheck size={18} /><span>手机号与学号不可重复绑定</span></li>
                </ul>
                <div className="verify-mini-flow" aria-hidden="true"><Phone size={27} /><b>→</b><IdCard size={29} /><b>→</b><ShieldCheck size={30} /></div>
              </section>
              <section className="verify-panel verify-note-panel">
                <FileImage size={30} />
                <p>学生证图片目前只提供交互展示，不会保存或上传敏感证件文件。</p>
              </section>
            </aside>
          </main>
        </div>
      </UnifiedMarketplacePage>
    </>
  )
}

function ProgressStep({ done, label, number }: { done: boolean; label: string; number: string }) {
  return <div className={done ? 'done' : undefined}><span>{done ? <CheckCircle2 size={21} /> : number}</span><strong>{label}</strong></div>
}
