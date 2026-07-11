import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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

export const useAuthStore = create<AuthState>()(persist((set) => ({
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
}), { name: 'ecocampus.auth', partialize: (state) => ({ accessToken: state.accessToken, role: state.role, verificationStatus: state.verificationStatus }) }))

export const getAccessToken = () => useAuthStore.getState().accessToken
