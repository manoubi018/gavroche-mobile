import { dbClient } from "@/lib/db/client"
import { HttpError } from "@/lib/errors/http-error"

import type { CreateProductInput, Product, UpdateProductInput } from "./types"

type ProductRow = {
  id: number
  nom: string
  description: string | null
  prix: number | string
  stock: number
  unite: string
  image: string | null
  active: boolean
  created_at: string
  category_id: number | null
  categories?: {
    id: number
    slug: string
    name: string
    description: string | null
    is_active: boolean
  } | null
}

function mapProduct(row: ProductRow): Product {
  return {
    id: Number(row.id),
    nom: row.nom,
    description: row.description ?? null,
    prix: Number(row.prix),
    stock: Number(row.stock),
    unite: row.unite,
    image: row.image ?? null,
    active: Boolean(row.active),
    createdAt: row.created_at,
    categoryId: row.category_id == null ? null : Number(row.category_id),
    category: row.categories
      ? {
          id: Number(row.categories.id),
          slug: row.categories.slug,
          name: row.categories.name,
          description: row.categories.description ?? null,
          isActive: Boolean(row.categories.is_active),
        }
      : null,
  }
}

function mapProductWriteData(
  data: CreateProductInput | UpdateProductInput,
): Record<string, string | number | boolean | null> {
  const payload: Record<string, string | number | boolean | null> = {}

  if (data.nom !== undefined) payload.nom = data.nom
  if (data.description !== undefined) payload.description = data.description ?? null
  if (data.prix !== undefined) payload.prix = data.prix
  if (data.stock !== undefined) payload.stock = data.stock
  if (data.unite !== undefined) payload.unite = data.unite
  if (data.image !== undefined) payload.image = data.image ?? null
  if (data.active !== undefined) payload.active = data.active
  if (data.categoryId !== undefined) payload.category_id = data.categoryId ?? null

  return payload
}

export class ProductRepository {
  async findAll() {
    const rows = await dbClient.query<ProductRow[]>({
      table: "products",
      method: "select",
      select: "*,categories(id,slug,name,description,is_active)",
    })
    return rows.map(mapProduct)
  }

  async findById(id: number) {
    const row = await dbClient.query<ProductRow | null>({
      table: "products",
      method: "select",
      select: "*,categories(id,slug,name,description,is_active)",
      filters: { id },
      single: true,
    })

    if (!row) {
      return null
    }

    return mapProduct(row)
  }

  async create(product: CreateProductInput) {
    const rows = await dbClient.query<ProductRow[]>({
      table: "products",
      method: "insert",
      body: mapProductWriteData({
        ...product,
        active: product.active ?? true,
      }),
    })

    if (!rows[0]) {
      throw new HttpError(
        500,
        "Product was created but Supabase did not return the inserted row",
      )
    }

    return mapProduct(rows[0])
  }

  async update(id: number, data: UpdateProductInput) {
    const rows = await dbClient.query<ProductRow[]>({
      table: "products",
      method: "update",
      filters: { id },
      body: mapProductWriteData(data),
    })

    if (!rows[0]) {
      return null
    }

    return mapProduct(rows[0])
  }

  async updateStock(id: number, qty: number) {
    const rows = await dbClient.query<ProductRow[]>({
      table: "products",
      method: "update",
      filters: { id },
      body: { stock: qty },
    })

    if (!rows[0]) {
      return null
    }

    return mapProduct(rows[0])
  }

  async delete(id: number) {
    const rows = await dbClient.query<ProductRow[]>({
      table: "products",
      method: "delete",
      filters: { id },
    })

    return rows.length > 0
  }

  async findByCategoryId(categoryId: number) {
    const rows = await dbClient.query<ProductRow[]>({
      table: "products",
      method: "select",
      select: "*,categories(id,slug,name,description,is_active)",
      filters: { category_id: categoryId },
    })

    return rows.map(mapProduct)
  }

  async moveCategory(oldCategoryId: number, newCategoryId: number) {
    const rows = await dbClient.query<ProductRow[]>({
      table: "products",
      method: "update",
      filters: { category_id: oldCategoryId },
      body: { category_id: newCategoryId },
    })

    return rows.map(mapProduct)
  }

  async deleteByCategoryId(categoryId: number) {
    const rows = await dbClient.query<ProductRow[]>({
      table: "products",
      method: "delete",
      filters: { category_id: categoryId },
    })

    return rows.length
  }

  async setActive(id: number, active: boolean) {
    const rows = await dbClient.query<ProductRow[]>({
      table: "products",
      method: "update",
      filters: { id },
      body: { active },
    })

    if (!rows[0]) {
      return null
    }

    return mapProduct(rows[0])
  }
}

export const productRepository = new ProductRepository()
