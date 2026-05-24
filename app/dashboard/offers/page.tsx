import { OfferManager } from "@/components/dashboard/offer-manager"
import { PageFrame } from "@/components/page-frame"
import { offerService } from "@/features/offers/service"
import { productService } from "@/features/products/service"

export const dynamic = "force-dynamic"

export default async function OffersPage() {
  const [offers, products, relations] = await Promise.all([
    offerService.getOffers(),
    productService.getProducts(),
    offerService.getProductOfferRelations(),
  ])

  return (
    <PageFrame
      title="Offres"
      description="Creation des promotions, mise a jour des prix cibles et liaison avec les livres du catalogue."
    >
      <OfferManager
        initialOffers={offers}
        initialProducts={products}
        initialRelations={relations}
      />
    </PageFrame>
  )
}
