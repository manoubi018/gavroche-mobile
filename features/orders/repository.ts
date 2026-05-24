import { dbClient } from "@/lib/db/client"

import type {
  AdresseCommande,
  Commande,
  CreateOrderInput,
  LigneCommande,
  StatusCommande,
} from "./types"
import { StatusCommande as StatusCommandeEnum } from "./types"

type OrderRow = {
  id: number
  telephone: string
  status: StatusCommande
  created_at: string
  total: number | string
  user_id: number
  shipping_address_id: number | null
}

type OrderItemRow = {
  id: number
  order_id: number
  product_id: number
  quantite: number
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

interface FindOrdersFilters {
  userId?: number
  telephone?: string
}

function mapAdresse(row: AdresseRow): AdresseCommande {
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

function mapLigneCommande(row: OrderItemRow): LigneCommande {
  return {
    id: Number(row.id),
    productId: Number(row.product_id),
    quantite: Number(row.quantite),
  }
}

function mapCommande(
  row: OrderRow,
  items: LigneCommande[],
  shippingAddress: AdresseCommande | null,
): Commande {
  return {
    id: Number(row.id),
    status: row.status,
    createdAt: row.created_at,
    total: Number(row.total),
    userId: Number(row.user_id),
    telephone: row.telephone,
    shippingAddress,
    items,
  }
}

export class OrderRepository {
  private async getItemsByOrderId(orderId: number) {
    const rows = await dbClient.query<OrderItemRow[]>({
      table: "order_items",
      method: "select",
      select: "*",
      filters: { order_id: orderId },
    })
    return rows.map(mapLigneCommande)
  }

  private async getAddressById(addressId: number | null) {
    if (!addressId) {
      return null
    }

    const row = await dbClient.query<AdresseRow | null>({
      table: "addresses",
      method: "select",
      select: "*",
      filters: { id: addressId },
      single: true,
    })

    if (!row) {
      return null
    }

    return mapAdresse(row)
  }

  async findAll(filters: FindOrdersFilters = {}) {
    const queryFilters: Record<string, string | number> = {}

    if (filters.userId !== undefined) {
      queryFilters.user_id = filters.userId
    }

    if (filters.telephone) {
      queryFilters.telephone = filters.telephone
    }

    const rows = await dbClient.query<OrderRow[]>({
      table: "orders",
      method: "select",
      select: "*",
      filters: Object.keys(queryFilters).length > 0 ? queryFilters : undefined,
    })

    const sortedRows = [...rows].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

    return Promise.all(
      sortedRows.map(async (row) => {
        const [items, address] = await Promise.all([
          this.getItemsByOrderId(Number(row.id)),
          this.getAddressById(row.shipping_address_id),
        ])

        return mapCommande(row, items, address)
      }),
    )
  }

  async findById(id: number) {
    const row = await dbClient.query<OrderRow | null>({
      table: "orders",
      method: "select",
      select: "*",
      filters: { id },
      single: true,
    })

    if (!row) {
      return null
    }

    const [items, address] = await Promise.all([
      this.getItemsByOrderId(id),
      this.getAddressById(row.shipping_address_id),
    ])

    return mapCommande(row, items, address)
  }

  async create(order: CreateOrderInput) {
    return dbClient.transaction(async (tx) => {
      const addresses = await tx.query<AdresseRow[]>({
        table: "addresses",
        method: "insert",
        body: {
          user_id: order.userId,
          latitude: order.shippingAddress.latitude ?? null,
          longitude: order.shippingAddress.longitude ?? null,
          country: order.shippingAddress.country,
          city: order.shippingAddress.city,
          street: order.shippingAddress.street,
          postal_code: order.shippingAddress.postalCode,
          is_default: false,
        },
      })

      const shippingAddress = addresses[0]

      const createdOrders = await tx.query<OrderRow[]>({
        table: "orders",
        method: "insert",
        body: {
          user_id: order.userId,
          telephone: order.telephone,
          status: order.status ?? StatusCommandeEnum.EN_COURS,
          total: order.total,
          shipping_address_id: shippingAddress.id,
        },
      })

      const createdOrder = createdOrders[0]

      const orderItemsPayload = order.items.map((item) => ({
        order_id: createdOrder.id,
        product_id: item.productId,
        quantite: item.quantite,
      }))

      await tx.query<OrderItemRow[]>({
        table: "order_items",
        method: "insert",
        body: orderItemsPayload,
      })

      return this.findById(createdOrder.id)
    })
  }

  async updateStatus(id: number, status: StatusCommande) {
    const rows = await dbClient.query<OrderRow[]>({
      table: "orders",
      method: "update",
      filters: { id },
      body: { status },
    })

    if (!rows[0]) {
      return null
    }

    return this.findById(id)
  }

  async delete(id: number) {
    return dbClient.transaction(async (tx) => {
      await tx.query<OrderItemRow[]>({
        table: "order_items",
        method: "delete",
        filters: { order_id: id },
      })

      const rows = await tx.query<OrderRow[]>({
        table: "orders",
        method: "delete",
        filters: { id },
      })

      return rows.length > 0
    })
  }
}

export const orderRepository = new OrderRepository()
