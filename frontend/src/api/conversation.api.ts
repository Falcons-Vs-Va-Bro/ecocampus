import type { ApiResponse, PageResult } from '../types/api'
import { apiClient } from './http'
import {
  createMockConversation,
  listMockConversations,
  listMockMessages,
  sendMockMessage,
} from './mock/conversations.mock'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export interface ConversationSummary {
  id: number
  itemId: number
  itemTitle: string
  targetUserId: number
  targetNickname: string
  lastMessage: string
  lastMessageAt: string
  createdAt: string
}

export interface MessageSummary {
  id: number
  conversationId: number
  senderId: number
  content: string
  createdAt: string
}

export interface CreateConversationRequest {
  itemId: number
  targetUserId: number
}

export interface SendMessageRequest {
  content: string
}

export async function createConversation(payload: CreateConversationRequest) {
  if (useMocks) {
    return createMockConversation(payload)
  }

  const response = await apiClient.post<ApiResponse<ConversationSummary>>('/conversations', payload)
  return response.data
}

export async function listConversations(params?: { page?: number; size?: number }) {
  if (useMocks) {
    return listMockConversations(params)
  }

  const response = await apiClient.get<ApiResponse<PageResult<ConversationSummary>>>('/conversations', { params })
  return response.data
}

export async function listMessages(conversationId: string | number, params?: { page?: number; size?: number }) {
  if (useMocks) {
    return listMockMessages(conversationId, params)
  }

  const response = await apiClient.get<ApiResponse<PageResult<MessageSummary>>>(
    `/conversations/${conversationId}/messages`,
    { params },
  )
  return response.data
}

export async function sendMessage(conversationId: string | number, payload: SendMessageRequest) {
  if (useMocks) {
    return sendMockMessage(conversationId, payload)
  }

  const response = await apiClient.post<ApiResponse<MessageSummary>>(
    `/conversations/${conversationId}/messages`,
    payload,
  )
  return response.data
}
