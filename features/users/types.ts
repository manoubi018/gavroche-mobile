export enum Role {
  ADMIN = "ADMIN",
  CLIENT = "CLIENT",
}

export interface Adresse {
  id: number
  latitude: number | null
  longitude: number | null
  country: string
  city: string
  street: string
  postalCode: string
  isDefault: boolean
}

export interface User {
  id: number
  nom: string
  email: string
  telephone: string
  image: string | null
  createdAt: string
  statut: string
  isOnline: boolean
  lastSeen: string | null
  role: Role
  adresse?: Adresse | null
}

export interface CreateAdresseInput {
  latitude?: number
  longitude?: number
  country: string
  city: string
  street: string
  postalCode: string
  isDefault?: boolean
}

export interface CreateUserInput {
  nom: string
  email: string
  telephone: string
  image?: string
  statut?: string
  isOnline?: boolean
  lastSeen?: string | null
  role?: Role
  adresse?: CreateAdresseInput
}

export interface UpdateAdresseInput {
  latitude?: number
  longitude?: number
  country?: string
  city?: string
  street?: string
  postalCode?: string
  isDefault?: boolean
}

export interface UpdateUserInput {
  nom?: string
  email?: string
  telephone?: string
  image?: string
  statut?: string
  isOnline?: boolean
  lastSeen?: string | null
  role?: Role
  adresse?: UpdateAdresseInput
}
