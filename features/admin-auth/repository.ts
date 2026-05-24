import { dbClient } from "@/lib/db/client"

import type { AdminAuthUser } from "./types"

type AdminRow = {
  id: number
  nom: string
  email: string
  statut: string
  role: "ADMIN"
  password_hash: string | null
  failed_login_attempts: number | null
  locked_until: string | null
  last_login_at: string | null
}

function mapAdmin(row: AdminRow): AdminAuthUser {
  return {
    id: Number(row.id),
    nom: row.nom,
    email: row.email,
    statut: row.statut,
    role: "ADMIN",
    passwordHash: row.password_hash,
    failedLoginAttempts: Number(row.failed_login_attempts ?? 0),
    lockedUntil: row.locked_until,
    lastLoginAt: row.last_login_at,
  }
}

export class AdminAuthRepository {
  async findAdminByEmail(email: string) {
    const row = await dbClient.query<AdminRow | null>({
      table: "users",
      method: "select",
      select:
        "id,nom,email,statut,role,password_hash,failed_login_attempts,locked_until,last_login_at",
      filters: {
        email,
        role: "ADMIN",
      },
      single: true,
    })

    if (!row) {
      return null
    }

    return mapAdmin(row)
  }

  async markFailedLogin(id: number, failedLoginAttempts: number, lockedUntil: string | null) {
    await dbClient.query<AdminRow[]>({
      table: "users",
      method: "update",
      filters: { id },
      body: {
        failed_login_attempts: failedLoginAttempts,
        locked_until: lockedUntil,
      },
    })
  }

  async markSuccessfulLogin(id: number) {
    await dbClient.query<AdminRow[]>({
      table: "users",
      method: "update",
      filters: { id },
      body: {
        failed_login_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString(),
      },
    })
  }
}

export const adminAuthRepository = new AdminAuthRepository()
