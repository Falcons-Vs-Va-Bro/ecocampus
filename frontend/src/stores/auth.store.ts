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

// v2 intentionally invalidates the pre-production session that shared the same
// custom domain. New logins remain persisted normally after the migration.
const authStorageName = import.meta.env.VITE_USE_MOCKS === 'true' ? 'ecocampus.auth.mock.v2' : 'ecocampus.auth.real.v2'

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
}), { name: authStorageName, partialize: (state) => ({ accessToken: state.accessToken, role: state.role, verificationStatus: state.verificationStatus }) }))

export const getAccessToken = () => useAuthStore.getState().accessToken
