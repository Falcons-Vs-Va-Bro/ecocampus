import type { ApiResponse, ItemStatus, PageResult, VerificationStatus } from '../../types/api'
import airpodsImage from '../../assets/favorites/items/airpods.webp'
import calculatorImage from '../../assets/favorites/items/calculator.webp'
import deskLampImage from '../../assets/favorites/items/desk-lamp.webp'
import macbookAirImage from '../../assets/favorites/items/macbook-air.webp'
import mathBooksImage from '../../assets/favorites/items/math-books.webp'
import suitcaseImage from '../../assets/favorites/items/suitcase.webp'
import type { AdminItemSummary, AdminReviewItemSummary, AdminUserSummary, ReviewItemRequest } from '../admin.api'

interface MockAdminItemsParams {
  status?: ItemStatus
  keyword?: string
  categoryId?: number
  page?: number
  size?: number
}

const mockLatencyMs = 180

let mockAdminUsers: AdminUserSummary[] = [
  { id: 1, nickname: '海风吹过嘉庚楼', phoneMasked: '138****6721', studentNoMasked: '2023****5123', role: 'USER', verificationStatus: 'VERIFIED', blacklisted: false },
  { id: 2, nickname: '嘉园旧书摊', phoneMasked: '159****3208', studentNoMasked: '2022****1048', role: 'USER', verificationStatus: 'VERIFIED', blacklisted: false },
  { id: 3, nickname: '临时票务号', phoneMasked: '186****0912', studentNoMasked: '未核验', role: 'USER', verificationStatus: 'PENDING_REVIEW', blacklisted: false },
  { id: 4, nickname: '重复发布用户', phoneMasked: '177****5601', studentNoMasked: '2021****2256', role: 'USER', verificationStatus: 'VERIFIED', blacklisted: true },
  { id: 5, nickname: '旧机回收号', phoneMasked: '136****8820', studentNoMasked: '2020****7819', role: 'USER', verificationStatus: 'VERIFIED', blacklisted: true },
  { id: 6, nickname: '芙蓉湖畔', phoneMasked: '133****1818', studentNoMasked: '2024****6310', role: 'USER', verificationStatus: 'VERIFIED', blacklisted: false },
]

export async function listMockAdminUsers(params?: { keyword?: string; verificationStatus?: VerificationStatus; page?: number; size?: number }): Promise<ApiResponse<PageResult<AdminUserSummary>>> {
  await delay(mockLatencyMs)
  const page = params?.page ?? 1; const size = params?.size ?? 20; const keyword = params?.keyword?.trim().toLowerCase()
  const filtered = mockAdminUsers.filter((user) => !params?.verificationStatus || user.verificationStatus === params.verificationStatus).filter((user) => !keyword || `${user.nickname} ${user.phoneMasked} ${user.studentNoMasked}`.toLowerCase().includes(keyword))
  return { code: 'OK', message: 'success', data: { items: filtered.slice((page - 1) * size, page * size), page, size, total: filtered.length }, traceId: 'mock-admin-users' }
}

export async function mockBlacklistUser(userId: string | number): Promise<ApiResponse<void>> {
  await delay(mockLatencyMs); mockAdminUsers = mockAdminUsers.map((user) => user.id === Number(userId) ? { ...user, blacklisted: true } : user)
  return { code: 'OK', message: 'success', data: undefined as void, traceId: 'mock-blacklist-user' }
}

export async function mockRemoveUserFromBlacklist(userId: string | number): Promise<ApiResponse<void>> {
  await delay(mockLatencyMs); mockAdminUsers = mockAdminUsers.map((user) => user.id === Number(userId) ? { ...user, blacklisted: false } : user)
  return { code: 'OK', message: 'success', data: undefined as void, traceId: 'mock-remove-blacklist-user' }
}

const categoryIdsByName = new Map([
  ['教材', 1],
  ['数码', 2],
  ['宿舍用品', 3],
  ['运动户外', 4],
  ['生活日用', 5],
  ['美妆个护', 6],
  ['乐器文具', 7],
  ['票务转让', 8],
  ['其他', 9],
])

