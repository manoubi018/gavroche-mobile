import { z } from "zod"

import { Role } from "./types"

const presenceTimestampSchema = z.string().min(1)

const adresseSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  country: z.string().min(2),
  city: z.string().min(2),
  street: z.string().min(2),
  postalCode: z.string().min(2),
  isDefault: z.boolean().optional(),
})

const createUserSchema = z.object({
  nom: z.string().min(2),
  email: z.string().email(),
  telephone: z.string().min(6),
  image: z.string().url().optional(),
  statut: z.string().optional(),
  isOnline: z.boolean().optional(),
  lastSeen: presenceTimestampSchema.nullable().optional(),
  role: z.nativeEnum(Role).optional(),
  adresse: adresseSchema.optional(),
})

const updateUserSchema = z
  .object({
    nom: z.string().min(2).optional(),
    email: z.string().email().optional(),
    telephone: z.string().min(6).optional(),
    image: z.string().url().optional(),
    statut: z.string().optional(),
    isOnline: z.boolean().optional(),
    lastSeen: presenceTimestampSchema.nullable().optional(),
    role: z.nativeEnum(Role).optional(),
    adresse: adresseSchema.partial().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })

export class UserValidator {
  validateCreateUser(input: unknown) {
    return createUserSchema.parse(input)
  }

  validateUpdateUser(input: unknown) {
    return updateUserSchema.parse(input)
  }
}

export const userValidator = new UserValidator()
