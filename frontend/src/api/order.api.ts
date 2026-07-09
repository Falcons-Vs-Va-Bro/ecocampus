import type { ApiResponse, DeliveryMode, OrderStatus, PageResult } from '../types/api'
import { apiClient } from './http'
import {
  createMockOrder,
  getMockOrder,
  listMockOrders,
  updateMockOrderStatus,
} from './mock/orders.mock'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export type OrderRole = 'BUYER' | 'SELLER'

export interface CreateOrderRequest {
  itemId: number
  deliveryMode: DeliveryMode
  remark?: string
}

export interface OrderSummary {
  id: number
  itemId: number
  itemTitle: string
  buyerId: number
  sellerId: number
  deliveryMode: DeliveryMode
  status: OrderStatus
  remark?: string
  createdAt: string
}

export interface OrderListParams {
  role?: OrderRole
  status?: OrderStatus
  page?: number
  size?: number
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

export async function listOrders(params?: OrderListParams) {
  if (useMocks) {
    return listMockOrders(params)
  }

  const response = await apiClient.get<ApiResponse<PageResult<OrderSummary>>>('/orders', { params })
  return response.data
}

export async function getOrder(orderId: string | number) {
  if (useMocks) {
    return getMockOrder(orderId)
  }

  const response = await apiClient.get<ApiResponse<OrderSummary>>(`/orders/${orderId}`)
  return response.data
}

export async function updateOrderStatus(orderId: string | number, payload: UpdateOrderStatusRequest) {
  if (useMocks) {
    return updateMockOrderStatus(orderId, payload)
  }

  const response = await apiClient.post<ApiResponse<OrderSummary>>(`/orders/${orderId}/status`, payload)
  return response.data
}
