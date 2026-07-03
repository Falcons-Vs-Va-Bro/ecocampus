export type RouteGuardKind = 'public' | 'auth' | 'verified' | 'owner' | 'admin' | 'interaction'

export type RouteModule = 'public' | 'user' | 'admin'

export interface RouteMeta {
  path: string
  title: string
  permission: string
  description: string
  guard: RouteGuardKind
  module: RouteModule
  endpoints: string[]
}
