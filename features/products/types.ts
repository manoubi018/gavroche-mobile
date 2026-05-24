export interface Product {
  id: number
  nom: string
  description: string | null
  prix: number
  stock: number
  unite: string
  image: string | null
  active: boolean
  createdAt: string
  categoryId: number | null
  category?: {
    id: number
    slug: string
    name: string
    description: string | null
    isActive: boolean
  } | null
}

export interface CreateProductInput {
  nom: string
  description?: string
  prix: number
  stock: number
  unite: string
  categoryId?: number
  image?: string
  active?: boolean
}

export interface UpdateProductInput {
  nom?: string
  description?: string
  prix?: number
  stock?: number
  unite?: string
  categoryId?: number | null
  image?: string
  active?: boolean
}
