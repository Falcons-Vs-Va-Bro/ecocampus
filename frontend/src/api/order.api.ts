import type { ApiResponse, DeliveryMode, OrderStatus, PageResult } from '../types/api'
import { apiClient } from './http'
import { createMockOrder } from './mock/orders.mock'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export interface CreateOrderRequest {
  itemId: number
  deliveryMode: DeliveryMode
  remark?: string
}

export interface OrderSummary {
  id: number
  itemId: number
  itemTitle: string
  status: OrderStatus
  createdAt: string
}

export interface UpdateOrderStatusRequest {
  targetStatus: OrderStatus
  remark?: string
}

export async function createOrder(payload: CreateOrderRequest) {
  if (useMocks) {
    return createMockOrder(payload)
  }

  const response = await apiClient.post<ApiResponse<OrderSummary>>('/orders', payload)
  return response.data
}

export async function listOrders(params?: { role?: 'BUYER' | 'SELLER'; status?: OrderStatus }) {
  const response = await apiClient.get<ApiResponse<PageResult<OrderSummary>>>('/orders', { params })
  return response.data
}

export async function getOrder(orderId: string | number) {
  const response = await apiClient.get<ApiResponse<OrderSummary>>(`/orders/${orderId}`)
  return response.data
}

export async function updateOrderStatus(orderId: string | number, payload: UpdateOrderStatusRequest) {
  const response = await apiClient.post<ApiResponse<OrderSummary>>(`/orders/${orderId}/status`, payload)
  return response.data
}
