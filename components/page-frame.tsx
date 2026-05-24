import type { ReactNode } from "react"

export function PageFrame({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="space-y-3 sm:space-y-6">
      <div className="flex flex-col gap-2 pb-1 sm:border-b sm:border-[var(--border)] sm:pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)] md:block">
            Gavroche Administration
          </p>
          <h1 className="text-[1.35rem] font-semibold leading-tight text-[var(--foreground)] sm:mt-2 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 hidden max-w-3xl text-sm leading-6 text-[var(--muted-foreground)] md:block">
            {description}
          </p>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}
