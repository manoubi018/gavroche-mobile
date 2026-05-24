import { notFound } from "next/navigation"

import { ProductForm } from "@/components/dashboard/product-form"
import { PageFrame } from "@/components/page-frame"
import { categoryService } from "@/features/categories/service"
import { productService } from "@/features/products/service"

export const dynamic = "force-dynamic"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const id = Number(productId)

  if (!Number.isInteger(id) || id <= 0) {
    notFound()
  }

  const [product, categories] = await Promise.all([
    productService.getProductById(id).catch(() => null),
    categoryService.getCategories(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <PageFrame
      title="Modifier le livre"
      description="Formulaire de mise a jour du livre."
    >
      <ProductForm product={product} categories={categories} />
    </PageFrame>
  )
}
