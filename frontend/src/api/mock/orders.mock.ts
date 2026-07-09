import type { ApiResponse } from '../../types/api'
import type { CreateOrderRequest, OrderSummary } from '../order.api'

const mockLatencyMs = 180

export async function createMockOrder(payload: CreateOrderRequest): Promise<ApiResponse<OrderSummary>> {
  await delay(mockLatencyMs)

  return {
    code: 'OK',
    message: 'success',
    data: {
      id: Date.now(),
      itemId: payload.itemId,
      itemTitle: '护眼台灯 可调光',
      status: 'PENDING_COMMUNICATION',
      createdAt: new Date().toISOString(),
    },
    traceId: `mock-order-${Date.now()}`,
  }
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
