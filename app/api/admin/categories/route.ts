import { categoryService } from "@/features/categories/service"
import { categoryValidator } from "@/features/categories/validator"
import { requireAdminApiSession } from "@/lib/auth/guards"
import { handleApi } from "@/lib/middlewares/api-handler"
import { verifySameOrigin } from "@/lib/security/csrf"

export async function GET(request: Request) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    const categories = await categoryService.getCategories()
    return { data: categories }
  })
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    verifySameOrigin(request)

    const body = await request.json()
    const input = categoryValidator.validateCreateCategory(body)
    const category = await categoryService.createCategory(input)

    return { data: category, status: 201 }
  })
}
