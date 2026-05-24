import { CategoryManager } from "@/components/dashboard/category-manager"
import { PageFrame } from "@/components/page-frame"
import { categoryService } from "@/features/categories/service"
import { productService } from "@/features/products/service"

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([
    categoryService.getCategories(),
    productService.getProducts(),
  ])

  return (
    <PageFrame
      title="Categories"
      description="Categories du catalogue et livres rattaches."
    >
      <CategoryManager initialCategories={categories} initialProducts={products} />
    </PageFrame>
  )
}
