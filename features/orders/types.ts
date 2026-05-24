export enum StatusCommande {
  ANNULEE = "ANNULEE",
  EN_COURS = "EN_COURS",
  LIVREE = "LIVREE",
  CONFIRMER = "CONFIRMER",
  EN_ROUTE = "EN_ROUTE",
  EN_EN_APPELLE = "EN_EN_APPELLE",
  APPELLE_CLIENT_1 = "APPELLE_CLIENT_1",
  APPELLE_CLIENT_2 = "APPELLE_CLIENT_2",
  NON_REPONDRE_CLIENT_1 = "NON_REPONDRE_CLIENT_1",
  NON_REPONDRE_CLIENT_2 = "NON_REPONDRE_CLIENT_2",
}

export interface AdresseCommande {
  id: number
  latitude: number | null
  longitude: number | null
  country: string
  city: string
  street: string
  postalCode: string
  isDefault: boolean
}

export interface LigneCommande {
  id: number
  productId: number
  quantite: number
}

export interface Commande {
  id: number
  status: StatusCommande
  createdAt: string
  total: number
  userId: number
  telephone: string
  shippingAddress: AdresseCommande | null
  items: LigneCommande[]
}

export interface CreateAdresseCommandeInput {
  latitude?: number
  longitude?: number
  country: string
  city: string
  street: string
  postalCode: string
}

export interface CreateLigneCommandeInput {
  productId: number
  quantite: number
}

export interface CreateOrderInput {
  userId: number
  telephone: string
  status?: StatusCommande
  total: number
  shippingAddress: CreateAdresseCommandeInput
  items: CreateLigneCommandeInput[]
}

export interface UpdateOrderStatusInput {
  status: StatusCommande
}
