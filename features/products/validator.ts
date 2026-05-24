import { z } from "zod"

const createProductSchema = z.object({
  nom: z.string().min(2),
  description: z.string().optional(),
  prix: z.number().positive(),
  stock: z.number().int().nonnegative(),
  unite: z.string().min(1),
  categoryId: z.number().int().positive().optional(),
  image: z.string().url().optional(),
  active: z.boolean().optional(),
})

const updateProductSchema = createProductSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field must be provided",
  },
)

export class ProductValidator {
  validateCreateProduct(input: unknown) {
    return createProductSchema.parse(input)
  }

  validateUpdateProduct(input: unknown) {
    return updateProductSchema.parse(input)
  }
}

export const productValidator = new ProductValidator()
