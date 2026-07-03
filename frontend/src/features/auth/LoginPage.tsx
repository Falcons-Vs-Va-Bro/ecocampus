import { RotateCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import './LoginPage.css'

const xmuLogoUrl = 'https://ids.xmu.edu.cn/authserver/qrcodeTheme/static/dzimages/logo.png'
const xmuBackgrounds = [
  'https://ids.xmu.edu.cn/authserver/qrcodeTheme/static/dzimages/1.jpg',
  'https://ids.xmu.edu.cn/authserver/qrcodeTheme/static/dzimages/2.jpg',
  'https://ids.xmu.edu.cn/authserver/qrcodeTheme/static/dzimages/3.jpg',
] as const

type LoginMode = 'qr' | 'account'
type Locale = 'en' | 'zh'

const copy = {
  en: {
    langPrimary: 'English',
    langSecondary: '中文',
    title: 'Unified identity',
    qrTab: 'Scan to login',
    accountTab: 'Account login',
    qrTitle: 'Secure login by scanning qr code',
    warning:
      'It is strictly forbidden to transmit or process state secrets on this non-confidential Internet platform. Please confirm that the scanned and uploaded files and materials do not involve state secrets.',
    username: 'Please enter student ID/work ID',
    password: 'Please enter Password',
    login: 'Login',
    onlineGuider: 'Online Guider',
    forgetPassword: 'Forget password',
    alumniReset: 'Student and alumni account disabled can be reset through forget password.',
    firstLogin: 'For first login, please click forget password to reset; for more, please click online help.',
    mockNotice: 'Local SSO preview only. Production login should redirect to the official XMU identity platform.',
    copyright: 'Copyright © Xiamen University',
  },
  zh: {
    langPrimary: '中文',
    langSecondary: 'English',
    title: '统一身份认证',
    qrTab: '扫码登录',
    accountTab: '账号登录',
    qrTitle: '扫码安全登录',
    warning: '严禁在非涉密互联网平台传输、处理国家秘密，请确认扫码上传的文件资料不涉及国家秘密。',
    username: '请输入学号/工号',
    password: '请输入密码',
    login: '登录',
    onlineGuider: '在线帮助',
    forgetPassword: '忘记密码',
    alumniReset: '学生校友账号禁用可通过忘记密码进行重置',
    firstLogin: '首次登录请点击忘记密码进行重置;更多请点在线帮助',
    mockNotice: '本地仅为统一身份认证外观预览；生产登录应跳转厦大官方统一身份认证平台。',
    copyright: 'Copyright © 厦门大学',
  },
} as const

export function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('qr')
  const [locale, setLocale] = useState<Locale>('en')
  const [backgroundIndex, setBackgroundIndex] = useState(0)
  const [notice, setNotice] = useState('')
  const t = copy[locale]

  useDocumentTitle('XMU Unified identity authentication platform')

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBackgroundIndex((current) => (current + 1) % xmuBackgrounds.length)
    }, 5200)

    return () => window.clearInterval(timer)
  }, [])

  function switchMode(nextMode: LoginMode) {
    setMode(nextMode)
    setNotice('')
  }

  function handleMockLogin() {
    setNotice(t.mockNotice)
  }

  return (
    <main className="xmu-login-page">
      <div className="xmu-background-carousel" aria-hidden="true">
        <div
          className="xmu-background-track"
          style={{ transform: `translateX(-${backgroundIndex * 100}%)` }}
        >
          {xmuBackgrounds.map((imageUrl) => (
            <span
              className="xmu-background-slide"
              key={imageUrl}
              style={{ backgroundImage: `url("${imageUrl}")` }}
            />
          ))}
        </div>
      </div>

      <div className="xmu-language-switch" aria-label="language switch">
        <button
          className={locale === 'en' ? 'active' : ''}
          type="button"
          onClick={() => setLocale('en')}
        >
          English
        </button>
        <button
          className={locale === 'zh' ? 'active' : ''}
          type="button"
          onClick={() => setLocale('zh')}
        >
          中文
        </button>
      </div>

      <section className="xmu-login-card" aria-label={t.title}>
        <header className="xmu-login-brand">
          <img src={xmuLogoUrl} alt="Xiamen University" />
          <h1>{t.title}</h1>
        </header>

        <div className="xmu-login-tabs" role="tablist" aria-label="login methods">
          <button
            className={mode === 'qr' ? 'active' : ''}
            type="button"
            role="tab"
            aria-selected={mode === 'qr'}
            onClick={() => switchMode('qr')}
          >
            {t.qrTab}
          </button>
          <button
            className={mode === 'account' ? 'active' : ''}
            type="button"
            role="tab"
            aria-selected={mode === 'account'}
            onClick={() => switchMode('account')}
          >
            {t.accountTab}
          </button>
        </div>

        {mode === 'qr' ? (
          <div className="xmu-qr-panel">
            <div className="xmu-qr-placeholder" aria-label="QR login placeholder">
              <div className="xmu-qr-pattern" />
              <span className="xmu-qr-refresh">
                <RotateCw size={38} strokeWidth={1.8} />
              </span>
            </div>
            <h2>{t.qrTitle}</h2>
            <p>{t.warning}</p>
          </div>
        ) : (
          <form className="xmu-account-panel" onSubmit={(event) => event.preventDefault()}>
            <label>
              <span>{t.username}</span>
              <input aria-label={t.username} placeholder={t.username} readOnly />
            </label>
            <label>
              <span>{t.password}</span>
              <input aria-label={t.password} placeholder={t.password} readOnly type="password" />
            </label>
            <button className="xmu-login-submit" type="button" onClick={handleMockLogin}>
              {t.login}
            </button>
            <div className="xmu-account-links">
              <a href="https://ids.xmu.edu.cn/authserver/fetchOnlineGuider">{t.onlineGuider}</a>
              <a href="https://pass.xmu.edu.cn/">{t.forgetPassword}</a>
            </div>
            <div className="xmu-account-tips">
              <p>{t.alumniReset}</p>
              <p>{t.firstLogin}</p>
            </div>
            <p className="xmu-account-warning">{t.warning}</p>
            {notice ? <p className="xmu-mock-notice">{notice}</p> : null}
          </form>
        )}
      </section>

      <div className="xmu-carousel-dots" aria-label="background carousel">
        {xmuBackgrounds.map((imageUrl, index) => (
          <button
            aria-label={`Show background ${index + 1}`}
            className={index === backgroundIndex ? 'active' : ''}
            key={imageUrl}
            type="button"
            onClick={() => setBackgroundIndex(index)}
          />
        ))}
      </div>

      <footer className="xmu-login-footer">{t.copyright}</footer>
    </main>
  )
}
