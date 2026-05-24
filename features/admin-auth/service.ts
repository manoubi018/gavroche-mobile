import { HttpError } from "@/lib/errors/http-error"
import { verifyPassword } from "@/lib/auth/password"

import { adminAuthRepository } from "./repository"
import type { AuthenticateAdminInput } from "./types"

const MAX_FAILED_LOGIN_ATTEMPTS = 5
const LOCK_DURATION_MINUTES = 15

export class AdminAuthService {
  async authenticateAdmin(input: AuthenticateAdminInput) {
    const email = input.email.trim().toLowerCase()
    const admin = await adminAuthRepository.findAdminByEmail(email)

    if (!admin) {
      throw new HttpError(401, "Invalid email or password")
    }

    if (admin.statut !== "active") {
      throw new HttpError(403, "This admin account is not active")
    }

    if (admin.lockedUntil && new Date(admin.lockedUntil).getTime() > Date.now()) {
      throw new HttpError(423, "This account is temporarily locked")
    }

    const passwordIsValid = await verifyPassword(input.password, admin.passwordHash)

    if (!passwordIsValid) {
      const nextFailureCount = admin.failedLoginAttempts + 1
      const shouldLock = nextFailureCount >= MAX_FAILED_LOGIN_ATTEMPTS
      const lockedUntil = shouldLock
        ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000).toISOString()
        : null

      await adminAuthRepository.markFailedLogin(
        admin.id,
        shouldLock ? 0 : nextFailureCount,
        lockedUntil,
      )

      throw new HttpError(401, "Invalid email or password")
    }

    await adminAuthRepository.markSuccessfulLogin(admin.id)

    return {
      id: admin.id,
      email: admin.email,
      nom: admin.nom,
      role: admin.role,
    }
  }
}

export const adminAuthService = new AdminAuthService()
