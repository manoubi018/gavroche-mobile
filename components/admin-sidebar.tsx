"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Boxes,
  ShoppingBag,
  Tag,
  Tags,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"

const navigation = [
  { href: "/dashboard/orders", label: "Commandes", icon: ShoppingBag },
  { href: "/dashboard/products", label: "Livres", icon: Boxes },
  { href: "/dashboard/categories", label: "Categories", icon: Tags },
  { href: "/dashboard/offers", label: "Offres", icon: Tag },
  { href: "/dashboard/customers", label: "Clients", icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-white/10 bg-[var(--sidebar)] px-6 py-7 text-[var(--sidebar-foreground)] lg:flex">
      <Link href="/dashboard/orders" className="mb-10 flex items-center gap-4">
        <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <Image src="/gavroche-logo.jpg" alt="Librairie Gavroche" fill className="object-cover" sizes="56px" />
        </div>
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.36em] text-[var(--sidebar-muted)]">
            Back Office
          </p>
          <p className="mt-1 text-[1.05rem] font-semibold leading-tight tracking-[-0.02em] text-white">
            Gavroche Admin
          </p>
        </div>
      </Link>

      <nav className="space-y-2.5">
        {navigation.map((item) => {
          const Icon = item.icon
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-3xl px-4 py-3.5 text-[1.08rem] font-medium transition-all duration-200",
                active
                  ? "shadow-[0_18px_35px_rgba(8,22,41,0.24)]"
                  : "hover:bg-white/8 hover:translate-x-1",
              )}
              style={
                active
                  ? {
                      background: "var(--sidebar-accent)",
                      color: "#ffffff",
                      boxShadow:
                        "0 18px 35px rgba(7,29,45,0.24), inset 0 1px 0 rgba(255,255,255,0.18)",
                    }
                  : {
                      color: "rgba(255,255,255,0.94)",
                    }
              }
            >
              {active ? (
                <span
                  aria-hidden="true"
                  className="h-8 w-1.5 shrink-0 rounded-full bg-white/90"
                />
              ) : null}
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl transition-colors",
                  active ? "" : "bg-white/5",
                )}
                style={
                  active
                    ? {
                        backgroundColor: "rgba(255,255,255,0.18)",
                        color: "#ffffff",
                      }
                    : {
                        color: "rgba(255,255,255,0.9)",
                      }
                }
              >
                <Icon className="h-[1.05rem] w-[1.05rem]" />
              </span>
              <span
                className="leading-none"
                style={{
                  color: active ? "#ffffff" : "rgba(255,255,255,0.96)",
                }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto rounded-[2rem] border border-white/20 bg-white/[0.07] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <p className="text-[0.72rem] uppercase tracking-[0.32em] text-[var(--sidebar-muted)]">
          Mobile admin
        </p>
        <p className="mt-3 text-[0.95rem] leading-8 break-words text-[var(--sidebar-foreground)]/92">
          Parcours reduit aux actions terrain: commandes, livres, categories,
          offres et clients.
        </p>
      </div>
    </aside>
  )
}
