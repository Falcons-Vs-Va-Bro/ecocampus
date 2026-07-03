import type { ApiResponse, CurrentUser, VerificationStatus } from '../types/api'
import { apiClient } from './http'

export interface SmsCodeRequest {
  phone: string
}

export interface LoginRequest {
  phone: string
  code: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: number
    role: 'USER' | 'ADMIN'
    verificationStatus: VerificationStatus
  }
}

export interface CampusVerificationRequest {
  realName: string
  studentNo: string
  college: string
  grade: string
}

export async function sendSmsCode(payload: SmsCodeRequest) {
  const response = await apiClient.post<ApiResponse<void>>('/auth/sms-code', payload)
  return response.data
}

export async function login(payload: LoginRequest) {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload)
  return response.data
}

export async function submitCampusVerification(payload: CampusVerificationRequest) {
  const response = await apiClient.post<ApiResponse<void>>('/auth/campus-verification', payload)
  return response.data
}

export async function getCurrentUser() {
  const response = await apiClient.get<ApiResponse<CurrentUser>>('/auth/me')
  return response.data
}
