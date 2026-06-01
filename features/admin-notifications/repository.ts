import { dbClient } from "@/lib/db/client"

type AdminNotificationRow = {
  id: number
  admin_id: number
  order_id: number | null
  type: string
  title: string
  body: string
  read_at: string | null
  created_at: string
}

export type AdminNotification = {
  id: number
  adminId: number
  orderId: number | null
  type: string
  title: string
  body: string
  readAt: string | null
  createdAt: string
}

function mapNotification(row: AdminNotificationRow): AdminNotification {
  return {
    id: Number(row.id),
    adminId: Number(row.admin_id),
    orderId: row.order_id == null ? null : Number(row.order_id),
    type: row.type,
    title: row.title,
    body: row.body,
    readAt: row.read_at,
    createdAt: row.created_at,
  }
}

export class AdminNotificationRepository {
  async findUnreadByAdminId(adminId: number) {
    const rows = await dbClient.query<AdminNotificationRow[]>({
      table: "admin_notifications",
      method: "select",
      select: "*",
      filters: { admin_id: adminId },
    })

    return rows
      .filter((row) => !row.read_at)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(mapNotification)
  }

  async markRead(adminId: number, notificationIds: number[]) {
    const readAt = new Date().toISOString()

    await Promise.all(
      notificationIds.map((id) =>
        dbClient.query<AdminNotificationRow[]>({
          table: "admin_notifications",
          method: "update",
          filters: { id, admin_id: adminId },
          body: { read_at: readAt },
        }),
      ),
    )
  }
}

export const adminNotificationRepository = new AdminNotificationRepository()
