import { adminNotificationRepository } from "@/features/admin-notifications/repository"
import { requireAdminApiSession } from "@/lib/auth/guards"
import { handleApi } from "@/lib/middlewares/api-handler"

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const session = await requireAdminApiSession()
    const notifications = await adminNotificationRepository.findUnreadByAdminId(session.sub)

    return { data: notifications }
  })
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const session = await requireAdminApiSession()
    const payload = (await request.json().catch(() => null)) as { ids?: unknown } | null
    const ids = Array.isArray(payload?.ids)
      ? payload.ids.filter((id): id is number => Number.isInteger(id) && id > 0)
      : []

    if (ids.length > 0) {
      await adminNotificationRepository.markRead(session.sub, ids)
    }

    return { data: { ok: true } }
  })
}
