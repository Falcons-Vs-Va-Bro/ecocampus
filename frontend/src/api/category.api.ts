import type { ApiResponse } from '../types/api'
import { apiClient } from './http'
import { createMockCategory, deleteMockCategory, listMockCategories, updateMockCategory } from './mock/categories.mock'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export interface Category {
  id: number
  name: string
  sort: number
}

export interface CategoryRequest {
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

export async function listAdminCategories() {
  if (useMocks) return listMockCategories()
  const response = await apiClient.get<ApiResponse<Category[]>>('/admin/categories')
  return response.data
}

export async function createCategory(payload: CategoryRequest) {
  if (useMocks) return createMockCategory(payload)
  const response = await apiClient.post<ApiResponse<Category>>('/admin/categories', payload)
  return response.data
}

export async function updateCategory(categoryId: number, payload: CategoryRequest) {
  if (useMocks) return updateMockCategory(categoryId, payload)
  const response = await apiClient.put<ApiResponse<Category>>(`/admin/categories/${categoryId}`, payload)
  return response.data
}

export async function deleteCategory(categoryId: number) {
  if (useMocks) return deleteMockCategory(categoryId)
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/categories/${categoryId}`)
  return response.data
}
