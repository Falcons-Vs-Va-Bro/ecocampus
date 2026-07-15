import type { FormEventHandler } from 'react'
import { useState } from 'react'
import xmuLogoUrl from '../../assets/auth/xmu-logo.png'
import passwordHiddenIcon from '../../assets/auth/xmu-password-hidden.png'
import passwordVisibleIcon from '../../assets/auth/xmu-password-visible.png'
import type { Locale, LoginCopy } from './loginCopy'
import './MobileLoginPage.css'

interface MobileLoginViewProps {
  account: string
  isSubmitting: boolean
  locale: Locale
  loginError: string
  notice: string
  onAccountChange: (value: string) => void
  onLocaleChange: (locale: Locale) => void
  onPasswordChange: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  password: string
  t: LoginCopy
}

export function MobileLoginView({
  account,
  isSubmitting,
  locale,
  loginError,
  notice,
  onAccountChange,
  onLocaleChange,
  onPasswordChange,
  onSubmit,
  password,
  t,
}: MobileLoginViewProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="xmu-mobile-login-page">
      <div className="xmu-mobile-language-switch" aria-label="language switch">
        <button
          className={locale === 'en' ? 'active' : ''}
          type="button"
          onClick={() => onLocaleChange('en')}
        >
          Eng
        </button>
        <button
          className={locale === 'zh' ? 'active' : ''}
          type="button"
          onClick={() => onLocaleChange('zh')}
        >
          中文
        </button>
      </div>

      <section className="xmu-mobile-login-card" aria-label={t.title}>
        <header className="xmu-mobile-login-brand">
          <img src={xmuLogoUrl} alt="厦门大学 Xiamen University" />
          <h1>{t.title}</h1>
        </header>

        <div className="xmu-mobile-login-tab">{t.mobileAccountTab}</div>

        <form autoComplete="off" className="xmu-mobile-login-form" onSubmit={onSubmit}>
          <label className="xmu-mobile-login-field">
            <span className="xmu-mobile-visually-hidden">{t.username}</span>
            <input
              aria-label={t.username}
              autoComplete="off"
              inputMode="numeric"
              onChange={(event) => onAccountChange(event.target.value)}
              placeholder={t.username}
              value={account}
            />
          </label>

          <label className="xmu-mobile-login-field">
            <span className="xmu-mobile-visually-hidden">{t.password}</span>
            <input
              aria-label={t.password}
              autoComplete="new-password"
              className="xmu-mobile-password-input"
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder={t.password}
              type={showPassword ? 'text' : 'password'}
              value={password}
            />
            <button
              className="xmu-mobile-password-toggle"
              type="button"
              aria-label={showPassword ? t.passwordHide : t.passwordShow}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((current) => !current)}
              style={{
                backgroundImage: `url(${showPassword ? passwordVisibleIcon : passwordHiddenIcon})`,
              }}
            />
          </label>

          <button className="xmu-mobile-login-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? t.loginPending : t.login}
          </button>

          <div className="xmu-mobile-login-details">
            <a href="https://pass.xmu.edu.cn/">{t.forgetPassword}</a>
            <p className="xmu-mobile-login-tips">
              {t.mobileAlumniReset}
              {t.mobileFirstLogin}
            </p>
            <p className="xmu-mobile-login-warning">{t.mobileWarning}</p>
            {loginError ? (
              <p className="xmu-mobile-login-error" role="alert">
                {loginError}
              </p>
            ) : null}
            {notice ? <p className="xmu-mobile-login-notice">{notice}</p> : null}
          </div>
        </form>
      </section>
    </main>
  )
}
