import type { ApiResponse, DeliveryMode, ItemStatus, PageResult, VerificationStatus } from '../types/api'
import { apiClient } from './http'
import { listMockItems } from './mock/items.mock'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export interface ItemSellerSummary {
  id: number
  nickname: string
  verificationStatus: VerificationStatus
}

export interface ItemSummary {
  id: number
  title: string
  categoryName: string
  priceCent: number
  status: ItemStatus
  coverImageUrl?: string
  createdAt: string
  deliveryModes: DeliveryMode[]
  seller: ItemSellerSummary
  favorited: boolean
  favoriteCount: number
}

export interface ItemDetail extends ItemSummary {
  description: string
  categoryId: number
  imageUrls: string[]
}

export interface ItemListParams {
  keyword?: string
  categoryId?: number
  minPriceCent?: number
  maxPriceCent?: number
  deliveryMode?: DeliveryMode
  page?: number
  size?: number
}

export interface UpsertItemRequest {
  title: string
  description: string
  categoryId: number
  priceCent: number
  deliveryModes: DeliveryMode[]
  imageUrls: string[]
}

export async function listItems(params?: ItemListParams) {
  if (useMocks) {
    return listMockItems(params)
  }

  const response = await apiClient.get<ApiResponse<PageResult<ItemSummary>>>('/items', { params })
  return response.data
}

export async function getItem(itemId: string | number) {
  const response = await apiClient.get<ApiResponse<ItemDetail>>(`/items/${itemId}`)
  return response.data
}

export async function createItem(payload: UpsertItemRequest) {
  const response = await apiClient.post<ApiResponse<ItemDetail>>('/items', payload)
  return response.data
}

export async function updateItem(itemId: string | number, payload: UpsertItemRequest) {
  const response = await apiClient.put<ApiResponse<ItemDetail>>(`/items/${itemId}`, payload)
  return response.data
}

export async function setItemOnSale(itemId: string | number) {
  const response = await apiClient.post<ApiResponse<void>>(`/items/${itemId}/on-sale`)
  return response.data
}

export async function setItemOffShelf(itemId: string | number) {
  const response = await apiClient.post<ApiResponse<void>>(`/items/${itemId}/off-shelf`)
  return response.data
}