const mockAdminItems: AdminItemSummary[] = [
  createAdminItem(1002, 'MacBook Air 2019 13 寸', '数码', 268000, macbookAirImage, '林同学', 'ON_SALE', 1),
  createAdminItem(1007, 'AirPods 二代', '数码', 32000, airpodsImage, '周同学', 'ON_SALE', 2),
  createAdminItem(1017, '演唱会门票转让', '票务转让', 58000, calculatorImage, '黄同学', 'PENDING_REVIEW', 3),
  createAdminItem(1003, '护眼台灯 可调光', '宿舍用品', 4500, deskLampImage, '许同学', 'ON_SALE', 4),
  createAdminItem(1018, '蓝牙音箱 便携款', '数码', 7600, airpodsImage, '陈同学', 'ON_SALE', 5),
  createAdminItem(1011, '考研英语真题 近五年', '教材', 1800, mathBooksImage, '何同学', 'OFF_SHELF', 6),
  createAdminItem(1006, '20 寸行李箱 九成新', '生活日用', 8000, suitcaseImage, '刘同学', 'SOLD', 7),
  createAdminItem(1019, '疑似批量耳机转售', '数码', 19900, airpodsImage, '匿名用户', 'VIOLATION_REMOVED', 8),
]

let mockReviewItems: AdminReviewItemSummary[] = [
  createReviewItem({
    id: 9001,
    title: 'MacBook Air 2019 13 寸',
    categoryName: '数码电子',
    priceCent: 268000,
    coverImageUrl: macbookAirImage,
    sellerNickname: '林同学',
    studentNoMasked: '2023****5123',
    createdAt: '2026-07-09T10:24:00+08:00',
    description: '电池健康 86%，配原装充电器，可在嘉庚二楼自提。',
    reviewFlags: ['图片清晰', '价格偏高', '有序列号'],
    sellerViolationCount: 0,
  }),
  createReviewItem({
    id: 9002,
    title: '高等数学（第七版）上下册',
    categoryName: '教材教辅',
    priceCent: 2800,
    coverImageUrl: mathBooksImage,
    sellerNickname: '陈同学',
    studentNoMasked: '2022****1048',
    createdAt: '2026-07-09T09:58:00+08:00',
    description: '少量笔记，适合期末复习使用。',
    reviewFlags: ['描述完整', '图片清晰'],
    sellerViolationCount: 0,
  }),
  createReviewItem({
    id: 9003,
    title: '宿舍台灯 可调光',
    categoryName: '宿舍用品',
    priceCent: 4500,
    coverImageUrl: deskLampImage,
    sellerNickname: '许同学',
    studentNoMasked: '2024****0831',
    createdAt: '2026-07-09T09:31:00+08:00',
    description: '三挡亮度，外观九成新。',
    reviewFlags: ['图片清晰', '描述偏短'],
    sellerViolationCount: 0,
  }),
  createReviewItem({
    id: 9004,
    title: '机械键盘 青轴 87 键',
    categoryName: '数码电子',
    priceCent: 12000,
    coverImageUrl: calculatorImage,
    sellerNickname: '张同学',
    studentNoMasked: '2021****3290',
    createdAt: '2026-07-08T18:18:00+08:00',
    description: '键帽完整，空格键略有使用痕迹，支持宿舍楼下自提。',
    reviewFlags: ['描述完整', '图片清晰'],
    sellerViolationCount: 1,
  }),
  createReviewItem({
    id: 9005,
    title: '20 寸行李箱 九成新',
    categoryName: '生活日用',
    priceCent: 8000,
    coverImageUrl: suitcaseImage,
    sellerNickname: '刘同学',
    studentNoMasked: '2020****7742',
    createdAt: '2026-07-08T16:42:00+08:00',
    description: '轮子顺滑，拉杆正常，毕业搬宿舍用过两次。',
    reviewFlags: ['图片清晰', '描述完整'],
    sellerViolationCount: 0,
  }),
]

export async function listMockAdminItems(params?: MockAdminItemsParams): Promise<ApiResponse<PageResult<AdminItemSummary>>> {
  await delay(mockLatencyMs)

  const page = params?.page ?? 1
  const size = params?.size ?? 20
  const normalizedKeyword = params?.keyword?.trim().toLowerCase()

  const filteredItems = mockAdminItems
    .filter((item) => (params?.status ? item.status === params.status : true))
    .filter((item) => {
      if (params?.categoryId == null) {
        return true
      }

      return categoryIdsByName.get(item.categoryName) === params.categoryId
    })
    .filter((item) => {
      if (!normalizedKeyword) {
        return true
      }

      return `${item.title} ${item.categoryName} ${item.sellerNickname}`.toLowerCase().includes(normalizedKeyword)
    })

  const start = (page - 1) * size

  return {
    code: 'OK',
    message: 'success',
    data: {
      items: filteredItems.slice(start, start + size),
      page,
      size,
      total: filteredItems.length,
    },
    traceId: 'mock-admin-items',
  }
}

