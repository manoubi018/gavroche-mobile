"use client"

import Link from "next/link"
import { startTransition, useMemo, useState } from "react"
import { Eye, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react"

import { DetailDialog } from "@/components/dashboard/detail-dialog"
import type { Product } from "@/features/products/types"
import { toUserFacingErrorMessage } from "@/lib/user-facing-error"
import { formatPrice } from "@/lib/utils"

async function extractError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null

  throw new Error(toUserFacingErrorMessage(payload?.message))
}

export function ProductManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [detailsProductId, setDetailsProductId] = useState<number | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const [productSort, setProductSort] = useState("name-asc")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const visibleProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase()

    return [...products]
      .filter((product) => {
        if (!term) return true

        return [
          product.nom,
          product.category?.name,
          product.description,
          product.unite,
          product.active ? "actif" : "inactif",
        ].some((value) => String(value ?? "").toLowerCase().includes(term))
      })
      .sort((first, second) => {
        switch (productSort) {
          case "price-asc":
            return Number(first.prix) - Number(second.prix)
          case "price-desc":
            return Number(second.prix) - Number(first.prix)
          case "stock-asc":
            return Number(first.stock) - Number(second.stock)
          case "stock-desc":
            return Number(second.stock) - Number(first.stock)
          default:
            return first.nom.localeCompare(second.nom)
        }
      })
  }, [products, productSearch, productSort])

  const detailsProduct =
    products.find((product) => product.id === detailsProductId) ?? null

  async function refreshProducts() {
    const response = await fetch("/api/admin/products", {
      credentials: "same-origin",
    })

    if (!response.ok) await extractError(response)

    setProducts((await response.json()) as Product[])
  }

  async function handleDelete(productId: number) {
    if (!window.confirm("Supprimer ce livre ?")) return

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        credentials: "same-origin",
      })

      if (!response.ok) await extractError(response)

      setStatusMessage("Produit supprime.")
      startTransition(() => {
        refreshProducts().catch((error: Error) => setStatusMessage(error.message))
      })
    } catch (error) {
      setStatusMessage(
        toUserFacingErrorMessage(
          error instanceof Error ? error.message : "Suppression impossible",
        ),
      )
    }
  }

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-white/60 bg-white/88 p-4 shadow-[var(--shadow)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)] sm:tracking-[0.24em]">
            Inventaire
          </p>
          <h2 className="mt-2 text-lg font-semibold sm:mt-3 sm:text-xl">
            Livres existants
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white sm:rounded-2xl sm:px-4"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Link>
          <button
            type="button"
            aria-label="Rafraichir les livres"
            onClick={() =>
              startTransition(() => {
                refreshProducts().catch((error: Error) => setStatusMessage(error.message))
              })
            }
            className="rounded-xl border border-[var(--border)] bg-white p-2 text-[var(--foreground)] sm:rounded-2xl"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {statusMessage ? (
        <div className="mt-4 rounded-xl bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)]">
          {statusMessage}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]">
        <input
          type="search"
          value={productSearch}
          onChange={(event) => setProductSearch(event.target.value)}
          placeholder="Rechercher un livre..."
          className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)] sm:rounded-2xl"
        />
        <select
          value={productSort}
          onChange={(event) => setProductSort(event.target.value)}
          className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)] sm:rounded-2xl"
        >
          <option value="name-asc">Nom A-Z</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix decroissant</option>
          <option value="stock-asc">Stock faible</option>
          <option value="stock-desc">Stock eleve</option>
        </select>
      </div>

      <div className="mt-5 max-w-full overflow-x-auto rounded-2xl border border-[var(--border)] bg-white sm:rounded-[24px]">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm md:min-w-[860px]">
          <thead className="bg-[var(--muted)] text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Produit</th>
              <th className="px-4 py-3 font-semibold">Categorie</th>
              <th className="px-4 py-3 font-semibold">Prix</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {visibleProducts.map((product) => (
              <tr key={product.id} className="align-top">
                <td className="px-4 py-4">
                  <div className="flex min-w-[190px] items-center gap-3">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt={product.nom}
                        className="h-12 w-12 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--muted)] text-[10px] text-[var(--muted-foreground)]">
                        No image
                      </div>
                    )}
                    <span className="min-w-0 max-w-[170px] truncate font-semibold md:max-w-[230px]">
                      {product.nom}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">{product.category?.name ?? "Non definie"}</td>
                <td className="px-4 py-4">{formatPrice(product.prix)}</td>
                <td className="px-4 py-4">
                  {product.stock} {product.unite}
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
                    {product.active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex min-w-[230px] flex-wrap gap-2 md:min-w-[300px]">
                    <button
                      type="button"
                      onClick={() => setDetailsProductId(product.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-2.5 py-2 text-xs font-medium md:rounded-2xl md:px-3 md:text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </button>
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-2.5 py-2 text-xs font-medium md:rounded-2xl md:px-3 md:text-sm"
                    >
                      <Pencil className="h-4 w-4" />
                      Modifier
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-medium text-red-700 md:rounded-2xl md:px-3 md:text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visibleProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                  Aucun livre ne correspond a la recherche.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {detailsProduct ? (
        <DetailDialog
          title={detailsProduct.nom}
          subtitle="Details livre"
          onClose={() => setDetailsProductId(null)}
        >
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Categorie
              </p>
              <p className="mt-2 font-medium">{detailsProduct.category?.name ?? "Non definie"}</p>
            </div>
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Statut
              </p>
              <p className="mt-2 font-medium">{detailsProduct.active ? "Actif" : "Inactif"}</p>
            </div>
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Prix
              </p>
              <p className="mt-2 font-medium">{formatPrice(detailsProduct.prix)}</p>
            </div>
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Stock
              </p>
              <p className="mt-2 font-medium">
                {detailsProduct.stock} {detailsProduct.unite}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Description
              </p>
              <p className="mt-2 leading-6">{detailsProduct.description || "Aucune description."}</p>
            </div>
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Image
              </p>
              <p className="mt-2 break-all leading-6">{detailsProduct.image ?? "Aucune image."}</p>
            </div>
          </div>
        </DetailDialog>
      ) : null}
    </section>
  )
}
