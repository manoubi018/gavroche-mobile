import { z } from "zod"

const authenticateAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export class AdminAuthValidator {
  validateAuthenticate(input: unknown) {
    return authenticateAdminSchema.parse(input)
  }
}

export const adminAuthValidator = new AdminAuthValidator()
