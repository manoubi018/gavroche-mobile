import { orderService } from "@/features/orders/service"
import { requireAdminApiSession } from "@/lib/auth/guards"
import { HttpError } from "@/lib/errors/http-error"
import { handleApi } from "@/lib/middlewares/api-handler"

export async function GET(request: Request) {
  return handleApi(request, async () => {
    await requireAdminApiSession()

    const { searchParams } = new URL(request.url)
    const telephone = searchParams.get("telephone") ?? undefined
    const userIdParam = searchParams.get("userId")
    const userId = userIdParam ? Number(userIdParam) : undefined

    if (
      userIdParam &&
      (typeof userId !== "number" || !Number.isInteger(userId) || userId <= 0)
    ) {
      throw new HttpError(400, "Invalid userId")
    }

    const orders = await orderService.getOrders({ telephone, userId })

    return { data: orders }
  })
}
