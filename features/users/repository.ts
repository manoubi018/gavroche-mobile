import { dbClient } from "@/lib/db/client"

import type {
  Adresse,
  CreateUserInput,
  UpdateAdresseInput,
  UpdateUserInput,
  User,
} from "./types"
import { Role } from "./types"

type UserRow = {
  id: number
  nom: string
  email: string
  telephone: string
  image: string | null
  created_at: string
  statut: string
  is_online: boolean
  last_seen: string | null
  role: Role
}

type AdresseRow = {
  id: number
  latitude: number | null
  longitude: number | null
  country: string
  city: string
  street: string
  postal_code: string
  is_default: boolean
}

function mapAdresse(row: AdresseRow): Adresse {
  return {
    id: Number(row.id),
    latitude: row.latitude != null ? Number(row.latitude) : null,
    longitude: row.longitude != null ? Number(row.longitude) : null,
    country: row.country,
    city: row.city,
    street: row.street,
    postalCode: row.postal_code,
    isDefault: Boolean(row.is_default),
  }
}

function mapUser(row: UserRow, adresse?: Adresse | null): User {
  return {
    id: Number(row.id),
    nom: row.nom,
    email: row.email,
    telephone: row.telephone,
    image: row.image ?? null,
    createdAt: row.created_at,
    statut: row.statut,
    isOnline: Boolean(row.is_online),
    lastSeen: row.last_seen,
    role: row.role,
    adresse: adresse ?? null,
  }
}

function mapUserWriteData(
  data: Partial<CreateUserInput & UpdateUserInput>,
): Record<string, string | boolean | null> {
  const payload: Record<string, string | boolean | null> = {}

  if (data.nom !== undefined) {
    payload.nom = data.nom
  }

  if (data.email !== undefined) {
    payload.email = data.email
  }

  if (data.telephone !== undefined) {
    payload.telephone = data.telephone
  }

  if (data.image !== undefined) {
    payload.image = data.image ?? null
  }

  if (data.statut !== undefined) {
    payload.statut = data.statut
  }

  if (data.isOnline !== undefined) {
    payload.is_online = data.isOnline
  }

  if (data.lastSeen !== undefined) {
    payload.last_seen = data.lastSeen
  }

  if (data.role !== undefined) {
    payload.role = data.role
  }

  return payload
}

function hasAddressFields(data: UpdateAdresseInput) {
  return Object.keys(data).length > 0
}

export class UserRepository {
  private async getDefaultAddress(userId: number) {
    const row = await dbClient.query<AdresseRow | null>({
      table: "addresses",
      method: "select",
      select: "*",
      filters: { user_id: userId, is_default: true },
      single: true,
    })

    if (!row) {
      return null
    }

    return mapAdresse(row)
  }

  async findAll() {
    const rows = await dbClient.query<UserRow[]>({
      table: "users",
      method: "select",
      select: "*",
    })

    const users = await Promise.all(
      rows.map(async (row) => {
        const adresse = await this.getDefaultAddress(Number(row.id))
        return mapUser(row, adresse)
      }),
    )

    return users
  }

  async findById(id: number) {
    const row = await dbClient.query<UserRow | null>({
      table: "users",
      method: "select",
      select: "*",
      filters: { id },
      single: true,
    })

    if (!row) {
      return null
    }

    const adresse = await this.getDefaultAddress(id)
    return mapUser(row, adresse)
  }

  async findByEmail(email: string) {
    const row = await dbClient.query<UserRow | null>({
      table: "users",
      method: "select",
      select: "*",
      filters: { email },
      single: true,
    })

    if (!row) {
      return null
    }

    const adresse = await this.getDefaultAddress(Number(row.id))
    return mapUser(row, adresse)
  }

  async findByTelephone(telephone: string) {
    const row = await dbClient.query<UserRow | null>({
      table: "users",
      method: "select",
      select: "*",
      filters: { telephone },
      single: true,
    })

    if (!row) {
      return null
    }

    const adresse = await this.getDefaultAddress(Number(row.id))
    return mapUser(row, adresse)
  }

  async create(user: CreateUserInput) {
    return dbClient.transaction(async (tx) => {
      const createdUsers = await tx.query<UserRow[]>({
        table: "users",
        method: "insert",
        body: mapUserWriteData({
          nom: user.nom,
          email: user.email,
          telephone: user.telephone,
          image: user.image,
          statut: user.statut ?? "active",
          isOnline: user.isOnline ?? false,
          lastSeen: user.lastSeen ?? null,
          role: user.role ?? Role.CLIENT,
        }),
      })

      const created = createdUsers[0]

      if (user.adresse) {
        await tx.query<AdresseRow[]>({
          table: "addresses",
          method: "insert",
          body: {
            user_id: created.id,
            latitude: user.adresse.latitude ?? null,
            longitude: user.adresse.longitude ?? null,
            country: user.adresse.country,
            city: user.adresse.city,
            street: user.adresse.street,
            postal_code: user.adresse.postalCode,
            is_default: user.adresse.isDefault ?? true,
          },
        })
      }

      return this.findById(created.id)
    })
  }

  async update(id: number, data: UpdateUserInput) {
    const { adresse, ...userData } = data

    if (Object.keys(userData).length > 0) {
      await dbClient.query<UserRow[]>({
        table: "users",
        method: "update",
        filters: { id },
        body: mapUserWriteData(userData),
      })
    }

    if (adresse && hasAddressFields(adresse)) {
      const existingAddress = await dbClient.query<AdresseRow | null>({
        table: "addresses",
        method: "select",
        select: "*",
        filters: { user_id: id, is_default: true },
        single: true,
      })

      if (existingAddress) {
        await dbClient.query<AdresseRow[]>({
          table: "addresses",
          method: "update",
          filters: { id: existingAddress.id },
          body: {
            latitude: adresse.latitude ?? existingAddress.latitude,
            longitude: adresse.longitude ?? existingAddress.longitude,
            country: adresse.country ?? existingAddress.country,
            city: adresse.city ?? existingAddress.city,
            street: adresse.street ?? existingAddress.street,
            postal_code: adresse.postalCode ?? existingAddress.postal_code,
            is_default: adresse.isDefault ?? existingAddress.is_default,
          },
        })
      } else {
        await dbClient.query<AdresseRow[]>({
          table: "addresses",
          method: "insert",
          body: {
            user_id: id,
            latitude: adresse.latitude ?? null,
            longitude: adresse.longitude ?? null,
            country: adresse.country ?? "",
            city: adresse.city ?? "",
            street: adresse.street ?? "",
            postal_code: adresse.postalCode ?? "",
            is_default: adresse.isDefault ?? true,
          },
        })
      }
    }

    return this.findById(id)
  }

  async delete(id: number) {
    const rows = await dbClient.query<UserRow[]>({
      table: "users",
      method: "delete",
      filters: { id },
    })
    return rows.length > 0
  }

  async setStatus(id: number, statut: string) {
    const rows = await dbClient.query<UserRow[]>({
      table: "users",
      method: "update",
      filters: { id },
      body: { statut },
    })

    if (!rows[0]) {
      return null
    }

    const adresse = await this.getDefaultAddress(id)
    return mapUser(rows[0], adresse)
  }
}

export const userRepository = new UserRepository()
