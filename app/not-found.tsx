import Link from "next/link"

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[var(--background)] px-5 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white p-5 text-center shadow-[var(--shadow)]">
        <h1 className="text-xl font-semibold">Page indisponible</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          Cette section n'existe pas dans l'application mobile.
        </p>
        <Link
          href="/dashboard/orders"
          className="mt-6 inline-flex w-full justify-center rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white"
        >
          Retour aux commandes
        </Link>
      </div>
    </main>
  )
}
