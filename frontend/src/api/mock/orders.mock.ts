import type { ApiResponse, PageResult } from '../../types/api'
import type {
  CreateOrderRequest,
  OrderListParams,
  OrderSummary,
  UpdateOrderStatusRequest,
} from '../order.api'
import airpodsImage from '../../assets/favorites/items/airpods.webp'
import basketballImage from '../../assets/favorites/items/basketball.webp'
import calculatorImage from '../../assets/favorites/items/calculator.webp'
import deskLampImage from '../../assets/favorites/items/desk-lamp.webp'
import macbookImage from '../../assets/favorites/items/macbook-air.webp'
import mathBooksImage from '../../assets/favorites/items/math-books.webp'
import mechanicalKeyboardImage from '../../assets/favorites/items/mechanical-keyboard.webp'
import suitcaseImage from '../../assets/favorites/items/suitcase.webp'

const mockLatencyMs = 180
const currentUserId = 101

export interface MockOrderMeta {
  appointmentText?: string
  buyerName: string
  cancelReason?: string
  categoryName: string
  coverImageUrl: string
  pickupSpot: string
  priceCent: number
  sellerName: string
  latestMessage?: string
  timelineText: string
}

let mockOrders: OrderSummary[] = [
  {
    id: 6101,
    itemId: 1003,
    itemTitle: '护眼台灯 可调光',
    buyerId: currentUserId,
    sellerId: 9,
    deliveryMode: 'SELF_PICKUP',
    status: 'WAITING_PICKUP',
    remark: '约在芙蓉园门口自提',
    createdAt: '2026-07-09T09:15:00+08:00',
  },
  {
    id: 6102,
    itemId: 1001,
    itemTitle: '高等数学（第七版）上下册',
    buyerId: currentUserId,
    sellerId: 7,
    deliveryMode: 'SELF_PICKUP',
    status: 'PENDING_COMMUNICATION',
    remark: '确认教材版本和取货时间',
    createdAt: '2026-07-08T20:40:00+08:00',
  },
  {
    id: 6103,
    itemId: 1005,
    itemTitle: '机械键盘 青轴',
    buyerId: currentUserId,
    sellerId: 11,
    deliveryMode: 'DELIVER_TO_SCHOOL',
    status: 'PENDING_COMMUNICATION',
    remark: '等待卖家回复',
    createdAt: '2026-07-08T13:18:00+08:00',
  },
  {
    id: 6104,
    itemId: 1006,
    itemTitle: '20 寸行李箱 九成新',
    buyerId: currentUserId,
    sellerId: 12,
    deliveryMode: 'SELF_PICKUP',
    status: 'COMPLETED',
    remark: '完成于 2026-07-06',
    createdAt: '2026-07-06T18:30:00+08:00',
  },
  {
    id: 6105,
    itemId: 1007,
    itemTitle: 'AirPods 二代',
    buyerId: currentUserId,
    sellerId: 13,
    deliveryMode: 'DELIVER_TO_SCHOOL',
    status: 'CANCELLED',
    remark: '买家已取消',
    createdAt: '2026-07-05T22:12:00+08:00',
  },
  {
    id: 6106,
    itemId: 1004,
    itemTitle: '斯伯丁篮球 室内外 7 号球',
    buyerId: currentUserId,
    sellerId: 10,
    deliveryMode: 'SELF_PICKUP',
    status: 'WAITING_PICKUP',
    remark: '取货：思明南路校门',
    createdAt: '2026-07-04T16:55:00+08:00',
  },
  {
    id: 6201,
    itemId: 2001,
    itemTitle: '卡西欧计算器 fx-991CN X',
    buyerId: 22,
    sellerId: currentUserId,
    deliveryMode: 'SELF_PICKUP',
    status: 'PENDING_COMMUNICATION',
    remark: '买家想今晚看实物',
    createdAt: '2026-07-09T10:05:00+08:00',
  },
  {
    id: 6202,
    itemId: 2002,
    itemTitle: '宿舍收纳箱 三件套',
    buyerId: 23,
    sellerId: currentUserId,
    deliveryMode: 'DELIVER_TO_SCHOOL',
    status: 'WAITING_PICKUP',
    remark: '已确认配送到海韵园',
    createdAt: '2026-07-08T19:24:00+08:00',
  },
  {
    id: 6203,
    itemId: 2003,
    itemTitle: '羽毛球拍双拍',
    buyerId: 24,
    sellerId: currentUserId,
    deliveryMode: 'SELF_PICKUP',
    status: 'COMPLETED',
    remark: '完成于 2026-07-07',
    createdAt: '2026-07-07T17:15:00+08:00',
  },
  {
    id: 6204,
    itemId: 2004,
    itemTitle: '护眼台灯 可调光',
    buyerId: 25,
    sellerId: currentUserId,
    deliveryMode: 'SELF_PICKUP',
    status: 'WAITING_PICKUP',
    remark: '买家预约今天傍晚自提',
    createdAt: '2026-07-10T09:40:00+08:00',
  },
  {
    id: 6205,
    itemId: 2005,
    itemTitle: 'MacBook Air 2019',
    buyerId: 26,
    sellerId: currentUserId,
    deliveryMode: 'SELF_PICKUP',
    status: 'PENDING_COMMUNICATION',
    remark: '买家询问电池健康度',
    createdAt: '2026-07-10T08:55:00+08:00',
  },
  {
    id: 6206,
    itemId: 2006,
    itemTitle: 'AirPods 二代',
    buyerId: 27,
    sellerId: currentUserId,
    deliveryMode: 'DELIVER_TO_SCHOOL',
    status: 'CANCELLED',
    remark: '买家临时取消预约',
    createdAt: '2026-07-05T14:20:00+08:00',
  },
]

