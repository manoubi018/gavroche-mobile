export interface Category {
  id: number
  slug: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
}

export interface CreateCategoryInput {
  name: string
  slug?: string
  description?: string
  isActive?: boolean
}

export interface UpdateCategoryInput {
  name?: string
  slug?: string
  description?: string | null
  isActive?: boolean
}

export type DeleteCategoryMode = "delete-products" | "move-products"

export type DeleteCategoryInput =
  | { mode: "delete-products" }
  | { mode: "move-products"; replacementCategoryId: number }
