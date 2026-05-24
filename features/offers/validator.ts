import { z } from "zod"

const dateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Invalid date format",
})

const createOfferSchema = z.object({
  nom: z.string().min(2),
  dateDebut: dateString,
  dateFin: dateString,
  active: z.boolean().optional(),
  nouveauPrix: z.number().positive(),
})

const updateOfferSchema = createOfferSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field must be provided",
  },
)

const applyOfferSchema = z.object({
  productId: z.number().int().positive(),
  offerId: z.number().int().positive(),
})

export class OfferValidator {
  validateCreateOffer(input: unknown) {
    return createOfferSchema.parse(input)
  }

  validateUpdateOffer(input: unknown) {
    return updateOfferSchema.parse(input)
  }

  validateApplyOffer(input: unknown) {
    return applyOfferSchema.parse(input)
  }
}

export const offerValidator = new OfferValidator()