const mockOrderMeta = new Map<number, MockOrderMeta>([
  [
    6101,
    {
      buyerName: '海风同学',
      categoryName: '宿舍用品',
      coverImageUrl: deskLampImage,
      pickupSpot: '芙蓉园门口',
      priceCent: 4500,
      sellerName: '王同学',
      timelineText: '卖家已确认地点，等待你自提',
    },
  ],
  [
    6102,
    {
      buyerName: '海风同学',
      categoryName: '教材',
      coverImageUrl: mathBooksImage,
      pickupSpot: '图书馆东门',
      priceCent: 2800,
      sellerName: '李同学',
      timelineText: '确认教材版本与取货时间',
    },
  ],
  [
    6103,
    {
      buyerName: '海风同学',
      categoryName: '数码电子',
      coverImageUrl: mechanicalKeyboardImage,
      pickupSpot: '海韵园宿舍区',
      priceCent: 12000,
      sellerName: '张同学',
      timelineText: '等待卖家回复',
    },
  ],
  [
    6104,
    {
      buyerName: '海风同学',
      categoryName: '生活日用',
      coverImageUrl: suitcaseImage,
      pickupSpot: '学生公寓前台',
      priceCent: 8000,
      sellerName: '刘同学',
      timelineText: '完成于 2026-07-06',
    },
  ],
  [
    6105,
    {
      buyerName: '海风同学',
      cancelReason: '临时更换购买计划',
      categoryName: '数码电子',
      coverImageUrl: airpodsImage,
      pickupSpot: '翔安校区快递点',
      priceCent: 39900,
      sellerName: '周同学',
      timelineText: '订单已取消',
    },
  ],
  [
    6106,
    {
      buyerName: '海风同学',
      categoryName: '运动户外',
      coverImageUrl: basketballImage,
      pickupSpot: '思明南路校门',
      priceCent: 6000,
      sellerName: '陈同学',
      timelineText: '约定傍晚自提',
    },
  ],
  [
    6201,
    {
      appointmentText: '待约定',
      buyerName: '沈同学',
      categoryName: '乐器文具',
      coverImageUrl: calculatorImage,
      latestMessage: '买家还在确认时间',
      pickupSpot: '嘉庚三门厅',
      priceCent: 8500,
      sellerName: '海风同学',
      timelineText: '买家正在确认验机时间',
    },
  ],
  [
    6202,
    {
      appointmentText: '明天 12:20',
      buyerName: '许同学',
      categoryName: '宿舍用品',
      coverImageUrl: suitcaseImage,
      latestMessage: '买家想确认收纳箱尺寸',
      pickupSpot: '海韵园 4 号楼',
      priceCent: 3500,
      sellerName: '海风同学',
      timelineText: '已确认校内配送',
    },
  ],
  [
    6203,
    {
      appointmentText: '昨日 17:00',
      buyerName: '郑同学',
      categoryName: '运动户外',
      coverImageUrl: basketballImage,
      latestMessage: '已线下交付',
      pickupSpot: '上弦场',
      priceCent: 6800,
      sellerName: '海风同学',
      timelineText: '买家已确认完成',
    },
  ],
  [
    6204,
    {
      appointmentText: '今天 18:30',
      buyerName: '王同学',
      categoryName: '宿舍用品',
      coverImageUrl: deskLampImage,
      latestMessage: '买家：晚上六点半方便吗？',
      pickupSpot: '芙蓉园门口',
      priceCent: 4500,
      sellerName: '海风同学',
      timelineText: '买家已预约今天自提',
    },
  ],
  [
    6205,
    {
      appointmentText: '明天 12:20',
      buyerName: '林同学',
      categoryName: '数码电子',
      coverImageUrl: macbookImage,
      latestMessage: '买家想确认电池健康度',
      pickupSpot: '图书馆东门',
      priceCent: 268000,
      sellerName: '海风同学',
      timelineText: '等待确认交易时间',
    },
  ],
  [
    6206,
    {
      appointmentText: '已取消',
      buyerName: '周同学',
      cancelReason: '买家临时取消预约',
      categoryName: '数码电子',
      coverImageUrl: airpodsImage,
      latestMessage: '买家临时取消预约',
      pickupSpot: '无',
      priceCent: 39900,
      sellerName: '海风同学',
      timelineText: '订单已取消',
    },
  ],
])

