import { Alert } from 'antd'
import type { PropsWithChildren } from 'react'
import type { RouteMeta } from '../../types/routes'

interface RouteGuardProps extends PropsWithChildren {
  meta: RouteMeta
  showNotice?: boolean
}

const guardMessages = {
  public: '公开页面，无需登录。',
  auth: '需要登录后访问；骨架阶段仅显示提示，不拦截占位页。',
  verified: '需要通过校园核验的 USER；骨架阶段仅显示提示，不拦截占位页。',
  owner: '需要资源所有者权限；后续由后端资源归属校验兜底。',
  admin: '需要 ADMIN 权限；骨架阶段仅显示提示，不拦截占位页。',
  interaction: '浏览公开，收藏、私信、下单等互动动作需要登录。',
}

export function RouteGuard({ children, meta, showNotice = true }: RouteGuardProps) {
  return (
    <div className="space-y-4">
      {showNotice && meta.guard !== 'public' ? (
        <Alert
          showIcon
          type={meta.guard === 'admin' ? 'warning' : 'info'}
          title="权限守卫占位"
          description={guardMessages[meta.guard]}
        />
      ) : null}
      {children}
    </div>
  )
}
