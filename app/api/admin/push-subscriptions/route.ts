import { adminPushSubscriptionRepository } from "@/features/admin-push-subscriptions/repository"
import { requireAdminApiSession } from "@/lib/auth/guards"
import { HttpError } from "@/lib/errors/http-error"
import { handleApi } from "@/lib/middlewares/api-handler"

type PushSubscriptionPayload = {
  endpoint?: unknown
  keys?: {
    p256dh?: unknown
    auth?: unknown
  }
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const session = await requireAdminApiSession()
    const payload = (await request.json().catch(() => null)) as PushSubscriptionPayload | null

    if (
      !payload ||
      typeof payload.endpoint !== "string" ||
      typeof payload.keys?.p256dh !== "string" ||
      typeof payload.keys?.auth !== "string"
    ) {
      throw new HttpError(400, "Invalid push subscription")
    }

    const subscription = await adminPushSubscriptionRepository.save({
      adminId: session.sub,
      endpoint: payload.endpoint,
      p256dh: payload.keys.p256dh,
      auth: payload.keys.auth,
      userAgent: request.headers.get("user-agent"),
    })

    return { data: { ok: true, id: subscription?.id ?? null }, status: 201 }
  })
}
