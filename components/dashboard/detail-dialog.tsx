"use client"

import type { ReactNode } from "react"
import { X } from "lucide-react"

export function DetailDialog({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-slate-950/45 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-sm sm:items-center sm:justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-dialog-title"
      onClick={onClose}
    >
      <div
        className="max-h-[88svh] w-full overflow-hidden rounded-[24px] bg-white shadow-2xl sm:max-w-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-4 py-4 sm:px-6">
          <div className="min-w-0">
            {subtitle ? (
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                {subtitle}
              </p>
            ) : null}
            <h2 id="detail-dialog-title" className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--foreground)]"
            aria-label="Fermer les details"
            title="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(88svh-76px)] overflow-y-auto px-4 py-4 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  )
}
