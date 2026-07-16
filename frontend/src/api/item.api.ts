import type { ApiResponse, DeliveryMode, ItemStatus, PageResult, VerificationStatus } from '../types/api'
import { apiClient } from './http'
import { getMockItem, listMockItems } from './mock/items.mock'

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

export interface OwnedItemDetail {
  id: number
  title: string
  description: string
  categoryId: number
  categoryName: string
  priceCent: number
  deliveryModes: DeliveryMode[]
  status: ItemStatus
  imageUrls: string[]
  createdAt: string
}

export interface MyItemSummary {
  id: number
  title: string
  categoryName: string
  priceCent: number
  status: ItemStatus
  coverImageUrl?: string
  createdAt: string
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
  if (useMocks) {
    return getMockItem(itemId)
  }

  const response = await apiClient.get<ApiResponse<ItemDetail>>(`/items/${itemId}`)
  return response.data
}

export async function createItem(payload: UpsertItemRequest) {
  const response = await apiClient.post<ApiResponse<OwnedItemDetail>>('/items', payload)
  return response.data
}

export async function updateItem(itemId: string | number, payload: UpsertItemRequest) {
  const response = await apiClient.put<ApiResponse<OwnedItemDetail>>(`/items/${itemId}`, payload)
  return response.data
}

export async function setItemOnSale(itemId: string | number) {
  const response = await apiClient.post<ApiResponse<OwnedItemDetail>>(`/items/${itemId}/on-sale`)
  return response.data
}

export async function setItemOffShelf(itemId: string | number) {
  const response = await apiClient.post<ApiResponse<OwnedItemDetail>>(`/items/${itemId}/off-shelf`)
  return response.data
}

export async function listMyItems(params?: { status?: ItemStatus; page?: number; size?: number }) {
  const response = await apiClient.get<ApiResponse<PageResult<MyItemSummary>>>('/users/me/items', { params })
  return response.data
}

export async function getMyItem(itemId: string | number) {
  const response = await apiClient.get<ApiResponse<OwnedItemDetail>>(`/users/me/items/${itemId}`)
  return response.data
}
