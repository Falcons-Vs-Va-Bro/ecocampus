import type { ApiResponse, CurrentUser, VerificationStatus } from '../types/api'
import { apiClient } from './http'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'
let mockPhoneChallenge: { code: string; expiresAt: number; mobilePhone: string } | undefined

export interface LoginRequest {
  account: string
  password: string
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
  mobilePhone: string
  verificationCode: string
}

export interface PhoneVerificationCodeResponse {
  maskedPhone: string
  demoCode: string
  expiresInSeconds: number
  resendAfterSeconds: number
  deliveryMessage: string
}

export async function login(payload: LoginRequest) {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload)
  return response.data
}

export async function submitCampusVerification(payload: CampusVerificationRequest) {
  if (useMocks) {
    await mockDelay(480)
    if (!mockPhoneChallenge || mockPhoneChallenge.expiresAt < Date.now()) {
      throw new Error('演示验证码已过期，请让白鹭重新送一封')
    }
    if (mockPhoneChallenge.mobilePhone !== payload.mobilePhone || mockPhoneChallenge.code !== payload.verificationCode) {
      throw new Error('验证码不对，白鹭说再检查一下信封')
    }
    mockPhoneChallenge = undefined
    return mockResponse<CurrentUser>({
      id: 101,
      nickname: payload.realName,
      phone: maskPhone(payload.mobilePhone),
      role: 'USER',
      verificationStatus: 'VERIFIED',
      studentNoMasked: maskStudentNo(payload.studentNo),
    })
  }

  const response = await apiClient.post<ApiResponse<CurrentUser>>('/auth/campus-verification', payload)
  return response.data
}

export async function requestPhoneVerificationCode(payload: { mobilePhone: string }) {
  if (useMocks) {
    await mockDelay(650)
    const code = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')
    mockPhoneChallenge = { code, expiresAt: Date.now() + 5 * 60_000, mobilePhone: payload.mobilePhone }
    return mockResponse<PhoneVerificationCodeResponse>({
      maskedPhone: maskPhone(payload.mobilePhone),
      demoCode: code,
      expiresInSeconds: 300,
      resendAfterSeconds: 45,
      deliveryMessage: '厦大白鹭短信站已送达课堂演示码',
    })
  }

  const response = await apiClient.post<ApiResponse<PhoneVerificationCodeResponse>>('/auth/phone-verification/code', payload)
  return response.data
}

export async function getCurrentUser() {
  const response = await apiClient.get<ApiResponse<CurrentUser>>('/auth/me')
  return response.data
}

function mockResponse<T>(data: T): ApiResponse<T> {
  return { code: 'OK', message: 'success', data, traceId: `mock-${Date.now()}` }
}

function mockDelay(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds))
}

function maskPhone(phone: string) {
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

function maskStudentNo(studentNo: string) {
  return `${studentNo.slice(0, 4)}****${studentNo.slice(-3)}`
}
