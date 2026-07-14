import type { ApiResponse, PageResult } from '../../types/api'
import airpodsImage from '../../assets/favorites/items/airpods.webp'
import basketballImage from '../../assets/favorites/items/basketball.webp'
import calculatorImage from '../../assets/favorites/items/calculator.webp'
import deskLampImage from '../../assets/favorites/items/desk-lamp.webp'
import macbookAirImage from '../../assets/favorites/items/macbook-air.webp'
import mathBooksImage from '../../assets/favorites/items/math-books.webp'
import mechanicalKeyboardImage from '../../assets/favorites/items/mechanical-keyboard.webp'
import suitcaseImage from '../../assets/favorites/items/suitcase.webp'
import lampMainImage from '../../assets/item-detail/lamp-main.webp'
import lampThumb2Image from '../../assets/item-detail/lamp-thumb-2.webp'
import lampThumb3Image from '../../assets/item-detail/lamp-thumb-3.webp'
import lampThumb4Image from '../../assets/item-detail/lamp-thumb-4.webp'
import type { ItemDetail, ItemListParams, ItemSummary } from '../item.api'

const mockLatencyMs = 180

const mockItems: ItemSummary[] = [
  createItem(1001, '高等数学（第七版）上下册', '教材', 2800, mathBooksImage, '李同学', ['SELF_PICKUP'], 18, 1),
  createItem(1002, 'MacBook Air 2019 13 寸', '数码', 235000, macbookAirImage, '林同学', ['SELF_PICKUP'], 42, 2),
  createItem(1003, '护眼台灯 可调光', '宿舍用品', 4500, deskLampImage, '林同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 23, 3, {
    createdAt: '2026-07-06T14:20:00+08:00',
  }),
  createItem(1004, '斯伯丁篮球 室内外 7 号球', '运动户外', 6000, basketballImage, '陈同学', ['SELF_PICKUP'], 15, 4),
  createItem(1005, '机械键盘 青轴', '数码', 12000, mechanicalKeyboardImage, '张同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 27, 5),
  createItem(1006, '20 寸行李箱 九成新', '生活日用', 8000, suitcaseImage, '刘同学', ['SELF_PICKUP'], 16, 6),
  createItem(1007, 'AirPods 二代', '数码', 39900, airpodsImage, '周同学', ['DELIVER_TO_SCHOOL'], 31, 7),
  createItem(1008, '卡西欧计算器 fx-991CN X', '乐器文具', 8500, calculatorImage, '黄同学', ['SELF_PICKUP'], 12, 8),
  createItem(1009, '宿舍收纳箱 三件套', '宿舍用品', 3500, suitcaseImage, '许同学', ['DELIVER_TO_SCHOOL'], 7, 9),
  createItem(1010, '羽毛球拍双拍 轻量款', '运动户外', 6800, basketballImage, '郑同学', ['SELF_PICKUP'], 11, 10),
  createItem(1011, '考研英语真题 近五年', '教材', 1800, mathBooksImage, '何同学', ['SELF_PICKUP'], 5, 11),
  createItem(1012, '小米显示器 24 寸', '数码', 42000, macbookAirImage, '宋同学', ['SELF_PICKUP'], 22, 12),
  createItem(1013, '宿舍床边置物架', '宿舍用品', 2600, deskLampImage, '赵同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 6, 13),
  createItem(1014, '课程用科学计算器', '乐器文具', 7600, calculatorImage, '吴同学', ['DELIVER_TO_SCHOOL'], 8, 14),
  createItem(1015, '蓝牙键盘便携款', '数码', 9900, mechanicalKeyboardImage, '谢同学', ['SELF_PICKUP'], 19, 15),
  createItem(1016, '篮球训练包 九成新', '运动户外', 5200, basketballImage, '郭同学', ['SELF_PICKUP'], 10, 16),
]

export async function listMockItems(params?: ItemListParams): Promise<ApiResponse<PageResult<ItemSummary>>> {
  await delay(mockLatencyMs)

  const page = params?.page ?? 1
  const size = params?.size ?? 20
  const normalizedKeyword = params?.keyword?.trim().toLowerCase()

  const filteredItems = mockItems
    .filter((item) => item.status === 'ON_SALE')
    .filter((item) => (normalizedKeyword ? `${item.title} ${item.categoryName}`.toLowerCase().includes(normalizedKeyword) : true))
    .filter((item) => (params?.minPriceCent == null ? true : item.priceCent >= params.minPriceCent))
    .filter((item) => (params?.maxPriceCent == null ? true : item.priceCent <= params.maxPriceCent))
    .filter((item) => (params?.deliveryMode == null ? true : item.deliveryModes.includes(params.deliveryMode)))

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
    traceId: 'mock-items',
  }
}

export async function getMockItem(itemId: string | number): Promise<ApiResponse<ItemDetail>> {
  await delay(mockLatencyMs)

  const item = mockItems.find((mockItem) => mockItem.id === Number(itemId))

  if (!item) {
    throw new Error('mock item not found')
  }

  const detail = createDetail(item)

  return {
    code: 'OK',
    message: 'success',
    data: detail,
    traceId: 'mock-item-detail',
  }
}

function createItem(
  id: number,
  title: string,
  categoryName: string,
  priceCent: number,
  coverImageUrl: string,
  sellerNickname: string,
  deliveryModes: ItemSummary['deliveryModes'],
  favoriteCount: number,
  dayOffset: number,
  options?: { createdAt?: string },
): ItemSummary {
  return {
    id,
    title,
    categoryName,
    priceCent,
    status: 'ON_SALE',
    coverImageUrl,
    createdAt:
      options?.createdAt ??
      `2026-07-${String(Math.max(1, 3 - Math.floor(dayOffset / 6))).padStart(2, '0')}T${String(9 + (dayOffset % 10)).padStart(2, '0')}:20:00+08:00`,
    deliveryModes,
    seller: {
      id: 2000 + id,
      nickname: sellerNickname,
      verificationStatus: 'VERIFIED',
    },
    favorited: id % 3 === 0,
    favoriteCount,
  }
}

function createDetail(item: ItemSummary): ItemDetail {
  if (item.id === 1003) {
    return {
      ...item,
      description: '台灯亮度三档可调，适合宿舍书桌使用，灯头角度可旋转，功能正常。',
      categoryId: 3,
      imageUrls: [lampMainImage, lampThumb2Image, lampThumb3Image, lampThumb4Image],
    }
  }

  return {
    ...item,
    description: `${item.title}，校内同学闲置转让，成色良好，支持当面验货后确认。`,
    categoryId: getCategoryId(item.categoryName),
    imageUrls: item.coverImageUrl ? [item.coverImageUrl] : [],
  }
}

function getCategoryId(categoryName: string) {
  const categoryIds: Record<string, number> = {
    教材: 1,
    数码: 2,
    宿舍用品: 3,
    运动户外: 4,
    生活日用: 5,
    美妆个护: 6,
    乐器文具: 7,
    票务转让: 8,
    其他: 9,
  }

  return categoryIds[categoryName] ?? 9
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
