import { offerService } from "@/features/offers/service"
import { offerValidator } from "@/features/offers/validator"
import { requireAdminApiSession } from "@/lib/auth/guards"
import { HttpError } from "@/lib/errors/http-error"
import { handleApi } from "@/lib/middlewares/api-handler"
import { verifySameOrigin } from "@/lib/security/csrf"

function parseOfferId(rawId: string) {
  const offerId = Number(rawId)

  if (!Number.isInteger(offerId) || offerId <= 0) {
    throw new HttpError(400, "Invalid offerId")
  }

  return offerId
}

export async function GET(
  request: Request,
  context: { params: Promise<{ offerId: string }> },
) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    const { offerId: rawId } = await context.params
    const offerId = parseOfferId(rawId)
    const offer = await offerService.getOfferById(offerId)
    return { data: offer }
  })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ offerId: string }> },
) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    verifySameOrigin(request)

    const { offerId: rawId } = await context.params
    const offerId = parseOfferId(rawId)
    const body = await request.json()
    const input = offerValidator.validateUpdateOffer(body)
    const offer = await offerService.updateOffer(offerId, input)

    return { data: offer }
  })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ offerId: string }> },
) {
  return handleApi(request, async () => {
    await requireAdminApiSession()
    verifySameOrigin(request)

    const { offerId: rawId } = await context.params
    const offerId = parseOfferId(rawId)
    await offerService.deleteOffer(offerId)

    return { data: { success: true } }
  })
}
