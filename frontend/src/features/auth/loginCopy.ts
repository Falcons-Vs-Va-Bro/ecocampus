export type Locale = 'en' | 'zh'

export interface LoginCopy {
  accountPrefixError: string
  accountTab: string
  alumniReset: string
  copyright: string
  firstLogin: string
  forgetPassword: string
  langPrimary: string
  langSecondary: string
  login: string
  loginPending: string
  mobileAccountTab: string
  mobileAlumniReset: string
  mobileFirstLogin: string
  mobileWarning: string
  mockNotice: string
  onlineGuider: string
  password: string
  passwordHide: string
  passwordRequired: string
  passwordShow: string
  qrTab: string
  qrTitle: string
  title: string
  username: string
  warning: string
}

export const loginCopy: Record<Locale, LoginCopy> = {
  en: {
    langPrimary: 'English',
    langSecondary: '中文',
    title: 'Unified identity',
    qrTab: 'Scan to login',
    accountTab: 'Account login',
    mobileAccountTab: 'Account login',
    qrTitle: 'Secure login by scanning qr code',
    warning:
      'It is strictly forbidden to transmit or process state secrets on this non-confidential Internet platform. Please confirm that the scanned and uploaded files and materials do not involve state secrets.',
    mobileWarning:
      'It is strictly forbidden to transmit or process state secrets on this non-confidential Internet platform. Please confirm that scanned, uploaded, or processed materials do not involve state secrets.',
    username: 'Please enter student ID/work ID',
    password: 'Please enter Password',
    passwordShow: 'Show password',
    passwordHide: 'Hide password',
    login: 'Login',
    loginPending: 'Logging in…',
    onlineGuider: 'Online Guider',
    forgetPassword: 'Forget password',
    alumniReset: 'Student and alumni account disabled can be reset through forget password.',
    mobileAlumniReset: 'Disabled student and alumni accounts can be reset through Forget password.',
    firstLogin: 'For first login, please click forget password to reset; for more, please click online help.',
    mobileFirstLogin:
      'For first login, please click Forget password to reset; for more, please view Online Help on the desktop site.',
    accountPrefixError: 'The account must start with 2292024.',
    passwordRequired: 'Please enter Password.',
    mockNotice: 'The account will be created automatically if it does not exist.',
    copyright: 'Copyright © Xiamen University',
  },
  zh: {
    langPrimary: '中文',
    langSecondary: 'English',
    title: '统一身份认证',
    qrTab: '扫码登录',
    accountTab: '账号登录',
    mobileAccountTab: '账号密码登录',
    qrTitle: '扫码安全登录',
    warning: '严禁在非涉密互联网平台传输、处理国家秘密，请确认扫码上传的文件资料不涉及国家秘密。',
    mobileWarning: '严禁在本互联网非涉密平台传输、处理国家秘密，请确认扫描上传、处理的文件资料不涉及国家秘密',
    username: '请输入学号/工号',
    password: '请输入密码',
    passwordShow: '显示密码',
    passwordHide: '隐藏密码',
    login: '登录',
    loginPending: '登录中…',
    onlineGuider: '在线帮助',
    forgetPassword: '忘记密码',
    alumniReset: '学生校友账号禁用可通过忘记密码进行重置',
    mobileAlumniReset: '学生校友账号禁用可通过忘记密码进行重置;',
    firstLogin: '首次登录请点击忘记密码进行重置;更多请点在线帮助',
    mobileFirstLogin: '首次登录请点击忘记密码进行重置;更多请查看网页版在线帮助',
    accountPrefixError: '账号前 7 位必须为 2292024。',
    passwordRequired: '请输入密码。',
    mockNotice: '账号不存在时会自动创建，已有账号将直接登录。',
    copyright: 'Copyright © 厦门大学',
  },
}
