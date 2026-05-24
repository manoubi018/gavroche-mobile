import { notFound } from "next/navigation"

import { CategoryForm } from "@/components/dashboard/category-form"
import { PageFrame } from "@/components/page-frame"
import { categoryService } from "@/features/categories/service"

export const dynamic = "force-dynamic"

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = await params
  const id = Number(categoryId)

  if (!Number.isInteger(id) || id <= 0) {
    notFound()
  }

  const category = await categoryService.getCategoryById(id).catch(() => null)

  if (!category) {
    notFound()
  }

  return (
    <PageFrame
      title="Modifier la categorie"
      description="Formulaire de mise a jour de categorie."
    >
      <CategoryForm category={category} />
    </PageFrame>
  )
}
