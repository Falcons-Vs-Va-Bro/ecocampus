import type { ApiResponse, ItemStatus, PageResult, VerificationStatus } from '../types/api'
import { apiClient } from './http'
import type { ItemSummary } from './item.api'
import { listMockAdminItems, listMockReviewItems, mockViolationRemoveItem, reviewMockItem } from './mock/admin.mock'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export interface DashboardOverview {
  itemPublishCount: number
  orderCompletedCount: number
  pendingReviewCount: number
  activeUserCount: number
  categoryStats: Array<{
    categoryName: string
    itemCount: number
    completedOrderCount: number
  }>
}

export interface DashboardSummary {
  overview: DashboardOverview
  dealTrends: Array<{
    date: string
    label: string
    currentWeekCount: number
    previousWeekCount: number
  }>
  recentPendingItems: Array<{
    id: number
    title: string
    sellerNickname: string
    categoryName: string
    submittedAt: string
    coverImageUrl?: string
  }>
  reminders: Array<{
    key: string
    label: string
    count: number
    severity: 'normal' | 'warning' | 'danger' | string
  }>
}

export interface AdminUserSummary {
  id: number
  nickname: string
  phoneMasked: string
  studentNoMasked?: string
  role: 'USER' | 'ADMIN'
  verificationStatus: VerificationStatus
  blacklisted: boolean
}

export interface ReviewItemRequest {
  approved: boolean
  reason: string
}

export interface AdminReviewItemSummary extends ItemSummary {
  description?: string
  imageCount?: number
  reviewFlags?: string[]
  reviewReason?: string
  sellerViolationCount?: number
  studentNoMasked?: string
  submittedAt?: string
}

export interface ViolationRemoveRequest {
  reason: string
}

export async function getDashboardOverview() {
  const response = await apiClient.get<ApiResponse<DashboardOverview>>('/admin/dashboard/overview')
  return response.data
}

export async function getDashboardSummary() {
  const response = await apiClient.get<ApiResponse<DashboardSummary>>('/admin/dashboard/summary')
  return response.data
}

export async function listReviewItems(params?: { status?: Extract<ItemStatus, 'PENDING_REVIEW'>; page?: number; size?: number }) {
  if (useMocks) {
    return listMockReviewItems(params)
  }

  const response = await apiClient.get<ApiResponse<PageResult<AdminReviewItemSummary>>>('/admin/items/review', { params })
  return response.data
}

export async function reviewItem(itemId: string | number, payload: ReviewItemRequest) {
  if (useMocks) {
    return reviewMockItem(itemId, payload)
  }

  const response = await apiClient.post<ApiResponse<void>>(`/admin/items/${itemId}/review`, payload)
  return response.data
}

export async function listAdminItems(params?: {
  status?: ItemStatus
  keyword?: string
  categoryId?: number
  page?: number
  size?: number
}) {
  if (useMocks) {
    return listMockAdminItems(params)
  }

  const response = await apiClient.get<ApiResponse<PageResult<ItemSummary>>>('/admin/items', { params })
  return response.data
}

export async function violationRemoveItem(itemId: string | number, payload: ViolationRemoveRequest) {
  if (useMocks) {
    return mockViolationRemoveItem(itemId)
  }

  const response = await apiClient.post<ApiResponse<void>>(`/admin/items/${itemId}/violation-remove`, payload)
  return response.data
}

export async function listAdminUsers(params?: {
  keyword?: string
  verificationStatus?: VerificationStatus
  page?: number
  size?: number
}) {
  const response = await apiClient.get<ApiResponse<PageResult<AdminUserSummary>>>('/admin/users', { params })
  return response.data
}

export async function blacklistUser(userId: string | number) {
  const response = await apiClient.post<ApiResponse<void>>(`/admin/users/${userId}/blacklist`)
  return response.data
}

export async function removeUserFromBlacklist(userId: string | number) {
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/users/${userId}/blacklist`)
  return response.data
}