export async function listMockReviewItems(params?: {
  status?: 'PENDING_REVIEW'
  page?: number
  size?: number
}): Promise<ApiResponse<PageResult<AdminReviewItemSummary>>> {
  await delay(mockLatencyMs)

  const page = params?.page ?? 1
  const size = params?.size ?? 20
  const filteredItems = mockReviewItems.filter((item) => item.status === (params?.status ?? 'PENDING_REVIEW'))
  const start = (page - 1) * size

  return {
    code: 'OK',
    message: 'success',
    data: {
      items: filteredItems.slice(start, start + size),
      page,
      size,
      total: filteredItems.length,
    },
    traceId: 'mock-admin-review-items',
  }
}

export async function reviewMockItem(itemId: string | number, payload: ReviewItemRequest): Promise<ApiResponse<AdminItemSummary>> {
  await delay(mockLatencyMs)

  mockReviewItems = mockReviewItems.map((item) =>
    item.id === Number(itemId)
      ? {
          ...item,
          status: payload.approved ? 'ON_SALE' : 'REJECTED',
          reviewReason: payload.reason,
        }
      : item,
  )

  const reviewedItem = mockReviewItems.find((item) => item.id === Number(itemId))

  return {
    code: 'OK',
    message: 'success',
    data: reviewedItem ?? createMissingAdminItem(itemId),
    traceId: 'mock-admin-review-item',
  }
}

export async function mockViolationRemoveItem(itemId: string | number): Promise<ApiResponse<AdminItemSummary>> {
  await delay(mockLatencyMs)

  const targetItem = mockAdminItems.find((item) => item.id === Number(itemId))

  if (targetItem) {
    targetItem.status = 'VIOLATION_REMOVED'
  }

  return {
    code: 'OK',
    message: 'success',
    data: targetItem ?? createMissingAdminItem(itemId),
    traceId: 'mock-admin-violation-remove',
  }
}

function createAdminItem(
  id: number,
  title: string,
  categoryName: string,
  priceCent: number,
  coverImageUrl: string,
  sellerNickname: string,
  status: ItemStatus,
  dayOffset: number,
): AdminItemSummary {
  return {
    id,
    title,
    description: '演示商品信息完整，等待后台治理。',
    categoryName,
    priceCent,
    status,
    coverImageUrl,
    createdAt: `2026-07-${String(Math.max(1, 9 - dayOffset)).padStart(2, '0')}T${String(8 + dayOffset).padStart(2, '0')}:20:00+08:00`,
    sellerId: 3000 + id,
    sellerNickname,
    imageCount: 1,
  }
}

function createMissingAdminItem(itemId: string | number): AdminItemSummary {
  return {
    id: Number(itemId),
    title: '商品不存在',
    description: '商品记录不存在。',
    sellerId: 0,
    sellerNickname: '未知用户',
    categoryName: '其他',
    priceCent: 0,
    status: 'DELETED',
    imageCount: 0,
    createdAt: new Date(0).toISOString(),
  }
}

function createReviewItem(item: {
  id: number
  title: string
  categoryName: string
  priceCent: number
  coverImageUrl: string
  sellerNickname: string
  studentNoMasked: string
  createdAt: string
  description: string
  reviewFlags: string[]
  sellerViolationCount: number
}): AdminReviewItemSummary {
  return {
    id: item.id,
    title: item.title,
    categoryName: item.categoryName,
    priceCent: item.priceCent,
    status: 'PENDING_REVIEW',
    coverImageUrl: item.coverImageUrl,
    createdAt: item.createdAt,
    submittedAt: item.createdAt,
    sellerId: 7000 + item.id,
    sellerNickname: item.sellerNickname,
    studentNoMasked: item.studentNoMasked,
    description: item.description,
    imageCount: 3,
    reviewFlags: item.reviewFlags,
    sellerViolationCount: item.sellerViolationCount,
  }
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
