import type { ApiResponse, PageResult } from '../types/api'
import { apiClient } from './http'
import type { ItemSummary } from './item.api'
import { favoriteMockItem, listMockFavorites, unfavoriteMockItem } from './mock/favorites.mock'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export interface FavoriteItemSummary extends ItemSummary {
  favoritedAt: string
  invalidReason?: string
}

export interface FavoriteListParams {
  page?: number
  size?: number
}

export async function favoriteItem(itemId: string | number) {
  if (useMocks) {
    return favoriteMockItem(itemId)
  }

  const response = await apiClient.post<ApiResponse<void>>(`/items/${itemId}/favorite`)
  return response.data
}

export async function unfavoriteItem(itemId: string | number) {
  if (useMocks) {
    return unfavoriteMockItem(itemId)
  }

  const response = await apiClient.delete<ApiResponse<void>>(`/items/${itemId}/favorite`)
  return response.data
}

export async function listMyFavorites(params?: FavoriteListParams) {
  if (useMocks) {
    return listMockFavorites(params)
  }

  const response = await apiClient.get<ApiResponse<PageResult<FavoriteItemSummary>>>('/users/me/favorites', { params })
  return response.data
}
