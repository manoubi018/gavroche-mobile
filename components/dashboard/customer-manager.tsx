"use client"

import { startTransition, useMemo, useState } from "react"
import { RefreshCcw, Trash2 } from "lucide-react"

import { Role, type User } from "@/features/users/types"
import { toUserFacingErrorMessage } from "@/lib/user-facing-error"
import { formatDate, initials } from "@/lib/utils"

async function extractCustomerError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null

  throw new Error(toUserFacingErrorMessage(payload?.message))
}

export function CustomerManager({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [userSearch, setUserSearch] = useState("")
  const [userSort, setUserSort] = useState("name-asc")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const visibleUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase()

    return [...users]
      .filter((user) => {
        if (!term) return true

        return [
          user.nom,
          user.email,
          user.telephone,
          user.role,
          user.statut,
        ].some((value) => String(value ?? "").toLowerCase().includes(term))
      })
      .sort((first, second) => {
        switch (userSort) {
          case "created-desc":
            return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
          case "created-asc":
            return new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
          case "role":
            return String(first.role).localeCompare(String(second.role))
          case "status":
            return String(first.statut).localeCompare(String(second.statut))
          default:
            return first.nom.localeCompare(second.nom)
        }
      })
  }, [userSearch, userSort, users])

  async function refreshUsers() {
    const response = await fetch("/api/admin/users", {
      credentials: "same-origin",
    })

    if (!response.ok) {
      await extractCustomerError(response)
    }

    const payload = (await response.json()) as User[]
    setUsers(payload)
  }

  async function updateUser(userId: number, patch: Partial<User>) {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(patch),
      })

      if (!response.ok) {
        await extractCustomerError(response)
      }

      setStatusMessage("Compte utilisateur mis a jour.")
      startTransition(() => {
        refreshUsers().catch((error: Error) => setStatusMessage(error.message))
      })
    } catch (error) {
      setStatusMessage(
        toUserFacingErrorMessage(
          error instanceof Error ? error.message : "Mise a jour impossible",
        ),
      )
    }
  }

  async function deleteUser(userId: number) {
    const confirmed = window.confirm("Supprimer cet utilisateur ?")

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "same-origin",
      })

      if (!response.ok) {
        await extractCustomerError(response)
      }

      setStatusMessage("Utilisateur supprime.")
      startTransition(() => {
        refreshUsers().catch((error: Error) => setStatusMessage(error.message))
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
    <section className="rounded-2xl border border-white/60 bg-white p-4 shadow-[var(--shadow)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)] sm:tracking-[0.24em]">
            Comptes
          </p>
          <h2 className="mt-2 text-lg font-semibold sm:mt-3 sm:text-xl">
            Utilisateurs
          </h2>
        </div>
        <button
          type="button"
          onClick={() =>
            startTransition(() => {
              refreshUsers().catch((error: Error) => setStatusMessage(error.message))
            })
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium sm:rounded-2xl"
        >
          <RefreshCcw className="h-4 w-4" />
          Rafraichir
        </button>
      </div>

      {statusMessage ? (
        <div className="mt-5 rounded-xl bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)]">
          {statusMessage}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]">
        <input
          type="search"
          value={userSearch}
          onChange={(event) => setUserSearch(event.target.value)}
          placeholder="Rechercher un utilisateur..."
          className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)] sm:rounded-2xl"
        />
        <select
          value={userSort}
          onChange={(event) => setUserSort(event.target.value)}
          className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)] sm:rounded-2xl"
        >
          <option value="name-asc">Nom A-Z</option>
          <option value="created-desc">Plus recents</option>
          <option value="created-asc">Plus anciens</option>
          <option value="role">Role</option>
          <option value="status">Statut</option>
        </select>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="bg-[var(--muted)] text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Utilisateur</th>
              <th className="px-4 py-3 font-semibold">Telephone</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Inscription</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {visibleUsers.map((user) => (
              <tr key={user.id} className="align-middle">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-sm font-semibold text-[var(--primary)]">
                      {initials(user.nom)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--foreground)]">{user.nom}</p>
                      <p className="mt-1 max-w-[220px] truncate text-xs text-[var(--muted-foreground)]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">{user.telephone}</td>
                <td className="px-4 py-4">
                  <select
                    value={user.role}
                    onChange={(event) =>
                      updateUser(user.id, { role: event.target.value as Role })
                    }
                    className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
                  >
                    <option value={Role.CLIENT}>CLIENT</option>
                    <option value={Role.ADMIN}>ADMIN</option>
                  </select>
                </td>
                <td className="px-4 py-4">
                  <select
                    value={user.statut}
                    onChange={(event) =>
                      updateUser(user.id, { statut: event.target.value })
                    }
                    className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
                  >
                    <option value="active">active</option>
                    <option value="disabled">disabled</option>
                  </select>
                </td>
                <td className="px-4 py-4">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => deleteUser(user.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {visibleUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                  Aucun utilisateur ne correspond a la recherche.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
