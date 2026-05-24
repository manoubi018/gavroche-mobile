import { offerService } from "@/features/offers/service"
import { offerValidator } from "@/features/offers/validator"
import { requireAdminApiSession } from "@/lib/auth/guards"
import { handleApi } from "@/lib/middlewares/api-handler"
import { verifySameOrigin } from "@/lib/security/csrf"

export async function POST(request: Request) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    verifySameOrigin(request)

    const body = await request.json()
    const input = offerValidator.validateApplyOffer(body)
    const relation = await offerService.applyOfferToProduct(input)
    return { data: relation, status: 201 }
  })
}
