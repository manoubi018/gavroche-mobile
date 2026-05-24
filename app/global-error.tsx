"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fr">
      <body>
        <main className="flex min-h-[100svh] items-center justify-center bg-[var(--background)] px-5 py-10">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white p-5 text-center shadow-[var(--shadow)]">
            <h1 className="text-xl font-semibold">Action impossible</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              Reessayez dans quelques instants. Si le probleme continue, reconnectez-vous.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 w-full rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white"
            >
              Reessayer
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
