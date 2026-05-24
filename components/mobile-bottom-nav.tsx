"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Boxes,
  ShoppingBag,
  Tag,
  Tags,
  UserCircle,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"

const navigation = [
  { href: "/dashboard/orders", label: "Commandes", icon: ShoppingBag },
  { href: "/dashboard/products", label: "Livres", icon: Boxes },
  { href: "/dashboard/categories", label: "Categories", icon: Tags },
  { href: "/dashboard/offers", label: "Offres", icon: Tag },
  { href: "/dashboard/customers", label: "Clients", icon: Users },
  { href: "/dashboard/settings", label: "Profil", icon: UserCircle },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-white px-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-4px_18px_rgba(10,25,47,0.06)] lg:hidden">
      <div className="grid grid-cols-6 gap-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-1.5 text-[0.66rem] font-semibold leading-none transition-colors",
                active
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)]",
              )}
            >
              {active ? (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[var(--primary)]" />
              ) : null}
              <Icon className="h-[1.15rem] w-[1.15rem] shrink-0" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
