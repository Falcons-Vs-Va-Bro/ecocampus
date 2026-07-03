import type { ApiResponse, CurrentUser } from '../types/api'
import { apiClient } from './http'

export interface UpdateProfileRequest {
  nickname: string
  avatarUrl?: string
}

export interface Address {
  id: number
  receiverName: string
  receiverPhone: string
  campusArea: string
  detail: string
  isDefault: boolean
}

export type UpsertAddressRequest = Omit<Address, 'id'>

export async function updateProfile(payload: UpdateProfileRequest) {
  const response = await apiClient.put<ApiResponse<CurrentUser>>('/users/me', payload)
  return response.data
}

export async function listAddresses() {
  const response = await apiClient.get<ApiResponse<Address[]>>('/users/me/addresses')
  return response.data
}

export async function createAddress(payload: UpsertAddressRequest) {
  const response = await apiClient.post<ApiResponse<Address>>('/users/me/addresses', payload)
  return response.data
}

export async function updateAddress(addressId: string | number, payload: UpsertAddressRequest) {
  const response = await apiClient.put<ApiResponse<Address>>(`/users/me/addresses/${addressId}`, payload)
  return response.data
}

export async function deleteAddress(addressId: string | number) {
  const response = await apiClient.delete<ApiResponse<void>>(`/users/me/addresses/${addressId}`)
  return response.data
}
