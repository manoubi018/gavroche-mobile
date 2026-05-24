import { userService } from "@/features/users/service"
import { userValidator } from "@/features/users/validator"
import { requireAdminApiSession } from "@/lib/auth/guards"
import { HttpError } from "@/lib/errors/http-error"
import { handleApi } from "@/lib/middlewares/api-handler"
import { verifySameOrigin } from "@/lib/security/csrf"

function parseUserId(rawId: string) {
  const userId = Number(rawId)

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new HttpError(400, "Invalid userId")
  }

  return userId
}

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    const { userId: rawId } = await context.params
    const userId = parseUserId(rawId)
    const user = await userService.getUserById(userId)
    return { data: user }
  })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    verifySameOrigin(request)

    const { userId: rawId } = await context.params
    const userId = parseUserId(rawId)
    const body = await request.json()
    const input = userValidator.validateUpdateUser(body)
    const user = await userService.updateUser(userId, input)

    return { data: user }
  })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    verifySameOrigin(request)

    const { userId: rawId } = await context.params
    const userId = parseUserId(rawId)
    await userService.deleteUser(userId)

    return { data: { success: true } }
  })
}
