import { productService } from "@/features/products/service"
import { productValidator } from "@/features/products/validator"
import { requireAdminApiSession } from "@/lib/auth/guards"
import { HttpError } from "@/lib/errors/http-error"
import { handleApi } from "@/lib/middlewares/api-handler"
import { verifySameOrigin } from "@/lib/security/csrf"

function parseProductId(rawId: string) {
  const productId = Number(rawId)

  if (!Number.isInteger(productId) || productId <= 0) {
    throw new HttpError(400, "Invalid productId")
  }

  return productId
}

export async function GET(
  request: Request,
  context: { params: Promise<{ productId: string }> },
) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    const { productId: rawId } = await context.params
    const productId = parseProductId(rawId)
    const product = await productService.getProductById(productId)

    return { data: product }
  })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ productId: string }> },
) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    verifySameOrigin(request)

    const { productId: rawId } = await context.params
    const productId = parseProductId(rawId)
    const body = await request.json()
    const input = productValidator.validateUpdateProduct(body)
    const product = await productService.updateProduct(productId, input)

    return { data: product }
  })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ productId: string }> },
) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    verifySameOrigin(request)

    const { productId: rawId } = await context.params
    const productId = parseProductId(rawId)
    await productService.deleteProduct(productId)

    return { data: { success: true } }
  })
}
