export interface Offer {
  id: number
  nom: string
  dateDebut: string
  dateFin: string
  active: boolean
  nouveauPrix: number
}

export interface CreateOfferInput {
  nom: string
  dateDebut: string
  dateFin: string
  active?: boolean
  nouveauPrix: number
}

export interface UpdateOfferInput {
  nom?: string
  dateDebut?: string
  dateFin?: string
  active?: boolean
  nouveauPrix?: number
}

export interface ApplyOfferInput {
  productId: number
  offerId: number
}

export interface OfferProductRelation {
  id: number
  productId: number
  productName: string
  offerId: number
  offerName: string
}
