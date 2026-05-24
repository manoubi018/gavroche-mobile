import { offerService } from "@/features/offers/service"
import { requireAdminApiSession } from "@/lib/auth/guards"
import { handleApi } from "@/lib/middlewares/api-handler"

export async function GET(request: Request) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    const relations = await offerService.getProductOfferRelations()
    return { data: relations }
  })
}
