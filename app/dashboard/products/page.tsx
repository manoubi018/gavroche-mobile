import { ProductManager } from "@/components/dashboard/product-manager"
import { PageFrame } from "@/components/page-frame"
import { productService } from "@/features/products/service"

export const dynamic = "force-dynamic"

export default async function ProductsPage() {
  const products = await productService.getProducts()

  return (
    <PageFrame
      title="Livres"
      description="Catalogue, stock, prix et images."
    >
      <ProductManager initialProducts={products} />
    </PageFrame>
  )
}
