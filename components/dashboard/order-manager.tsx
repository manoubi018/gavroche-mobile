"use client"

import { startTransition, useMemo, useState } from "react"
import { Eye, RefreshCcw, Trash2 } from "lucide-react"

import { StatusCommande, type Commande } from "@/features/orders/types"
import { DetailDialog } from "@/components/dashboard/detail-dialog"
import { toUserFacingErrorMessage } from "@/lib/user-facing-error"
import { formatDate, formatPrice } from "@/lib/utils"

const statusOptions = Object.values(StatusCommande)

async function readError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null

  throw new Error(toUserFacingErrorMessage(payload?.message))
}

function getAddressLabel(order: Commande) {
  return order.shippingAddress
    ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.country}`
    : "Adresse non definie"
}

export function OrderManager({ initialOrders }: { initialOrders: Commande[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [detailsOrderId, setDetailsOrderId] = useState<number | null>(null)
  const [orderSearch, setOrderSearch] = useState("")
  const [orderSort, setOrderSort] = useState("date-desc")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const visibleOrders = useMemo(() => {
    const term = orderSearch.trim().toLowerCase()

    return [...orders]
      .filter((order) => {
        if (!term) return true

        return [
          order.id,
          order.telephone,
          order.status,
          order.total,
          getAddressLabel(order),
        ].some((value) => String(value ?? "").toLowerCase().includes(term))
      })
      .sort((first, second) => {
        switch (orderSort) {
          case "date-asc":
            return new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
          case "total-desc":
            return Number(second.total) - Number(first.total)
          case "total-asc":
            return Number(first.total) - Number(second.total)
          case "status":
            return String(first.status).localeCompare(String(second.status))
          default:
            return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
        }
      })
  }, [orderSearch, orderSort, orders])

  const detailsOrder = orders.find((order) => order.id === detailsOrderId) ?? null

  async function refreshOrders() {
    const response = await fetch("/api/admin/orders", {
      credentials: "same-origin",
    })

    if (!response.ok) {
      await readError(response)
    }

    const payload = (await response.json()) as Commande[]
    setOrders(payload)
  }

  async function updateStatus(orderId: number, status: StatusCommande) {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        await readError(response)
      }

      setStatusMessage("Statut de commande mis a jour.")
      startTransition(() => {
        refreshOrders().catch((error: Error) => setStatusMessage(error.message))
      })
    } catch (error) {
      setStatusMessage(toUserFacingErrorMessage(error instanceof Error ? error.message : "Mise a jour impossible"))
    }
  }

  async function deleteOrder(orderId: number) {
    const confirmed = window.confirm("Supprimer cette commande ?")

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        credentials: "same-origin",
      })

      if (!response.ok) {
        await readError(response)
      }

      setStatusMessage("Commande supprimee.")
      startTransition(() => {
        refreshOrders().catch((error: Error) => setStatusMessage(error.message))
      })
    } catch (error) {
      setStatusMessage(toUserFacingErrorMessage(error instanceof Error ? error.message : "Suppression impossible"))
    }
  }

  return (
    <section className="rounded-[28px] border border-white/60 bg-white/88 p-6 shadow-[var(--shadow)] backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
            Fulfillment
          </p>
          <h2 className="mt-3 text-xl font-semibold">Suivi et mise a jour des commandes</h2>
        </div>
        <button
          type="button"
          onClick={() =>
            startTransition(() => {
              refreshOrders().catch((error: Error) => setStatusMessage(error.message))
            })
          }
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium"
        >
          <RefreshCcw className="h-4 w-4" />
          Rafraichir
        </button>
      </div>

      {statusMessage ? (
        <div className="mt-5 rounded-2xl bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)]">
          {statusMessage}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]">
        <input
          type="search"
          value={orderSearch}
          onChange={(event) => setOrderSearch(event.target.value)}
          placeholder="Rechercher une commande..."
          className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)] sm:rounded-2xl"
        />
        <select
          value={orderSort}
          onChange={(event) => setOrderSort(event.target.value)}
          className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)] sm:rounded-2xl"
        >
          <option value="date-desc">Plus recentes</option>
          <option value="date-asc">Plus anciennes</option>
          <option value="total-desc">Total eleve</option>
          <option value="total-asc">Total faible</option>
          <option value="status">Statut</option>
        </select>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white sm:rounded-[24px]">
        <table className="w-full min-w-[920px] border-collapse text-left text-sm">
          <thead className="bg-[var(--muted)] text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Commande</th>
              <th className="px-4 py-3 font-semibold">Telephone</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {visibleOrders.map((order) => (
              <tr key={order.id} className="align-top">
                <td className="px-4 py-4 font-semibold">#{order.id}</td>
                <td className="px-4 py-4">{order.telephone}</td>
                <td className="px-4 py-4">{formatPrice(order.total)}</td>
                <td className="px-4 py-4">
                  <select
                    value={order.status}
                    onChange={(event) =>
                      updateStatus(order.id, event.target.value as StatusCommande)
                    }
                    className="w-full rounded-2xl border bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-4">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailsOrderId(order.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteOrder(order.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visibleOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                  Aucune commande ne correspond a la recherche.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {detailsOrder ? (
        <DetailDialog
          title={`Commande #${detailsOrder.id}`}
          subtitle="Details commande"
          onClose={() => setDetailsOrderId(null)}
        >
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Telephone
              </p>
              <p className="mt-2 font-medium">{detailsOrder.telephone}</p>
            </div>
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Total
              </p>
              <p className="mt-2 font-medium">{formatPrice(detailsOrder.total)}</p>
            </div>
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Statut
              </p>
              <p className="mt-2 font-medium">{detailsOrder.status}</p>
            </div>
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Date
              </p>
              <p className="mt-2 font-medium">{formatDate(detailsOrder.createdAt)}</p>
            </div>
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Adresse
              </p>
              <p className="mt-2 leading-6">{getAddressLabel(detailsOrder)}</p>
            </div>
            <div className="rounded-2xl bg-[var(--muted)] px-4 py-3 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Articles
              </p>
              <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--border)] bg-white">
                <table className="w-full min-w-[360px] text-left text-sm">
                  <thead className="bg-[var(--muted)] text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Produit ID</th>
                      <th className="px-3 py-2 font-semibold">Quantite</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {detailsOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2">#{item.productId}</td>
                        <td className="px-3 py-2">{item.quantite}</td>
                      </tr>
                    ))}
                    {detailsOrder.items.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-3 py-4 text-center text-[var(--muted-foreground)]">
                          Aucun article.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DetailDialog>
      ) : null}
    </section>
  )
}