export async function createMockOrder(payload: CreateOrderRequest): Promise<ApiResponse<OrderSummary>> {
  await delay(mockLatencyMs)

  const order: OrderSummary = {
    id: Date.now(),
    itemId: payload.itemId,
    itemTitle: payload.itemId === 1003 ? '护眼台灯 可调光' : `闲置商品 #${payload.itemId}`,
    buyerId: currentUserId,
    sellerId: payload.itemId === 1003 ? 9 : 1,
    deliveryMode: payload.deliveryMode,
    status: 'PENDING_COMMUNICATION',
    remark: payload.remark,
    createdAt: new Date().toISOString(),
  }

  mockOrders = [order, ...mockOrders]
  return mockResponse(order)
}

export async function listMockOrders(params?: OrderListParams): Promise<ApiResponse<PageResult<OrderSummary>>> {
  await delay(mockLatencyMs)

  const role = params?.role ?? 'BUYER'
  const page = params?.page ?? 1
  const size = params?.size ?? 20
  const start = (page - 1) * size

  const filteredOrders = mockOrders
    .filter((order) => (role === 'BUYER' ? order.buyerId === currentUserId : order.sellerId === currentUserId))
    .filter((order) => (params?.status ? order.status === params.status : true))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())

  return mockResponse({
    items: filteredOrders.slice(start, start + size),
    page,
    size,
    total: filteredOrders.length,
  })
}

export async function getMockOrder(orderId: string | number): Promise<ApiResponse<OrderSummary>> {
  await delay(mockLatencyMs)

  const order = mockOrders.find((item) => item.id === Number(orderId))

  if (order) {
    return mockResponse(order)
  }

  return {
    code: 'NOT_FOUND',
    message: 'order not found',
    data: undefined as unknown as OrderSummary,
    traceId: `mock-${Date.now()}`,
  }
}

export async function updateMockOrderStatus(
  orderId: string | number,
  payload: UpdateOrderStatusRequest,
): Promise<ApiResponse<OrderSummary>> {
  await delay(mockLatencyMs)

  let updatedOrder: OrderSummary | undefined

  mockOrders = mockOrders.map((order) => {
    if (order.id !== Number(orderId)) {
      return order
    }

    updatedOrder = {
      ...order,
      status: payload.targetStatus,
      remark: payload.remark ?? order.remark,
    }
    return updatedOrder
  })

  if (updatedOrder) {
    return mockResponse(updatedOrder)
  }

  return {
    code: 'NOT_FOUND',
    message: 'order not found',
    data: undefined as unknown as OrderSummary,
    traceId: `mock-${Date.now()}`,
  }
}

export function getMockOrderMeta(orderId: string | number) {
  return mockOrderMeta.get(Number(orderId))
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
