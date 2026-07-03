import { create } from 'zustand'
import type { UserRole, VerificationStatus } from '../types/api'

interface AuthState {
  accessToken?: string
  role: UserRole
  verificationStatus: VerificationStatus
  setSession: (session: {
    accessToken: string
    role: Extract<UserRole, 'USER' | 'ADMIN'>
    verificationStatus: VerificationStatus
  }) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: undefined,
  role: 'GUEST',
  verificationStatus: 'UNVERIFIED',
  setSession: (session) => set(session),
  clearSession: () =>
    set({
      accessToken: undefined,
      role: 'GUEST',
      verificationStatus: 'UNVERIFIED',
    }),
}))

export const getAccessToken = () => useAuthStore.getState().accessToken
