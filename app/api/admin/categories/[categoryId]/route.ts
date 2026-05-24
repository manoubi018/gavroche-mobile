import { categoryService } from "@/features/categories/service"
import { categoryValidator } from "@/features/categories/validator"
import { requireAdminApiSession } from "@/lib/auth/guards"
import { HttpError } from "@/lib/errors/http-error"
import { handleApi } from "@/lib/middlewares/api-handler"
import { verifySameOrigin } from "@/lib/security/csrf"

function parseCategoryId(rawId: string) {
  const categoryId = Number(rawId)

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new HttpError(400, "Invalid categoryId")
  }

  return categoryId
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ categoryId: string }> },
) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    verifySameOrigin(request)

    const { categoryId: rawId } = await context.params
    const categoryId = parseCategoryId(rawId)
    const body = await request.json()
    const input = categoryValidator.validateUpdateCategory(body)
    const category = await categoryService.updateCategory(categoryId, input)

    return { data: category }
  })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ categoryId: string }> },
) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    verifySameOrigin(request)

    const { categoryId: rawId } = await context.params
    const categoryId = parseCategoryId(rawId)
    const body = await request.json().catch(() => ({}))
    const input = categoryValidator.validateDeleteCategory(body)
    const result = await categoryService.deleteCategory(categoryId, input)

    return { data: result }
  })
}
