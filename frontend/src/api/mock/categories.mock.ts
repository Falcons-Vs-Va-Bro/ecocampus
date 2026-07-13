import type { ApiResponse } from '../../types/api'
import type { Category } from '../category.api'

let mockCategories: Category[] = [
  { id: 1, name: '教材', sort: 10 },
  { id: 2, name: '数码', sort: 20 },
  { id: 3, name: '宿舍用品', sort: 30 },
  { id: 4, name: '运动户外', sort: 40 },
  { id: 5, name: '生活日用', sort: 50 },
  { id: 6, name: '美妆个护', sort: 60 },
  { id: 7, name: '乐器文具', sort: 70 },
  { id: 8, name: '票务转让', sort: 80 },
  { id: 9, name: '其他', sort: 90 },
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

export async function createMockCategory(payload: Omit<Category, 'id'>): Promise<ApiResponse<Category>> {
  await delay(120)
  const category = { id: Math.max(0, ...mockCategories.map((item) => item.id)) + 1, ...payload }
  mockCategories = [...mockCategories, category]
  return { code: 'OK', message: 'success', data: category, traceId: 'mock-create-category' }
}

export async function updateMockCategory(categoryId: number, payload: Omit<Category, 'id'>): Promise<ApiResponse<Category>> {
  await delay(120)
  const category = { id: categoryId, ...payload }
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
