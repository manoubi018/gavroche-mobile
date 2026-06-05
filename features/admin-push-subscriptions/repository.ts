import { dbClient } from "@/lib/db/client"

type AdminPushSubscriptionRow = {
  id: number
  admin_id: number
  endpoint: string
  p256dh: string
  auth: string
  user_agent: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export type SaveAdminPushSubscriptionInput = {
  adminId: number
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string | null
}

export class AdminPushSubscriptionRepository {
  async save(input: SaveAdminPushSubscriptionInput) {
    const existing = await dbClient.query<AdminPushSubscriptionRow | null>({
      table: "admin_push_subscriptions",
      method: "select",
      select: "*",
      filters: { endpoint: input.endpoint },
      single: true,
    })

    const body = {
      admin_id: input.adminId,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      user_agent: input.userAgent ?? null,
      active: true,
      updated_at: new Date().toISOString(),
    }

    if (existing) {
      const rows = await dbClient.query<AdminPushSubscriptionRow[]>({
        table: "admin_push_subscriptions",
        method: "update",
        filters: { id: existing.id },
        body,
      })

      return rows[0] ?? existing
    }

    const rows = await dbClient.query<AdminPushSubscriptionRow[]>({
      table: "admin_push_subscriptions",
      method: "insert",
      body,
    })

    return rows[0] ?? null
  }
}

export const adminPushSubscriptionRepository = new AdminPushSubscriptionRepository()
