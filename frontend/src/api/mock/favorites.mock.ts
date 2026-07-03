import type { ApiResponse, PageResult } from '../../types/api'
import type { FavoriteItemSummary, FavoriteListParams } from '../favorite.api'
import airpodsImage from '../../assets/favorites/items/airpods.jpg'
import basketballImage from '../../assets/favorites/items/basketball.jpg'
import calculatorImage from '../../assets/favorites/items/calculator.jpg'
import deskLampImage from '../../assets/favorites/items/desk-lamp.jpg'
import macbookAirImage from '../../assets/favorites/items/macbook-air.jpg'
import mathBooksImage from '../../assets/favorites/items/math-books.jpg'
import mechanicalKeyboardImage from '../../assets/favorites/items/mechanical-keyboard.jpg'
import suitcaseImage from '../../assets/favorites/items/suitcase.jpg'

const mockLatencyMs = 180

let favoriteItems: FavoriteItemSummary[] = [
  {
    id: 1001,
    title: '高等数学（第七版）上下册',
    categoryName: '教材',
    priceCent: 2800,
    status: 'ON_SALE',
    coverImageUrl: mathBooksImage,
    createdAt: '2026-07-01T09:20:00+08:00',
    deliveryModes: ['SELF_PICKUP'],
    seller: { id: 7, nickname: '李同学', verificationStatus: 'VERIFIED' },
    favorited: true,
    favoriteCount: 18,
    favoritedAt: '2026-07-03T08:20:00+08:00',
  },
  {
    id: 1002,
    title: 'MacBook Air 2019 13 寸',
    categoryName: '数码',
    priceCent: 235000,
    status: 'ON_SALE',
    coverImageUrl: macbookAirImage,
    createdAt: '2026-06-30T17:45:00+08:00',
    deliveryModes: ['SELF_PICKUP'],
    seller: { id: 8, nickname: '林同学', verificationStatus: 'VERIFIED' },
    favorited: true,
    favoriteCount: 42,
    favoritedAt: '2026-07-03T08:05:00+08:00',
  },
  {
    id: 1003,
    title: '护眼台灯 可调光',
    categoryName: '宿舍用品',
    priceCent: 4500,
    status: 'ON_SALE',
    coverImageUrl: deskLampImage,
    createdAt: '2026-06-30T12:10:00+08:00',
    deliveryModes: ['DELIVER_TO_SCHOOL'],
    seller: { id: 9, nickname: '王同学', verificationStatus: 'VERIFIED' },
    favorited: true,
    favoriteCount: 9,
    favoritedAt: '2026-07-02T22:14:00+08:00',
  },
  {
    id: 1004,
    title: '斯伯丁篮球 室内外 7 号球',
    categoryName: '运动户外',
    priceCent: 6000,
    status: 'ON_SALE',
    coverImageUrl: basketballImage,
    createdAt: '2026-06-29T21:32:00+08:00',
    deliveryModes: ['SELF_PICKUP'],
    seller: { id: 10, nickname: '陈同学', verificationStatus: 'VERIFIED' },
    favorited: true,
    favoriteCount: 15,
    favoritedAt: '2026-07-02T18:36:00+08:00',
  },
  {
    id: 1005,
    title: '机械键盘 青轴',
    categoryName: '数码',
    priceCent: 12000,
    status: 'ON_SALE',
    coverImageUrl: mechanicalKeyboardImage,
    createdAt: '2026-06-29T16:05:00+08:00',
    deliveryModes: ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'],
    seller: { id: 11, nickname: '张同学', verificationStatus: 'VERIFIED' },
    favorited: true,
    favoriteCount: 27,
    favoritedAt: '2026-07-02T12:01:00+08:00',
  },
  {
    id: 1006,
    title: '20 寸行李箱 九成新',
    categoryName: '生活日用',
    priceCent: 8000,
    status: 'ON_SALE',
    coverImageUrl: suitcaseImage,
    createdAt: '2026-06-28T19:40:00+08:00',
    deliveryModes: ['SELF_PICKUP'],
    seller: { id: 12, nickname: '刘同学', verificationStatus: 'VERIFIED' },
    favorited: true,
    favoriteCount: 16,
    favoritedAt: '2026-07-02T09:46:00+08:00',
  },
  {
    id: 1007,
    title: 'AirPods 二代',
    categoryName: '数码',
    priceCent: 39900,
    status: 'ON_SALE',
    coverImageUrl: airpodsImage,
    createdAt: '2026-06-28T13:16:00+08:00',
    deliveryModes: ['DELIVER_TO_SCHOOL'],
    seller: { id: 13, nickname: '周同学', verificationStatus: 'VERIFIED' },
    favorited: true,
    favoriteCount: 31,
    favoritedAt: '2026-07-01T20:11:00+08:00',
  },
  {
    id: 1008,
    title: '卡西欧计算器 fx-991CN X',
    categoryName: '乐器文具',
    priceCent: 8500,
    status: 'ON_SALE',
    coverImageUrl: calculatorImage,
    createdAt: '2026-06-27T18:22:00+08:00',
    deliveryModes: ['SELF_PICKUP'],
    seller: { id: 14, nickname: '黄同学', verificationStatus: 'VERIFIED' },
    favorited: true,
    favoriteCount: 12,
    favoritedAt: '2026-07-01T12:18:00+08:00',
  },
  {
    id: 1009,
    title: '宿舍收纳箱 三件套',
    categoryName: '宿舍用品',
    priceCent: 3500,
    status: 'ON_SALE',
    coverImageUrl: suitcaseImage,
    createdAt: '2026-06-26T11:08:00+08:00',
    deliveryModes: ['DELIVER_TO_SCHOOL'],
    seller: { id: 15, nickname: '许同学', verificationStatus: 'VERIFIED' },
    favorited: true,
    favoriteCount: 7,
    favoritedAt: '2026-06-30T22:18:00+08:00',
  },
  {
    id: 1010,
    title: '羽毛球拍双拍',
    categoryName: '运动户外',
    priceCent: 6800,
    status: 'ON_SALE',
    coverImageUrl: basketballImage,
    createdAt: '2026-06-25T15:27:00+08:00',
    deliveryModes: ['SELF_PICKUP'],
    seller: { id: 16, nickname: '郑同学', verificationStatus: 'VERIFIED' },
    favorited: true,
    favoriteCount: 11,
    favoritedAt: '2026-06-30T10:09:00+08:00',
  },
  {
    id: 1011,
    title: '考研英语真题',
    categoryName: '教材',
    priceCent: 1800,
    status: 'OFF_SHELF',
    coverImageUrl: mathBooksImage,
    createdAt: '2026-06-24T10:00:00+08:00',
    deliveryModes: ['SELF_PICKUP'],
    seller: { id: 17, nickname: '何同学', verificationStatus: 'VERIFIED' },
    favorited: true,
    favoriteCount: 5,
    favoritedAt: '2026-06-29T16:33:00+08:00',
    invalidReason: '卖家已下架',
  },
  {
    id: 1012,
    title: '小米显示器 24 寸',
    categoryName: '数码',
    priceCent: 42000,
    status: 'SOLD',
    coverImageUrl: macbookAirImage,
    createdAt: '2026-06-23T14:51:00+08:00',
    deliveryModes: ['SELF_PICKUP'],
    seller: { id: 18, nickname: '宋同学', verificationStatus: 'VERIFIED' },
    favorited: true,
    favoriteCount: 22,
    favoritedAt: '2026-06-28T20:00:00+08:00',
    invalidReason: '商品已售出',
  },
]

export async function listMockFavorites(params?: FavoriteListParams): Promise<ApiResponse<PageResult<FavoriteItemSummary>>> {
  await delay(mockLatencyMs)

  const page = params?.page ?? 1
  const size = params?.size ?? 20
  const start = (page - 1) * size

  return mockResponse({
    items: favoriteItems.slice(start, start + size),
    page,
    size,
    total: favoriteItems.length,
  })
}

export async function favoriteMockItem(itemId: string | number): Promise<ApiResponse<void>> {
  await delay(mockLatencyMs)
  favoriteItems = favoriteItems.map((item) =>
    item.id === Number(itemId) ? { ...item, favorited: true } : item,
  )
  return mockResponse(undefined)
}

export async function unfavoriteMockItem(itemId: string | number): Promise<ApiResponse<void>> {
  await delay(mockLatencyMs)
  favoriteItems = favoriteItems.filter((item) => item.id !== Number(itemId))
  return mockResponse(undefined)
}

function mockResponse<T>(data: T): ApiResponse<T> {
  return {
    code: 'OK',
    message: 'success',
    data,
    traceId: `mock-${Date.now()}`,
  }
}

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
