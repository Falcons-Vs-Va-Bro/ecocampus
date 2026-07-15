import { RotateCw } from 'lucide-react'
import type { FormEventHandler } from 'react'
import xmuLogoUrl from '../../assets/auth/xmu-logo.png'
import type { Locale, LoginCopy } from './loginCopy'

const xmuBackgrounds = [
  'https://ids.xmu.edu.cn/authserver/qrcodeTheme/static/dzimages/1.jpg',
  'https://ids.xmu.edu.cn/authserver/qrcodeTheme/static/dzimages/2.jpg',
  'https://ids.xmu.edu.cn/authserver/qrcodeTheme/static/dzimages/3.jpg',
] as const

export type LoginMode = 'qr' | 'account'

interface DesktopLoginViewProps {
  account: string
  backgroundIndex: number
  isSubmitting: boolean
  locale: Locale
  loginError: string
  mode: LoginMode
  notice: string
  onAccountChange: (value: string) => void
  onBackgroundChange: (index: number) => void
  onLocaleChange: (locale: Locale) => void
  onModeChange: (mode: LoginMode) => void
  onPasswordChange: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  password: string
  t: LoginCopy
}

export function DesktopLoginView({
  account,
  backgroundIndex,
  isSubmitting,
  locale,
  loginError,
  mode,
  notice,
  onAccountChange,
  onBackgroundChange,
  onLocaleChange,
  onModeChange,
  onPasswordChange,
  onSubmit,
  password,
  t,
}: DesktopLoginViewProps) {
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
          onClick={() => onLocaleChange('en')}
        >
          English
        </button>
        <button
          className={locale === 'zh' ? 'active' : ''}
          type="button"
          onClick={() => onLocaleChange('zh')}
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
            onClick={() => onModeChange('qr')}
          >
            {t.qrTab}
          </button>
          <button
            className={mode === 'account' ? 'active' : ''}
            type="button"
            role="tab"
            aria-selected={mode === 'account'}
            onClick={() => onModeChange('account')}
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
          <form autoComplete="off" className="xmu-account-panel" onSubmit={onSubmit}>
            <label>
              <span>{t.username}</span>
              <input
                aria-label={t.username}
                autoComplete="off"
                inputMode="numeric"
                onChange={(event) => onAccountChange(event.target.value)}
                placeholder={t.username}
                value={account}
              />
            </label>
            <label>
              <span>{t.password}</span>
              <input
                aria-label={t.password}
                autoComplete="new-password"
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder={t.password}
                type="password"
                value={password}
              />
            </label>
            <button className="xmu-login-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? t.loginPending : t.login}
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
            {loginError ? <p className="xmu-login-error">{loginError}</p> : null}
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
            onClick={() => onBackgroundChange(index)}
          />
        ))}
      </div>

      <footer className="xmu-login-footer">{t.copyright}</footer>
    </main>
  )
}
