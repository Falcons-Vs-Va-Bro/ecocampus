import type { ApiResponse, PageResult } from '../../types/api'
import type {
  ConversationSummary,
  CreateConversationRequest,
  MessageSummary,
  SendMessageRequest,
} from '../conversation.api'
import airpodsImage from '../../assets/favorites/items/airpods.webp'
import basketballImage from '../../assets/favorites/items/basketball.webp'
import deskLampImage from '../../assets/favorites/items/desk-lamp.webp'
import mathBooksImage from '../../assets/favorites/items/math-books.webp'
import mechanicalKeyboardImage from '../../assets/favorites/items/mechanical-keyboard.webp'

export interface MockConversationMeta {
  itemCoverImageUrl: string
  itemPriceCent: number
  itemStatus: 'ON_SALE' | 'SOLD' | 'OFF_SHELF'
  sellerVerified: boolean
  online: boolean
  unreadCount: number
  locationHint: string
  role: 'buyer' | 'seller'
}

export const mockCurrentUserId = 1

const mockLatencyMs = 180

let conversations: ConversationSummary[] = [
  {
    id: 501,
    itemId: 1003,
    itemTitle: '护眼台灯 可调光',
    targetUserId: 9,
    targetNickname: '林同学',
    lastMessage: '这个台灯还在吗？我今晚可以自提',
    lastMessageAt: '2026-07-08T19:32:00+08:00',
    createdAt: '2026-07-08T19:18:00+08:00',
  },
  {
    id: 502,
    itemId: 1001,
    itemTitle: '高等数学（第七版）上下册',
    targetUserId: 7,
    targetNickname: '陈同学',
    lastMessage: '可以，嘉庚三楼大厅见',
    lastMessageAt: '2026-07-08T10:28:00+08:00',
    createdAt: '2026-07-07T21:04:00+08:00',
  },
  {
    id: 503,
    itemId: 1007,
    itemTitle: 'AirPods 二代',
    targetUserId: 13,
    targetNickname: '周同学',
    lastMessage: 'AirPods 支持验机吗',
    lastMessageAt: '2026-07-07T18:45:00+08:00',
    createdAt: '2026-07-07T17:58:00+08:00',
  },
  {
    id: 504,
    itemId: 1004,
    itemTitle: '斯伯丁篮球 室内外7号球',
    targetUserId: 10,
    targetNickname: '王同学',
    lastMessage: '篮球最低多少呀',
    lastMessageAt: '2026-07-07T18:10:00+08:00',
    createdAt: '2026-07-07T16:34:00+08:00',
  },
  {
    id: 505,
    itemId: 1005,
    itemTitle: '机械键盘 青轴',
    targetUserId: 11,
    targetNickname: '李同学',
    lastMessage: '还能便宜一点吗？',
    lastMessageAt: '2026-07-07T16:32:00+08:00',
    createdAt: '2026-07-07T15:22:00+08:00',
  },
]

const conversationMeta: Record<number, MockConversationMeta> = {
  501: {
    itemCoverImageUrl: deskLampImage,
    itemPriceCent: 4500,
    itemStatus: 'ON_SALE',
    sellerVerified: true,
    online: true,
    unreadCount: 2,
    locationHint: '嘉庚二楼大厅',
    role: 'seller',
  },
  502: {
    itemCoverImageUrl: mathBooksImage,
    itemPriceCent: 2800,
    itemStatus: 'ON_SALE',
    sellerVerified: true,
    online: false,
    unreadCount: 1,
    locationHint: '嘉庚三楼大厅',
    role: 'buyer',
  },
  503: {
    itemCoverImageUrl: airpodsImage,
    itemPriceCent: 39900,
    itemStatus: 'ON_SALE',
    sellerVerified: true,
    online: false,
    unreadCount: 3,
    locationHint: '芙蓉湖旁',
    role: 'buyer',
  },
  504: {
    itemCoverImageUrl: basketballImage,
    itemPriceCent: 6000,
    itemStatus: 'ON_SALE',
    sellerVerified: true,
    online: true,
    unreadCount: 0,
    locationHint: '明培体育馆',
    role: 'buyer',
  },
  505: {
    itemCoverImageUrl: mechanicalKeyboardImage,
    itemPriceCent: 12000,
    itemStatus: 'ON_SALE',
    sellerVerified: true,
    online: true,
    unreadCount: 0,
    locationHint: '翔安校区快递点',
    role: 'seller',
  },
}

