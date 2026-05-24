import { AdminSidebar } from "@/components/admin-sidebar"
import { InstallPrompt } from "@/components/install-prompt"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { requireAdminPageSession } from "@/lib/auth/guards"
import { logoutAction } from "@/app/actions/auth"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await requireAdminPageSession()

  return (
    <div className="grid min-h-[100svh] bg-[var(--background)] lg:grid-cols-[280px_1fr]">
      <AdminSidebar />

      <div className="min-w-0">
        <MobileSidebar
          userName={session.name}
          userEmail={session.email}
          logoutAction={logoutAction}
          installPrompt={<InstallPrompt compact />}
        />

        <header className="sticky top-0 z-20 hidden border-b border-[var(--border)] bg-[var(--background)] px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-6 sm:py-3 lg:block xl:px-10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="hidden text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:block sm:text-[0.68rem] sm:tracking-[0.2em]">
                Gavroche Admin
              </p>
              <h2 className="text-sm font-semibold text-[var(--foreground)] sm:mt-1 sm:text-lg">
                {session.name}
              </h2>
              <p className="hidden max-w-[190px] truncate text-xs text-[var(--muted-foreground)] sm:block sm:max-w-none sm:text-sm">
                {session.email}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <InstallPrompt compact />
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:px-4 sm:text-sm"
                >
                  Quitter
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:py-6 xl:px-10">{children}</main>
      </div>
    </div>
  )
}
