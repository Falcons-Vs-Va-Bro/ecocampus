import type { ApiResponse } from '../types/api'
import { apiClient } from './http'

export type ImageUploadScene = 'ITEM' | 'AVATAR' | 'REPORT'

export interface ImageUploadResponse {
  url: string
  width: number
  height: number
}

export async function uploadImage(file: File, scene: ImageUploadScene) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('scene', scene)

  const response = await apiClient.post<ApiResponse<ImageUploadResponse>>('/files/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}
