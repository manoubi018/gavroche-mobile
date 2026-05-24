"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export function PasswordField() {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="space-y-2">
      <label
        htmlFor="password"
        className="text-sm font-medium text-[var(--foreground)]"
      >
        Mot de passe
      </label>

      <div className="relative">
        <input
          id="password"
          name="password"
          type={isVisible ? "text" : "password"}
          required
          minLength={8}
          autoComplete="current-password"
          className="w-full rounded-xl border bg-white px-4 py-3 pr-14 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]"
          placeholder="Au moins 8 caracteres"
        />

        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={isVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={isVisible}
          className="absolute inset-y-0 right-0 flex w-14 items-center justify-center text-[var(--muted-foreground)] transition hover:text-[var(--foreground)] focus:text-[var(--foreground)] focus:outline-none"
        >
          {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}
