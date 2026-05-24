import { orderService } from "@/features/orders/service"
import { orderValidator } from "@/features/orders/validator"
import { requireAdminApiSession } from "@/lib/auth/guards"
import { HttpError } from "@/lib/errors/http-error"
import { handleApi } from "@/lib/middlewares/api-handler"
import { verifySameOrigin } from "@/lib/security/csrf"

function parseOrderId(rawId: string) {
  const orderId = Number(rawId)

  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new HttpError(400, "Invalid orderId")
  }

  return orderId
}

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    const { orderId: rawId } = await context.params
    const orderId = parseOrderId(rawId)
    const order = await orderService.getOrderById(orderId)

    return { data: order }
  })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    verifySameOrigin(request)

    const { orderId: rawId } = await context.params
    const orderId = parseOrderId(rawId)
    const body = await request.json()
    const { status } = orderValidator.validateUpdateStatus(body)
    const order = await orderService.updateOrderStatus(orderId, status)

    return { data: order }
  })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    verifySameOrigin(request)

    const { orderId: rawId } = await context.params
    const orderId = parseOrderId(rawId)
    await orderService.deleteOrder(orderId)

    return { data: { success: true } }
  })
}
