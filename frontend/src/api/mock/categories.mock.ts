import type { ApiResponse } from '../../types/api'
import type { Category, CategoryRequest } from '../category.api'

let mockCategories: Category[] = [
  { id: 1, name: '教材', sort: 10, enabled: true, itemCount: 18 },
  { id: 2, name: '数码', sort: 20, enabled: true, itemCount: 16 },
  { id: 3, name: '宿舍用品', sort: 30, enabled: true, itemCount: 14 },
  { id: 4, name: '运动户外', sort: 40, enabled: true, itemCount: 12 },
  { id: 5, name: '生活日用', sort: 50, enabled: true, itemCount: 10 },
  { id: 6, name: '美妆个护', sort: 60, enabled: true, itemCount: 8 },
  { id: 7, name: '乐器文具', sort: 70, enabled: true, itemCount: 7 },
  { id: 8, name: '票务转让', sort: 80, enabled: true, itemCount: 6 },
  { id: 9, name: '其他', sort: 90, enabled: true, itemCount: 5 },
]

export async function listMockCategories(): Promise<ApiResponse<Category[]>> {
  await delay(120)

  return {
    code: 'OK',
    message: 'success',
    data: mockCategories,
    traceId: 'mock-categories',
  }
}

export async function createMockCategory(payload: CategoryRequest): Promise<ApiResponse<Category>> {
  await delay(120)
  const category: Category = { id: Math.max(0, ...mockCategories.map((item) => item.id)) + 1, ...payload, enabled: payload.enabled ?? true, itemCount: 0 }
  mockCategories = [...mockCategories, category]
  return { code: 'OK', message: 'success', data: category, traceId: 'mock-create-category' }
}

export async function updateMockCategory(categoryId: number, payload: CategoryRequest): Promise<ApiResponse<Category>> {
  await delay(120)
  const current = mockCategories.find((item) => item.id === categoryId)
  const category: Category = { id: categoryId, itemCount: current?.itemCount ?? 0, enabled: payload.enabled ?? current?.enabled ?? true, ...payload }
  mockCategories = mockCategories.map((item) => item.id === categoryId ? category : item)
  return { code: 'OK', message: 'success', data: category, traceId: 'mock-update-category' }
}

export async function deleteMockCategory(categoryId: number): Promise<ApiResponse<void>> {
  await delay(120)
  mockCategories = mockCategories.filter((item) => item.id !== categoryId)
  return { code: 'OK', message: 'success', data: undefined as void, traceId: 'mock-delete-category' }
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
