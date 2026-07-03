import type { ApiResponse } from '../../types/api'
import type { Category } from '../category.api'

const mockCategories: Category[] = [
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

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
