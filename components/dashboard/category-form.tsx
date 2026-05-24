"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Plus } from "lucide-react"

import type { Category } from "@/features/categories/types"
import { toUserFacingErrorMessage } from "@/lib/user-facing-error"

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  isActive: true,
}

type FormState = typeof emptyForm

async function extractError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null

  throw new Error(toUserFacingErrorMessage(payload?.message))
}

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(() =>
    category
      ? {
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          isActive: category.isActive,
        }
      : emptyForm,
  )
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setStatusMessage(null)

    try {
      const response = await fetch(
        category ? `/api/admin/categories/${category.id}` : "/api/admin/categories",
        {
          method: category ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            name: form.name,
            slug: form.slug || undefined,
            description: form.description || undefined,
            isActive: form.isActive,
          }),
        },
      )

      if (!response.ok) await extractError(response)

      router.push("/dashboard/categories")
      router.refresh()
    } catch (error) {
      setStatusMessage(toUserFacingErrorMessage(error instanceof Error ? error.message : null))
    } finally {
      setSubmitting(false)
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
            {category ? "Modifier une categorie" : "Ajouter une categorie"}
          </h2>
        </div>
        <Link
          href="/dashboard/categories"
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
        <label className="space-y-2 text-sm">
          <span className="font-medium">Nom</span>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
            className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Slug URL</span>
          <input
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            placeholder="romans"
            className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
          />
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

        <label className="flex items-center gap-3 rounded-2xl bg-[var(--muted)] px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((current) => ({ ...current, isActive: event.target.checked }))
            }
          />
          Categorie active dans la boutique
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {category ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {category ? "Mettre a jour" : "Ajouter"}
        </button>
      </form>
    </section>
  )
}
