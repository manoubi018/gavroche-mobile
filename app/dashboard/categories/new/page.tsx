import { CategoryForm } from "@/components/dashboard/category-form"
import { PageFrame } from "@/components/page-frame"

export const dynamic = "force-dynamic"

export default function NewCategoryPage() {
  return (
    <PageFrame
      title="Ajouter une categorie"
      description="Formulaire de creation de categorie."
    >
      <CategoryForm />
    </PageFrame>
  )
}
