"use client"

import type { FormEvent } from "react"
import { startTransition, useMemo, useState } from "react"
import { Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react"

import type { Offer, OfferProductRelation } from "@/features/offers/types"
import type { Product } from "@/features/products/types"
import { toUserFacingErrorMessage } from "@/lib/user-facing-error"
import { formatPrice } from "@/lib/utils"

const emptyOfferForm = {
  nom: "",
  dateDebut: "",
  dateFin: "",
  nouveauPrix: "",
  active: true,
}

type OfferForm = typeof emptyOfferForm

async function readOfferError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null

  throw new Error(toUserFacingErrorMessage(payload?.message))
}

export function OfferManager({
  initialOffers,
  initialProducts,
  initialRelations,
}: {
  initialOffers: Offer[]
  initialProducts: Product[]
  initialRelations: OfferProductRelation[]
}) {
  const [offers, setOffers] = useState(initialOffers)
  const [relations, setRelations] = useState(initialRelations)
  const [form, setForm] = useState<OfferForm>(emptyOfferForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [offerProductId, setOfferProductId] = useState<number | "">("")
  const [offerProductSearch, setOfferProductSearch] = useState("")
  const [showProductSuggestions, setShowProductSuggestions] = useState(false)

  const selectedProduct = useMemo(
    () =>
      typeof offerProductId === "number"
        ? initialProducts.find((product) => product.id === offerProductId) ?? null
        : null,
    [initialProducts, offerProductId],
  )

  const filteredProducts = useMemo(() => {
    const query = offerProductSearch.trim().toLowerCase()

    if (!query) {
      return initialProducts.slice(0, 8)
    }

    return initialProducts
      .filter((product) => product.nom.toLowerCase().includes(query))
      .slice(0, 8)
  }, [initialProducts, offerProductSearch])

  function getOfferRelation(offerId: number) {
    return relations.find((relation) => relation.offerId === offerId) ?? null
  }

  async function refreshAll() {
    const [offersResponse, relationsResponse] = await Promise.all([
      fetch("/api/admin/offers", { credentials: "same-origin" }),
      fetch("/api/admin/offers/relations", { credentials: "same-origin" }),
    ])

    if (!offersResponse.ok) {
      await readOfferError(offersResponse)
    }

    if (!relationsResponse.ok) {
      await readOfferError(relationsResponse)
    }

    setOffers((await offersResponse.json()) as Offer[])
    setRelations((await relationsResponse.json()) as OfferProductRelation[])
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyOfferForm)
    setOfferProductId("")
    setOfferProductSearch("")
    setShowProductSuggestions(false)
  }

  async function saveSingleProductRelation(offerId: number, productId: number) {
    const currentRelations = relations.filter((relation) => relation.offerId === offerId)

    await Promise.all(
      currentRelations
        .filter((relation) => relation.productId !== productId)
        .map((relation) =>
          fetch("/api/admin/offers/detach-from-product", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "same-origin",
            body: JSON.stringify({
              offerId,
              productId: relation.productId,
            }),
          }).then(async (response) => {
            if (!response.ok) {
              await readOfferError(response)
            }
          }),
        ),
    )

    const relationExists = currentRelations.some(
      (relation) => relation.productId === productId,
    )

    if (relationExists) {
      return
    }

    const attachResponse = await fetch("/api/admin/offers/apply-to-product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        offerId,
        productId,
      }),
    })

    if (!attachResponse.ok) {
      await readOfferError(attachResponse)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatusMessage(null)

    if (!offerProductId) {
      setStatusMessage("Selectionnez le livre de cette offre.")
      return
    }

    try {
      const payload = {
        nom: selectedProduct?.nom ?? form.nom,
        dateDebut: form.dateDebut,
        dateFin: form.dateFin,
        nouveauPrix: Number(form.nouveauPrix),
        active: form.active,
      }

      const response = await fetch(
        editingId ? `/api/admin/offers/${editingId}` : "/api/admin/offers",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        await readOfferError(response)
      }

      const savedOffer = (await response.json()) as Offer
      await saveSingleProductRelation(savedOffer.id, Number(offerProductId))

      setStatusMessage(editingId ? "Offre mise a jour." : "Offre creee.")
      resetForm()
      startTransition(() => {
        refreshAll().catch((error: Error) => setStatusMessage(error.message))
      })
    } catch (error) {
      setStatusMessage(toUserFacingErrorMessage(error instanceof Error ? error.message : null))
    }
  }

  async function handleDelete(offerId: number) {
    const confirmed = window.confirm("Supprimer cette offre ?")

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(`/api/admin/offers/${offerId}`, {
        method: "DELETE",
        credentials: "same-origin",
      })

      if (!response.ok) {
        await readOfferError(response)
      }

      setStatusMessage("Offre supprimee.")
      startTransition(() => {
        refreshAll().catch((error: Error) => setStatusMessage(error.message))
      })
    } catch (error) {
      setStatusMessage(toUserFacingErrorMessage(error instanceof Error ? error.message : "Suppression impossible"))
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[28px] border border-white/60 bg-white/88 p-6 shadow-[var(--shadow)] backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
              Promotions
            </p>
            <h2 className="mt-3 text-xl font-semibold">Creer ou modifier une offre</h2>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium"
          >
            Nouvelle
          </button>
        </div>

        {statusMessage ? (
          <div className="mt-5 rounded-2xl bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)]">
            {statusMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Produit de l'offre</span>
            <div className="relative">
              <input
                value={selectedProduct?.nom ?? form.nom}
                onChange={(event) => {
                  const value = event.target.value
                  setForm((current) => ({ ...current, nom: value }))
                  setOfferProductSearch(value)
                  setOfferProductId("")
                  setShowProductSuggestions(true)
                }}
                onFocus={() => {
                  setOfferProductSearch(form.nom)
                  setShowProductSuggestions(true)
                }}
                onBlur={() => {
                  window.setTimeout(() => setShowProductSuggestions(false), 120)
                }}
                required
                placeholder="Rechercher un livre"
                className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
              />

              {showProductSuggestions ? (
                <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-2 shadow-lg">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setOfferProductId(product.id)
                          setOfferProductSearch(product.nom)
                          setForm((current) => ({ ...current, nom: product.nom }))
                          setShowProductSuggestions(false)
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition hover:bg-[var(--muted)]"
                      >
                        <span className="font-medium">{product.nom}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          Stock: {product.stock}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-sm text-[var(--muted-foreground)]">
                      Aucun livre ne correspond a la recherche.
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Date debut</span>
              <input
                type="date"
                value={form.dateDebut}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dateDebut: event.target.value }))
                }
                required
                className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Date fin</span>
              <input
                type="date"
                value={form.dateFin}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dateFin: event.target.value }))
                }
                required
                className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Nouveau prix</span>
            <input
              type="number"
              min="0"
              step="0.001"
              value={form.nouveauPrix}
              onChange={(event) =>
                setForm((current) => ({ ...current, nouveauPrix: event.target.value }))
              }
              required
              className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl bg-[var(--muted)] px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                setForm((current) => ({ ...current, active: event.target.checked }))
              }
            />
            Offre active
          </label>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Mettre a jour l'offre" : "Creer l'offre"}
          </button>
        </form>
      </section>

      <section className="rounded-[28px] border border-white/60 bg-white/88 p-6 shadow-[var(--shadow)] backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
              Historique
            </p>
            <h2 className="mt-3 text-xl font-semibold">Offres par livre</h2>
          </div>
          <button
            type="button"
            onClick={() =>
              startTransition(() => {
                refreshAll().catch((error: Error) => setStatusMessage(error.message))
              })
            }
            className="rounded-2xl border border-[var(--border)] bg-white p-2 text-[var(--foreground)]"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {offers.map((offer) => {
            const relation = getOfferRelation(offer.id)

            return (
              <article
                key={offer.id}
                className="rounded-[24px] border border-[var(--border)] bg-white p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{relation?.productName ?? offer.nom}</h3>
                      <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
                        {offer.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                      Du {offer.dateDebut} au {offer.dateFin}
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      Prix promo: {formatPrice(offer.nouveauPrix)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(offer.id)
                        setForm({
                          nom: relation?.productName ?? offer.nom,
                          dateDebut: offer.dateDebut.slice(0, 10),
                          dateFin: offer.dateFin.slice(0, 10),
                          nouveauPrix: String(offer.nouveauPrix),
                          active: offer.active,
                        })
                        setOfferProductId(relation?.productId ?? "")
                        setOfferProductSearch(relation?.productName ?? offer.nom)
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium"
                    >
                      <Pencil className="h-4 w-4" />
                      Editer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(offer.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
