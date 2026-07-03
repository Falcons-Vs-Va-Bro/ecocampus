export type UserRole = 'GUEST' | 'PENDING_USER' | 'USER' | 'ADMIN' | 'SYSTEM'

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'BLACKLISTED'

export type ItemStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ON_SALE'
  | 'OFF_SHELF'
  | 'REJECTED'
  | 'VIOLATION_REMOVED'
  | 'SOLD'
  | 'DELETED'

export type DeliveryMode = 'SELF_PICKUP' | 'DELIVER_TO_SCHOOL'

export type OrderStatus =
  | 'PENDING_COMMUNICATION'
  | 'WAITING_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED'

export type DemandStatus = 'OPEN' | 'MATCHED' | 'CLOSED'

export type ApiCode =
  | 'OK'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_FAILED'
  | 'BLACKLISTED'
  | 'INTERNAL_ERROR'

export interface ApiResponse<T = unknown> {
  code: ApiCode | string
  message: string
  data: T
  traceId: string
}

export interface PageResult<T> {
  items: T[]
  page: number
  size: number
  total: number
}

export interface CurrentUser {
  id: number
  nickname: string
  phone: string
  role: Extract<UserRole, 'USER' | 'ADMIN'>
  verificationStatus: VerificationStatus
  studentNoMasked?: string
}
