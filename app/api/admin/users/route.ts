import { userService } from "@/features/users/service"
import { requireAdminApiSession } from "@/lib/auth/guards"
import { handleApi } from "@/lib/middlewares/api-handler"

export async function GET(request: Request) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    const users = await userService.getUsers()
    return { data: users }
  })
}
