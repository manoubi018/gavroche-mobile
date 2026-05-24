"use client"

import { Check, Copy, Download, ExternalLink, Link as LinkIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function looksLikeInAppBrowser(userAgent: string) {
  const agent = userAgent.toLowerCase()

  return (
    agent.includes("fban") ||
    agent.includes("fbav") ||
    agent.includes("messenger") ||
    agent.includes("instagram") ||
    agent.includes("wv")
  )
}

export function InstallPrompt({ compact = false }: { compact?: boolean }) {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isSupportedMobile, setIsSupportedMobile] = useState(false)
  const [isInAppBrowser, setIsInAppBrowser] = useState(false)
  const [origin, setOrigin] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setOrigin(window.location.origin)
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)
    setIsSupportedMobile(/android|iphone|ipad|ipod/i.test(navigator.userAgent))
    setIsInAppBrowser(looksLikeInAppBrowser(navigator.userAgent))

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeout = window.setTimeout(() => setCopied(false), 2000)

    return () => window.clearTimeout(timeout)
  }, [copied])

  const helperText = useMemo(() => {
    if (isStandalone) {
      return null
    }

    if (installEvent) {
      return "Installation disponible sur cet appareil."
    }

    if (isInAppBrowser) {
      return "Ouvrez cette adresse dans Chrome ou le navigateur du telephone pour pouvoir installer l'application."
    }

    if (!isSupportedMobile) {
      return "Sur ordinateur, utilisez Chrome ou Edge puis choisissez Installer l'application depuis la barre d'adresse ou le menu du navigateur."
    }

    return "Sur Android, utilisez le menu du navigateur puis choisissez Installer l'application ou Ajouter a l'ecran d'accueil."
  }, [installEvent, isInAppBrowser, isStandalone, isSupportedMobile])

  if (isStandalone) {
    return null
  }

  if (compact) {
    if (!installEvent) {
      return null
    }

    return (
      <button
        type="button"
        aria-label="Installer l'application"
        title="Installer l'application"
        onClick={async () => {
          await installEvent.prompt()
          await installEvent.userChoice.catch(() => null)
          setInstallEvent(null)
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white"
      >
        <Download className="h-4 w-4" />
        Installer
      </button>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {installEvent ? (
        <button
          type="button"
          aria-label="Installer l'application"
          title="Installer l'application"
          onClick={async () => {
            await installEvent.prompt()
            await installEvent.userChoice.catch(() => null)
            setInstallEvent(null)
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white"
        >
          <Download className="h-4 w-4" />
          Installer
        </button>
      ) : null}

      {origin ? (
        <div className="flex max-w-[320px] items-center gap-2 rounded-xl border border-[var(--border)] bg-white/80 px-3 py-2 text-right shadow-sm">
          <LinkIcon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
          <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[var(--foreground)]">
            {origin}
          </span>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(origin).catch(() => undefined)
              setCopied(true)
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            aria-label="Copier le lien mobile"
            title="Copier le lien mobile"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      ) : null}

      {helperText ? (
        <p className="max-w-[280px] text-right text-[11px] leading-5 text-[var(--muted-foreground)]">
          {helperText}
        </p>
      ) : null}

      {isInAppBrowser ? (
        <a
          href={origin || "/"}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--primary)]"
        >
          <ExternalLink className="h-4 w-4" />
          Ouvrir dans le navigateur
        </a>
      ) : null}
    </div>
  )
}
