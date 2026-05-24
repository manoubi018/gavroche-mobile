"use client"

import type { ChangeEvent, FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Plus, Upload } from "lucide-react"

import type { Category } from "@/features/categories/types"
import type { Product } from "@/features/products/types"
import { toUserFacingErrorMessage } from "@/lib/user-facing-error"

const emptyProductForm = {
  nom: "",
  description: "",
  prix: "",
  stock: "",
  unite: "kg",
  categoryId: "",
  image: "",
  active: true,
}

type ProductFormState = typeof emptyProductForm

async function extractError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null

  throw new Error(toUserFacingErrorMessage(payload?.message))
}

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[]
  product?: Product
}) {
  const router = useRouter()
  const [form, setForm] = useState<ProductFormState>(() =>
    product
      ? {
          nom: product.nom,
          description: product.description ?? "",
          prix: String(product.prix),
          stock: String(product.stock),
          unite: product.unite,
          categoryId: product.categoryId ? String(product.categoryId) : "",
          image: product.image ?? "",
          active: product.active,
        }
      : emptyProductForm,
  )
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setStatusMessage(null)

    try {
      const payload = {
        nom: form.nom,
        description: form.description || undefined,
        prix: Number(form.prix),
        stock: Number(form.stock),
        unite: form.unite,
        categoryId: Number(form.categoryId),
        image: form.image || undefined,
        active: form.active,
      }

      const response = await fetch(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) await extractError(response)

      router.push("/dashboard/products")
      router.refresh()
    } catch (error) {
      setStatusMessage(toUserFacingErrorMessage(error instanceof Error ? error.message : null))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    setUploading(true)
    setStatusMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/cloudinary/upload", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      })

      if (!response.ok) await extractError(response)

      const payload = (await response.json()) as { url: string }
      setForm((current) => ({ ...current, image: payload.url }))
      setStatusMessage("Image envoyee sur Cloudinary.")
    } catch (error) {
      setStatusMessage(
        toUserFacingErrorMessage(
          error instanceof Error ? error.message : "Upload impossible",
        ),
      )
    } finally {
      setUploading(false)
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
            {product ? "Modifier le livre" : "Ajouter un livre"}
          </h2>
        </div>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium sm:rounded-2xl"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
      </div>

      {statusMessage ? (
        <div className="mt-5 rounded-2xl bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)]">
          {statusMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4 sm:mt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Nom</span>
            <input
              value={form.nom}
              onChange={(event) =>
                setForm((current) => ({ ...current, nom: event.target.value }))
              }
              required
              className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Unite</span>
            <input
              value={form.unite}
              onChange={(event) =>
                setForm((current) => ({ ...current, unite: event.target.value }))
              }
              required
              className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Categorie</span>
          <select
            value={form.categoryId}
            onChange={(event) =>
              setForm((current) => ({ ...current, categoryId: event.target.value }))
            }
            required
            className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
          >
            <option value="">Selectionner une categorie</option>
            {categories
              .filter((category) => category.isActive || category.id === product?.categoryId)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Description</span>
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            rows={4}
            className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Prix</span>
            <input
              value={form.prix}
              onChange={(event) =>
                setForm((current) => ({ ...current, prix: event.target.value }))
              }
              type="number"
              min="0"
              step="0.001"
              required
              className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Stock</span>
            <input
              value={form.stock}
              onChange={(event) =>
                setForm((current) => ({ ...current, stock: event.target.value }))
              }
              type="number"
              min="0"
              step="1"
              required
              className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Image Cloudinary</span>
            <input
              value={form.image}
              onChange={(event) =>
                setForm((current) => ({ ...current, image: event.target.value }))
              }
              placeholder="https://res.cloudinary.com/..."
              className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
            />
          </label>
          <div className="space-y-2 text-sm">
            <span className="font-medium">Upload</span>
            <label className="flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--muted)] px-4 text-sm font-medium">
              <Upload className="h-4 w-4" />
              {uploading ? "Envoi..." : "Choisir"}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-[var(--muted)] px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) =>
              setForm((current) => ({ ...current, active: event.target.checked }))
            }
          />
          Produit actif sur la boutique
        </label>

        <button
          type="submit"
          disabled={submitting || uploading}
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {product ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {product ? "Mettre a jour" : "Creer le livre"}
        </button>
      </form>
    </section>
  )
}
