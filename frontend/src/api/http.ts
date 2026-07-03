import axios, { AxiosError, AxiosHeaders } from 'axios'
import type { ApiResponse } from '../types/api'
import { getAccessToken } from '../stores/auth.store'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export class ApiClientError extends Error {
  code: string
  status?: number
  traceId?: string

  constructor(message: string, options: { code: string; status?: number; traceId?: string }) {
    super(message)
    this.name = 'ApiClientError'
    this.code = options.code
    this.status = options.status
    this.traceId = options.traceId
  }
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const headers = AxiosHeaders.from(config.headers)
  const token = getAccessToken()

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (!headers.has('X-Trace-Id')) {
    headers.set('X-Trace-Id', createTraceId())
  }

  config.headers = headers
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    const payload = error.response?.data
    const apiError = new ApiClientError(payload?.message ?? error.message, {
      code: payload?.code ?? 'NETWORK_ERROR',
      status: error.response?.status,
      traceId: payload?.traceId,
    })

    return Promise.reject(apiError)
  },
)

function createTraceId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `trace-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
