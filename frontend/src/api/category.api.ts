import type { ApiResponse } from '../types/api'
import { apiClient } from './http'

export interface Category {
  id: number
  name: string
  sort: number
}

export async function listCategories() {
  const response = await apiClient.get<ApiResponse<Category[]>>('/categories')
  return response.data
}
