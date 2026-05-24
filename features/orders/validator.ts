import { z } from "zod"

import { StatusCommande } from "./types"

const createOrderSchema = z.object({
  userId: z.number().int().positive(),
  telephone: z.string().min(6),
  status: z.nativeEnum(StatusCommande).optional(),
  total: z.number().positive(),
  shippingAddress: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    country: z.string().min(2),
    city: z.string().min(2),
    street: z.string().min(2),
    postalCode: z.string().min(2),
  }),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantite: z.number().int().positive(),
      }),
    )
    .min(1),
})

const updateStatusSchema = z.object({
  status: z.nativeEnum(StatusCommande),
})

export class OrderValidator {
  validateCreateOrder(input: unknown) {
    return createOrderSchema.parse(input)
  }

  validateUpdateStatus(input: unknown) {
    return updateStatusSchema.parse(input)
  }
}

export const orderValidator = new OrderValidator()
