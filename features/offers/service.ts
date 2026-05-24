import { HttpError } from "@/lib/errors/http-error"

import { offerRepository } from "./repository"
import type { ApplyOfferInput, CreateOfferInput, UpdateOfferInput } from "./types"

export class OfferService {
  async getOffers() {
    return offerRepository.findAll()
  }

  async getActiveOffers() {
    return offerRepository.findActive()
  }

  async getOfferById(id: number) {
    const offer = await offerRepository.findById(id)
    if (!offer) {
      throw new HttpError(404, "Offer not found")
    }
    return offer
  }

  async createOffer(input: CreateOfferInput) {
    return offerRepository.create(input)
  }

  async updateOffer(id: number, input: UpdateOfferInput) {
    const offer = await offerRepository.update(id, input)
    if (!offer) {
      throw new HttpError(404, "Offer not found")
    }
    return offer
  }

  async deleteOffer(id: number) {
    const deleted = await offerRepository.delete(id)
    if (!deleted) {
      throw new HttpError(404, "Offer not found")
    }
  }

  async disableOffer(id: number) {
    const offer = await offerRepository.setActive(id, false)
    if (!offer) {
      throw new HttpError(404, "Offer not found")
    }
    return offer
  }

  async applyOfferToProduct(input: ApplyOfferInput) {
    await this.getOfferById(input.offerId)
    return offerRepository.attachToProduct(input.productId, input.offerId)
  }

  async detachOfferFromProduct(input: ApplyOfferInput) {
    const detached = await offerRepository.detachFromProduct(
      input.productId,
      input.offerId,
    )

    if (!detached) {
      throw new HttpError(404, "Offer relation not found for this product")
    }
  }

  async getProductOfferRelations() {
    return offerRepository.listProductOfferRelations()
  }
}

export const offerService = new OfferService()
