import { dbClient } from "@/lib/db/client"

import type { Category, CreateCategoryInput, UpdateCategoryInput } from "./types"

type CategoryRow = {
  id: number
  slug: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    description: row.description ?? null,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  }
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function mapCategoryWriteData(
  input: CreateCategoryInput | UpdateCategoryInput,
): Record<string, string | boolean | null> {
  const payload: Record<string, string | boolean | null> = {}

  if (input.name !== undefined) payload.name = input.name.trim()
  if (input.slug !== undefined || input.name !== undefined) {
    payload.slug = slugify(input.slug || input.name || "")
  }
  if (input.description !== undefined) payload.description = input.description || null
  if (input.isActive !== undefined) payload.is_active = input.isActive

  return payload
}

export class CategoryRepository {
  async findAll() {
    const rows = await dbClient.query<CategoryRow[]>({
      table: "categories",
      method: "select",
      select: "*",
    })

    return rows.map(mapCategory)
  }

  async findById(id: number) {
    const row = await dbClient.query<CategoryRow | null>({
      table: "categories",
      method: "select",
      select: "*",
      filters: { id },
      single: true,
    })

    return row ? mapCategory(row) : null
  }

  async create(input: CreateCategoryInput) {
    const rows = await dbClient.query<CategoryRow[]>({
      table: "categories",
      method: "insert",
      body: mapCategoryWriteData({
        ...input,
        isActive: input.isActive ?? true,
      }),
    })

    return mapCategory(rows[0])
  }

  async update(id: number, input: UpdateCategoryInput) {
    const rows = await dbClient.query<CategoryRow[]>({
      table: "categories",
      method: "update",
      filters: { id },
      body: mapCategoryWriteData(input),
    })

    return rows[0] ? mapCategory(rows[0]) : null
  }

  async delete(id: number) {
    const rows = await dbClient.query<CategoryRow[]>({
      table: "categories",
      method: "delete",
      filters: { id },
    })

    return rows.length > 0
  }
}

export const categoryRepository = new CategoryRepository()
