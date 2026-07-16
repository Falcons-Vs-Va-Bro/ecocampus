import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { login } from '../../api/auth.api'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAuthStore } from '../../stores/auth.store'
import { DesktopLoginView, type LoginMode } from './DesktopLoginView'
import { loginCopy, type Locale } from './loginCopy'
import { MobileLoginView } from './MobileLoginView'
import { matchesMobileLoginLayout, useMobileLoginLayout } from './useMobileLoginLayout'
import './LoginPage.css'

const accountStorageKey = 'ecocampus.mock.login.accounts'
const desktopBackgroundCount = 3

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setSession = useAuthStore((state) => state.setSession)
  const isMobileLayout = useMobileLoginLayout()
  const [mode, setMode] = useState<LoginMode>('qr')
  const [locale, setLocale] = useState<Locale>(() =>
    matchesMobileLoginLayout() ? 'zh' : 'en',
  )
  const [backgroundIndex, setBackgroundIndex] = useState(0)
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const t = loginCopy[locale]

  useDocumentTitle('XMU Unified identity authentication platform')

  useEffect(() => {
    if (isMobileLayout) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setBackgroundIndex((current) => (current + 1) % desktopBackgroundCount)
    }, 5200)

    return () => window.clearInterval(timer)
  }, [isMobileLayout])

  function switchMode(nextMode: LoginMode) {
    setMode(nextMode)
    setNotice('')
    setLoginError('')
  }

  async function handleAccountLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const normalizedAccount = account.trim()
    const normalizedPassword = password.trim()

    if (!normalizedAccount.startsWith('2292024')) {
      setLoginError(t.accountPrefixError)
      setNotice('')
      return
    }

    if (!normalizedPassword) {
      setLoginError(t.passwordRequired)
      setNotice('')
      return
    }

    setIsSubmitting(true)
    let loggedInRole: 'USER' | 'ADMIN' = 'USER'
    let requiresCampusVerification = false

    try {
      if (import.meta.env.VITE_USE_MOCKS === 'true') {
        provisionMockAccount(normalizedAccount)
        requiresCampusVerification = true
        setSession({
          accessToken: `mock-${normalizedAccount}-${Date.now()}`,
          role: 'USER',
          verificationStatus: 'UNVERIFIED',
        })
      } else {
        const response = await login({ account: normalizedAccount, password: normalizedPassword })
        loggedInRole = response.data.user.role
        requiresCampusVerification = response.data.user.role === 'USER'
          && response.data.user.verificationStatus !== 'VERIFIED'
        setSession({
          accessToken: response.data.accessToken,
          role: response.data.user.role,
          verificationStatus: response.data.user.verificationStatus,
        })
      }

      setNotice(t.mockNotice)
      setLoginError('')
      const returnTo = searchParams.get('returnTo')
      navigate(requiresCampusVerification ? '/verify' : resolvePostLoginPath(loggedInRole, returnTo))
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : '登录失败')
      setNotice('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const sharedViewProps = {
    account,
    isSubmitting,
    locale,
    loginError,
    notice,
    onAccountChange: setAccount,
    onLocaleChange: setLocale,
    onPasswordChange: setPassword,
    onSubmit: handleAccountLogin,
    password,
    t,
  }

  if (isMobileLayout) {
    return <MobileLoginView {...sharedViewProps} />
  }

  return (
    <DesktopLoginView
      {...sharedViewProps}
      backgroundIndex={backgroundIndex}
      mode={mode}
      onBackgroundChange={setBackgroundIndex}
      onModeChange={switchMode}
    />
  )
}

function resolvePostLoginPath(role: 'USER' | 'ADMIN', returnTo: string | null) {
  const safeReturnTo = returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo : undefined

  if (role === 'ADMIN') {
    return safeReturnTo === '/admin' || safeReturnTo?.startsWith('/admin/') ? safeReturnTo : '/admin'
  }

  return safeReturnTo && safeReturnTo !== '/admin' && !safeReturnTo.startsWith('/admin/')
    ? safeReturnTo
    : '/'
}

function provisionMockAccount(account: string) {
  try {
    const storedValue = window.localStorage.getItem(accountStorageKey)
    const accounts = storedValue ? (JSON.parse(storedValue) as unknown) : []
    const accountList = Array.isArray(accounts)
      ? accounts.filter((item): item is string => typeof item === 'string')
      : []

    if (!accountList.includes(account)) {
      window.localStorage.setItem(accountStorageKey, JSON.stringify([...accountList, account]))
    }
  } catch {
    // localStorage is a convenience for mock auto-provisioning; login should still work without it.
  }
}
