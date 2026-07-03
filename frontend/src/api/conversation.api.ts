import type { ApiResponse, PageResult } from '../types/api'
import { apiClient } from './http'

export interface ConversationSummary {
  id: number
  itemId: number
  itemTitle: string
  peerNickname: string
  updatedAt: string
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
  const response = await apiClient.post<ApiResponse<ConversationSummary>>('/conversations', payload)
  return response.data
}

export async function listConversations(params?: { page?: number; size?: number }) {
  const response = await apiClient.get<ApiResponse<PageResult<ConversationSummary>>>('/conversations', { params })
  return response.data
}

export async function listMessages(conversationId: string | number, params?: { page?: number; size?: number }) {
  const response = await apiClient.get<ApiResponse<PageResult<MessageSummary>>>(
    `/conversations/${conversationId}/messages`,
    { params },
  )
  return response.data
}

export async function sendMessage(conversationId: string | number, payload: SendMessageRequest) {
  const response = await apiClient.post<ApiResponse<MessageSummary>>(
    `/conversations/${conversationId}/messages`,
    payload,
  )
  return response.data
}
