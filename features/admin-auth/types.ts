export interface AdminAuthUser {
  id: number
  nom: string
  email: string
  statut: string
  role: "ADMIN"
  passwordHash: string | null
  failedLoginAttempts: number
  lockedUntil: string | null
  lastLoginAt: string | null
}

export interface AuthenticateAdminInput {
  email: string
  password: string
}
