import type { ApiResponse, PageResult } from '../types/api'
import { apiClient } from './http'
import type { ItemSummary } from './item.api'

export async function favoriteItem(itemId: string | number) {
  const response = await apiClient.post<ApiResponse<void>>(`/items/${itemId}/favorite`)
  return response.data
}

export async function unfavoriteItem(itemId: string | number) {
  const response = await apiClient.delete<ApiResponse<void>>(`/items/${itemId}/favorite`)
  return response.data
}

export async function listMyFavorites(params?: { page?: number; size?: number }) {
  const response = await apiClient.get<ApiResponse<PageResult<ItemSummary>>>('/users/me/favorites', { params })
  return response.data
}
