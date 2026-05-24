import { ProductForm } from "@/components/dashboard/product-form"
import { PageFrame } from "@/components/page-frame"
import { categoryService } from "@/features/categories/service"

export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  const categories = await categoryService.getCategories()

  return (
    <PageFrame
      title="Ajouter un livre"
      description="Formulaire de creation du livre."
    >
      <ProductForm categories={categories} />
    </PageFrame>
  )
}
