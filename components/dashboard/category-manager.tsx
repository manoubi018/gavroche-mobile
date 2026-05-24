"use client"

import Link from "next/link"
import { startTransition, useMemo, useState } from "react"
import { Eye, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react"

import { DetailDialog } from "@/components/dashboard/detail-dialog"
import type { Category } from "@/features/categories/types"
import type { Product } from "@/features/products/types"
import { toUserFacingErrorMessage } from "@/lib/user-facing-error"
import { formatDate } from "@/lib/utils"

type DeleteMode = "cancel" | "delete-products" | "move-products"

async function extractError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null

  throw new Error(toUserFacingErrorMessage(payload?.message))
}

export function CategoryManager({
  initialCategories,
  initialProducts,
}: {
  initialCategories: Category[]
  initialProducts: Product[]
}) {
  const [categories, setCategories] = useState(initialCategories)
  const [products, setProducts] = useState(initialProducts)
  const [detailsCategoryId, setDetailsCategoryId] = useState<number | null>(null)
  const [categorySearch, setCategorySearch] = useState("")
  const [categorySort, setCategorySort] = useState("name-asc")
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null)
  const [deleteMode, setDeleteMode] = useState<DeleteMode>("cancel")
  const [replacementCategoryId, setReplacementCategoryId] = useState("")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const deleteCategory = categories.find((category) => category.id === deleteCategoryId) ?? null
  const deleteProductsCount = deleteCategory
    ? products.filter((product) => product.categoryId === deleteCategory.id).length
    : 0

  const productCounts = useMemo(() => {
    const counts = new Map<number, number>()
    for (const product of products) {
      if (product.categoryId) {
        counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1)
      }
    }
    return counts
  }, [products])

  const visibleCategories = useMemo(() => {
    const term = categorySearch.trim().toLowerCase()

    return [...categories]
      .filter((category) => {
        if (!term) return true

        return [
          category.name,
          category.slug,
          category.description,
          category.isActive ? "actif" : "inactif",
        ].some((value) => String(value ?? "").toLowerCase().includes(term))
      })
      .sort((first, second) => {
        switch (categorySort) {
          case "products-desc":
            return (productCounts.get(second.id) ?? 0) - (productCounts.get(first.id) ?? 0)
          case "products-asc":
            return (productCounts.get(first.id) ?? 0) - (productCounts.get(second.id) ?? 0)
          case "created-desc":
            return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
          case "created-asc":
            return new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
          case "status":
            return Number(second.isActive) - Number(first.isActive)
          default:
            return first.name.localeCompare(second.name)
        }
      })
  }, [categories, categorySearch, categorySort, productCounts])

  const detailsCategory =
    categories.find((category) => category.id === detailsCategoryId) ?? null

  async function refreshData() {
    const [categoriesResponse, productsResponse] = await Promise.all([
      fetch("/api/admin/categories", { credentials: "same-origin" }),
      fetch("/api/admin/products", { credentials: "same-origin" }),
    ])

    if (!categoriesResponse.ok) await extractError(categoriesResponse)
    if (!productsResponse.ok) await extractError(productsResponse)

    setCategories((await categoriesResponse.json()) as Category[])
    setProducts((await productsResponse.json()) as Product[])
  }

  function resetDeleteState() {
    setDeleteCategoryId(null)
    setDeleteMode("cancel")
    setReplacementCategoryId("")
  }

  async function confirmDelete() {
    if (!deleteCategory || deleteMode === "cancel") {
      resetDeleteState()
      return
    }

    setDeleting(true)
    setStatusMessage(null)

    try {
      const payload =
        deleteMode === "move-products"
          ? {
              mode: deleteMode,
              replacementCategoryId: Number(replacementCategoryId),
            }
          : { mode: deleteMode }

      const response = await fetch(`/api/admin/categories/${deleteCategory.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      })

      if (!response.ok) await extractError(response)

      setStatusMessage("Categorie supprimee.")
      resetDeleteState()
      startTransition(() => {
        refreshData().catch((error: Error) => setStatusMessage(error.message))
      })
    } catch (error) {
      setStatusMessage(
        toUserFacingErrorMessage(
          error instanceof Error ? error.message : "Suppression impossible",
        ),
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-white/60 bg-white/88 p-4 shadow-[var(--shadow)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)] sm:tracking-[0.24em]">
            Catalogue
          </p>
          <h2 className="mt-2 text-lg font-semibold sm:mt-3 sm:text-xl">
            Liste des categories
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/categories/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white sm:rounded-2xl sm:px-4"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Link>
          <button
            type="button"
            onClick={() =>
              startTransition(() => {
                refreshData().catch((error: Error) => setStatusMessage(error.message))
              })
            }
            className="rounded-xl border border-[var(--border)] bg-white p-2 text-[var(--foreground)] sm:rounded-2xl"
            aria-label="Rafraichir les categories"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {statusMessage ? (
        <div className="mt-5 rounded-xl bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)]">
          {statusMessage}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]">
        <input
          type="search"
          value={categorySearch}
          onChange={(event) => setCategorySearch(event.target.value)}
          placeholder="Rechercher une categorie..."
          className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)] sm:rounded-2xl"
        />
        <select
          value={categorySort}
          onChange={(event) => setCategorySort(event.target.value)}
          className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)] sm:rounded-2xl"
        >
          <option value="name-asc">Nom A-Z</option>
          <option value="products-desc">Plus de livres</option>
          <option value="products-asc">Moins de livres</option>
          <option value="created-desc">Plus recentes</option>
          <option value="created-asc">Plus anciennes</option>
          <option value="status">Actives d'abord</option>
        </select>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white sm:rounded-[24px]">
        <table className="w-full min-w-[780px] border-collapse text-left text-sm">
          <thead className="bg-[var(--muted)] text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Categorie</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Livres</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {visibleCategories.map((category) => {
              const count = productCounts.get(category.id) ?? 0

              return (
                <tr key={category.id}>
                  <td className="px-4 py-4 font-semibold">{category.name}</td>
                  <td className="px-4 py-4">{category.slug}</td>
                  <td className="px-4 py-4">{count} livre(s)</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
                      {category.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailsCategoryId(category.id)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        Details
                      </button>
                      <Link
                        href={`/dashboard/categories/${category.id}/edit`}
                        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium"
                      >
                        <Pencil className="h-4 w-4" />
                        Modifier
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteCategoryId(category.id)
                          setDeleteMode(count > 0 ? "cancel" : "delete-products")
                          setReplacementCategoryId("")
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {visibleCategories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                  Aucune categorie ne correspond a la recherche.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {detailsCategory ? (
        <DetailDialog
          title={detailsCategory.name}
          subtitle="Details categorie"
          onClose={() => setDetailsCategoryId(null)}
        >
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Slug
              </p>
              <p className="mt-2 font-medium">{detailsCategory.slug}</p>
            </div>
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Livres
              </p>
              <p className="mt-2 font-medium">
                {productCounts.get(detailsCategory.id) ?? 0} livre(s)
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Statut
              </p>
              <p className="mt-2 font-medium">{detailsCategory.isActive ? "Actif" : "Inactif"}</p>
            </div>
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Creee le
              </p>
              <p className="mt-2 font-medium">{formatDate(detailsCategory.createdAt)}</p>
            </div>
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Description
              </p>
              <p className="mt-2 leading-6">{detailsCategory.description || "Aucune description."}</p>
            </div>
          </div>
        </DetailDialog>
      ) : null}

      {deleteCategory ? (
        <section className="mt-5 rounded-2xl border border-red-200 bg-red-50/80 p-4 shadow-[var(--shadow)] backdrop-blur sm:p-6">
          <h2 className="text-lg font-semibold text-red-900">
            Supprimer "{deleteCategory.name}"
          </h2>
          <p className="mt-2 text-sm text-red-800">
            Cette categorie contient {deleteProductsCount} livre(s). Choisissez l'action a appliquer avant la suppression.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-red-950">Action</span>
              <select
                value={deleteMode}
                onChange={(event) => setDeleteMode(event.target.value as DeleteMode)}
                className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
              >
                <option value="cancel">Ne pas supprimer</option>
                <option value="delete-products">Supprimer la categorie et ses livres</option>
                <option value="move-products">Changer les livres vers une autre categorie</option>
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-red-950">Categorie de remplacement</span>
              <select
                value={replacementCategoryId}
                onChange={(event) => setReplacementCategoryId(event.target.value)}
                disabled={deleteMode !== "move-products"}
                className="w-full rounded-2xl border bg-white px-4 py-3 outline-none disabled:opacity-50"
              >
                <option value="">Selectionner</option>
                {categories
                  .filter((category) => category.id !== deleteCategory.id)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </label>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={resetDeleteState}
                className="rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-900"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={
                  deleting ||
                  deleteMode === "cancel" ||
                  (deleteMode === "move-products" && !replacementCategoryId)
                }
                className="rounded-2xl bg-red-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                Confirmer
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </section>
  )
}
