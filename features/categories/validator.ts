import { z } from "zod"

const categorySchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

const updateCategorySchema = categorySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
)

const deleteCategorySchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("delete-products"),
  }),
  z.object({
    mode: z.literal("move-products"),
    replacementCategoryId: z.number().int().positive(),
  }),
])

export class CategoryValidator {
  validateCreateCategory(input: unknown) {
    return categorySchema.parse(input)
  }

  validateUpdateCategory(input: unknown) {
    return updateCategorySchema.parse(input)
  }

  validateDeleteCategory(input: unknown) {
    return deleteCategorySchema.parse(input)
  }
}

export const categoryValidator = new CategoryValidator()
