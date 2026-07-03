import type { ApiResponse } from '../types/api'
import { apiClient } from './http'
import { listMockCategories } from './mock/categories.mock'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export interface Category {
  id: number
  name: string
  sort: number
}

export async function listCategories() {
  if (useMocks) {
    return listMockCategories()
  }

  const response = await apiClient.get<ApiResponse<Category[]>>('/categories')
  return response.data
}
