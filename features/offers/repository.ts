import { dbClient } from "@/lib/db/client"

import type {
  ApplyOfferInput,
  CreateOfferInput,
  Offer,
  OfferProductRelation,
  UpdateOfferInput,
} from "./types"

type OfferRow = {
  id: number
  nom: string
  date_debut: string
  date_fin: string
  active: boolean
  nouveau_prix: number | string
}

type ProductOfferRow = {
  id: number
  product_id: number
  offer_id: number
}

type ProductRow = {
  id: number
  nom: string
}

function mapOffer(row: OfferRow): Offer {
  return {
    id: Number(row.id),
    nom: row.nom,
    dateDebut: row.date_debut,
    dateFin: row.date_fin,
    active: Boolean(row.active),
    nouveauPrix: Number(row.nouveau_prix),
  }
}

export class OfferRepository {
  async findAll() {
    const rows = await dbClient.query<OfferRow[]>({
      table: "offers",
      method: "select",
      select: "*",
    })
    return rows.map(mapOffer)
  }

  async findActive() {
    const rows = await dbClient.query<OfferRow[]>({
      table: "offers",
      method: "select",
      select: "*",
      filters: { active: true },
    })

    const now = new Date()
    return rows
      .map(mapOffer)
      .filter((offer) => {
        const start = new Date(offer.dateDebut)
        const end = new Date(offer.dateFin)
        return start <= now && end >= now
      })
  }

  async findById(id: number) {
    const row = await dbClient.query<OfferRow | null>({
      table: "offers",
      method: "select",
      select: "*",
      filters: { id },
      single: true,
    })

    if (!row) {
      return null
    }

    return mapOffer(row)
  }

  async create(offer: CreateOfferInput) {
    const rows = await dbClient.query<OfferRow[]>({
      table: "offers",
      method: "insert",
      body: {
        nom: offer.nom,
        date_debut: offer.dateDebut,
        date_fin: offer.dateFin,
        active: offer.active ?? true,
        nouveau_prix: offer.nouveauPrix,
      },
    })
    return mapOffer(rows[0])
  }

  async update(id: number, data: UpdateOfferInput) {
    const payload: Record<string, unknown> = {}

    if (data.nom !== undefined) payload.nom = data.nom
    if (data.dateDebut !== undefined) payload.date_debut = data.dateDebut
    if (data.dateFin !== undefined) payload.date_fin = data.dateFin
    if (data.active !== undefined) payload.active = data.active
    if (data.nouveauPrix !== undefined) payload.nouveau_prix = data.nouveauPrix

    const rows = await dbClient.query<OfferRow[]>({
      table: "offers",
      method: "update",
      filters: { id },
      body: payload,
    })

    if (!rows[0]) {
      return null
    }

    return mapOffer(rows[0])
  }

  async delete(id: number) {
    const rows = await dbClient.query<OfferRow[]>({
      table: "offers",
      method: "delete",
      filters: { id },
    })
    return rows.length > 0
  }

  async setActive(id: number, active: boolean) {
    const rows = await dbClient.query<OfferRow[]>({
      table: "offers",
      method: "update",
      filters: { id },
      body: { active },
    })

    if (!rows[0]) {
      return null
    }

    return mapOffer(rows[0])
  }

  async attachToProduct(productId: number, offerId: number) {
    const rows = await dbClient.query<ProductOfferRow[]>({
      table: "product_offers",
      method: "insert",
      body: {
        product_id: productId,
        offer_id: offerId,
      },
    })

    return rows[0]
  }

  async detachFromProduct(productId: number, offerId: number) {
    const rows = await dbClient.query<ProductOfferRow[]>({
      table: "product_offers",
      method: "delete",
      filters: {
        product_id: productId,
        offer_id: offerId,
      },
    })

    return rows.length > 0
  }

  async listProductOfferRelations(): Promise<OfferProductRelation[]> {
    const [relations, products, offers] = await Promise.all([
      dbClient.query<ProductOfferRow[]>({
        table: "product_offers",
        method: "select",
        select: "*",
      }),
      dbClient.query<ProductRow[]>({
        table: "products",
        method: "select",
        select: "id,nom",
      }),
      dbClient.query<OfferRow[]>({
        table: "offers",
        method: "select",
        select: "id,nom,date_debut,date_fin,active,nouveau_prix",
      }),
    ])

    return relations
      .map((relation) => {
        const product = products.find(
          (candidate) => Number(candidate.id) === Number(relation.product_id),
        )
        const offer = offers.find(
          (candidate) => Number(candidate.id) === Number(relation.offer_id),
        )

        if (!product || !offer) {
          return null
        }

        return {
          id: Number(relation.id),
          productId: Number(relation.product_id),
          productName: product.nom,
          offerId: Number(relation.offer_id),
          offerName: offer.nom,
        }
      })
      .filter((relation): relation is OfferProductRelation => relation !== null)
  }
}

export const offerRepository = new OfferRepository()
