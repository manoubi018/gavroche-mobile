"use client"

import { CheckCircle2, Copy, Download, ExternalLink, Smartphone } from "lucide-react"
import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const INSTALLED_STORAGE_KEY = "gavroche-admin-mobile-installed"

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

function isMobileDevice() {
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInAppBrowser() {
  const agent = navigator.userAgent.toLowerCase()

  return (
    agent.includes("fban") ||
    agent.includes("fbav") ||
    agent.includes("messenger") ||
    agent.includes("instagram") ||
    agent.includes("wv")
  )
}

export function PwaInstallGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [standalone, setStandalone] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [embeddedBrowser, setEmbeddedBrowser] = useState(false)
  const [origin, setOrigin] = useState("")
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setOrigin(window.location.origin)
    setStandalone(isStandaloneMode())
    setMobile(isMobileDevice())
    setEmbeddedBrowser(isInAppBrowser())
    setInstalled(window.localStorage.getItem(INSTALLED_STORAGE_KEY) === "true")
    setReady(true)

    const displayModeQuery = window.matchMedia("(display-mode: standalone)")
    const updateStandalone = () => setStandalone(isStandaloneMode())
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }
    const handleAppInstalled = () => {
      window.localStorage.setItem(INSTALLED_STORAGE_KEY, "true")
      setInstalled(true)
      setInstallEvent(null)
    }

    displayModeQuery.addEventListener("change", updateStandalone)
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      displayModeQuery.removeEventListener("change", updateStandalone)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeout = window.setTimeout(() => setCopied(false), 1800)

    return () => window.clearTimeout(timeout)
  }, [copied])

  const helperText = useMemo(() => {
    if (installed) {
      return "L'application est installee. Ouvrez-la depuis son icone sur votre ecran d'accueil."
    }

    if (embeddedBrowser) {
      return "Ouvrez cette page dans Chrome ou Safari, puis lancez l'installation."
    }

    if (!mobile) {
      return "Sur ordinateur, installez l'application depuis Chrome ou Edge. Si la barre d'adresse affiche Ouvrir dans l'appli, utilisez ce bouton. Sinon, utilisez le menu du navigateur puis Installer l'application."
    }

    if (!installEvent) {
      return "Si le bouton d'installation n'apparait pas, utilisez le menu du navigateur puis Ajouter a l'ecran d'accueil."
    }

    return "Installez l'application pour acceder a l'administration dans une experience mobile native."
  }, [embeddedBrowser, installEvent, installed, mobile])

  if (!ready) {
    return (
      <div className="min-h-[100svh] bg-[var(--background)]" aria-hidden="true" />
    )
  }

  if (standalone) {
    return <>{children}</>
  }

  async function installApplication() {
    if (!installEvent) {
      return
    }

    await installEvent.prompt()
    const choice = await installEvent.userChoice.catch(() => null)
    setInstallEvent(null)

    if (choice?.outcome === "accepted") {
      window.localStorage.setItem(INSTALLED_STORAGE_KEY, "true")
      setInstalled(true)
    }
  }

  return (
    <main className="min-h-[100svh] bg-[var(--background)] px-5 py-[calc(1.5rem+env(safe-area-inset-top))] text-[var(--foreground)]">
      <section className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-[420px] flex-col justify-center">
        <div className="rounded-[28px] border border-white/70 bg-white p-5 shadow-[var(--shadow)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-white">
              {installed ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Smartphone className="h-6 w-6" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Gavroche Admin
              </p>
              <h1 className="mt-1 text-xl font-semibold">
                {installed ? "Application installee" : "Installer l'application"}
              </h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
            {helperText}
          </p>

          {installEvent && !installed ? (
            <button
              type="button"
              onClick={installApplication}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-4 text-sm font-semibold text-white"
            >
              <Download className="h-5 w-5" />
              Installer l'application
            </button>
          ) : null}

          {!installEvent && !installed ? (
            <div className="mt-5 rounded-2xl bg-[var(--muted)] px-4 py-4 text-sm leading-6 text-[var(--foreground)]">
              Menu du navigateur, puis Installer l'application ou Ajouter a l'ecran
              d'accueil.
            </div>
          ) : null}

          {origin ? (
            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-3">
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {origin}
              </span>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(origin).catch(() => undefined)
                  setCopied(true)
                }}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--foreground)]"
                aria-label="Copier le lien"
                title="Copier le lien"
              >
                {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          ) : null}

          {embeddedBrowser && origin ? (
            <a
              href={origin}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-5 py-4 text-sm font-semibold text-[var(--primary)]"
            >
              <ExternalLink className="h-5 w-5" />
              Ouvrir dans le navigateur
            </a>
          ) : null}
        </div>
      </section>
    </main>
  )
}
