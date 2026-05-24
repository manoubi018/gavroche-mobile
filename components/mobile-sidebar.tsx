"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Boxes,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Tag,
  Tags,
  UserCircle,
  Users,
  X,
} from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

const tasks = [
  { href: "/dashboard/orders", label: "Commandes", icon: ShoppingBag },
  { href: "/dashboard/products", label: "Livres", icon: Boxes },
  { href: "/dashboard/categories", label: "Categories", icon: Tags },
  { href: "/dashboard/offers", label: "Offres", icon: Tag },
  { href: "/dashboard/customers", label: "Clients", icon: Users },
  { href: "/dashboard/settings", label: "Profil", icon: UserCircle },
]

export function MobileSidebar({
  userName,
  userEmail,
  logoutAction,
  installPrompt,
}: {
  userName: string
  userEmail: string
  logoutAction: (formData: FormData) => void | Promise<void>
  installPrompt?: ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)]"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 text-center">
          <p className="text-sm font-semibold leading-none text-[var(--foreground)]">
            Gavroche
          </p>
          <p className="mt-1 truncate text-[0.68rem] font-medium text-[var(--muted-foreground)]">
            Admin mobile
          </p>
        </div>

        {installPrompt ?? (
          <Link
            href="/dashboard/settings"
            aria-label="Profil"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)]"
          >
            <UserCircle className="h-5 w-5" />
          </Link>
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 bg-black/35 lg:hidden" onClick={() => setOpen(false)} />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-[320px] flex-col bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] shadow-[24px_0_50px_rgba(10,25,47,0.16)] transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--card)]">
              <Image src="/gavroche-logo.jpg" alt="Librairie Gavroche" fill className="object-cover" sizes="48px" />
            </div>
            <p className="mt-4 text-base font-semibold">{userName}</p>
            <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
              {userEmail}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-7 space-y-1">
          {tasks.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold",
                  active
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--foreground)] hover:bg-[var(--muted)]",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-2xl bg-[var(--muted)] px-3 py-3 text-sm font-semibold text-[var(--foreground)]"
          >
            <Settings className="h-5 w-5" />
            Parametres du compte
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-sm font-semibold text-red-700"
            >
              <LogOut className="h-5 w-5" />
              Deconnexion
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