let messages: Record<number, MessageSummary[]> = {
  501: [
    createMessage(9001, 501, 9, '这个台灯还在吗？我今晚可以自提', '2026-07-08T19:20:00+08:00'),
    createMessage(9002, 501, mockCurrentUserId, '还在的，可以在嘉庚二楼大厅见', '2026-07-08T19:22:00+08:00'),
    createMessage(9003, 501, 9, '我想预约自提，时间地点？', '2026-07-08T19:24:00+08:00'),
    createMessage(9004, 501, mockCurrentUserId, '今晚 8 点可以吗？', '2026-07-08T19:27:00+08:00'),
    createMessage(9005, 501, 9, '可以，我带上台灯和充电线', '2026-07-08T19:32:00+08:00'),
  ],
  502: [
    createMessage(9011, 502, mockCurrentUserId, '同学，高数书还在吗？', '2026-07-08T10:10:00+08:00'),
    createMessage(9012, 502, 7, '还在，书页没有笔记。', '2026-07-08T10:18:00+08:00'),
    createMessage(9013, 502, 7, '可以，嘉庚三楼大厅见', '2026-07-08T10:28:00+08:00'),
  ],
  503: [createMessage(9021, 503, mockCurrentUserId, 'AirPods 支持验机吗', '2026-07-07T18:45:00+08:00')],
  504: [createMessage(9031, 504, mockCurrentUserId, '篮球最低多少呀', '2026-07-07T18:10:00+08:00')],
  505: [createMessage(9041, 505, 11, '还能便宜一点吗？', '2026-07-07T16:32:00+08:00')],
}

export function getMockConversationMeta(conversationId: string | number) {
  return conversationMeta[Number(conversationId)]
}

export async function listMockConversations(params?: {
  page?: number
  size?: number
}): Promise<ApiResponse<PageResult<ConversationSummary>>> {
  await delay(mockLatencyMs)

  const page = params?.page ?? 1
  const size = params?.size ?? 20
  const start = (page - 1) * size

  return mockResponse({
    items: conversations.slice(start, start + size).map((conversation) => ({
      ...conversation,
      unreadCount: conversationMeta[conversation.id]?.unreadCount ?? 0,
    })),
    page,
    size,
    total: conversations.length,
  })
}

export async function listMockMessages(
  conversationId: string | number,
  params?: { page?: number; size?: number },
): Promise<ApiResponse<PageResult<MessageSummary>>> {
  await delay(mockLatencyMs)

  const page = params?.page ?? 1
  const size = params?.size ?? 20
  const conversationMessages = messages[Number(conversationId)] ?? []
  const start = (page - 1) * size

  return mockResponse({
    items: conversationMessages.slice(start, start + size),
    page,
    size,
    total: conversationMessages.length,
  })
}

export async function sendMockMessage(
  conversationId: string | number,
  payload: SendMessageRequest,
): Promise<ApiResponse<MessageSummary>> {
  await delay(mockLatencyMs)

  const normalizedId = Number(conversationId)
  const createdMessage = createMessage(Date.now(), normalizedId, mockCurrentUserId, payload.content, new Date().toISOString())
  messages = {
    ...messages,
    [normalizedId]: [...(messages[normalizedId] ?? []), createdMessage],
  }
  conversations = conversations.map((conversation) =>
    conversation.id === normalizedId
      ? { ...conversation, lastMessage: payload.content, lastMessageAt: createdMessage.createdAt }
      : conversation,
  )

  return mockResponse(createdMessage)
}

export async function createMockConversation(
  payload: CreateConversationRequest,
): Promise<ApiResponse<ConversationSummary>> {
  await delay(mockLatencyMs)

  const existingConversation = conversations.find(
    (conversation) => conversation.itemId === payload.itemId && conversation.targetUserId === payload.targetUserId,
  )

  if (existingConversation) {
    return mockResponse(existingConversation)
  }

  const createdConversation: ConversationSummary = {
    id: Date.now(),
    itemId: payload.itemId,
    itemTitle: '校园闲置商品',
    targetUserId: payload.targetUserId,
    targetNickname: '同学',
    lastMessage: '',
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
  conversations = [createdConversation, ...conversations]
  messages = { ...messages, [createdConversation.id]: [] }

  return mockResponse(createdConversation)
}

function createMessage(
  id: number,
  conversationId: number,
  senderId: number,
  content: string,
  createdAt: string,
): MessageSummary {
  return {
    id,
    conversationId,
    senderId,
    content,
    createdAt,
  }
}

function mockResponse<T>(data: T): ApiResponse<T> {
  return {
    code: 'OK',
    message: 'success',
    data,
    traceId: `mock-conversations-${Date.now()}`,
  }
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
