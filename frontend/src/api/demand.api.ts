import type { ApiResponse, DemandStatus, PageResult } from '../types/api'
import { apiClient } from './http'

export interface DemandSummary {
  id: number
  title: string
  description: string
  categoryId: number
  categoryName: string
  budgetMinCent?: number
  budgetMaxCent?: number
  status: DemandStatus
  keywords: string[]
  createdAt: string
}

export interface UpsertDemandRequest {
  title: string
  description: string
  categoryId: number
  budgetMinCent?: number
  budgetMaxCent?: number
  keywords: string[]
}

export interface DemandMatch {
  itemId: number
  title: string
  priceCent: number
  matchReason: string
}

export async function createDemand(payload: UpsertDemandRequest) {
  const response = await apiClient.post<ApiResponse<DemandSummary>>('/demands', payload)
  return response.data
}

export async function listDemands(params?: { categoryId?: number; keyword?: string; page?: number; size?: number }) {
  const response = await apiClient.get<ApiResponse<PageResult<DemandSummary>>>('/demands', { params })
  return response.data
}

export async function listMyDemands(params?: { page?: number; size?: number }) {
  const response = await apiClient.get<ApiResponse<PageResult<DemandSummary>>>('/users/me/demands', { params })
  return response.data
}

export async function closeDemand(demandId: string | number) {
  const response = await apiClient.post<ApiResponse<void>>(`/demands/${demandId}/close`)
  return response.data
}

export async function listDemandMatches(demandId: string | number) {
  const response = await apiClient.get<ApiResponse<DemandMatch[]>>(`/demands/${demandId}/matches`)
  return response.data
}
