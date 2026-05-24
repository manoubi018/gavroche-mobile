import { ShieldCheck } from "lucide-react"
import Image from "next/image"

import { loginAction } from "@/app/actions/auth"
import { InstallPrompt } from "@/components/install-prompt"
import { PasswordField } from "@/components/auth/password-field"

export const dynamic = "force-dynamic"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = searchParams ? await searchParams : undefined
  const error = typeof params?.error === "string" ? params.error : null

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <section className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--card)]">
              <Image src="/gavroche-logo.jpg" alt="Librairie Gavroche" fill className="object-cover" sizes="44px" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
                Back Office
              </p>
              <p className="font-semibold">Gavroche Admin</p>
            </div>
          </div>
          <InstallPrompt compact />
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow-[var(--shadow)] backdrop-blur sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
                Acces admin
              </p>
              <h1 className="text-xl font-semibold">Connexion</h1>
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form action={loginAction} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[var(--foreground)]">
                Email admin
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
                placeholder="admin@gavroche.tn"
              />
            </div>

            <PasswordField />

            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-92"
            >
              Se connecter
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
