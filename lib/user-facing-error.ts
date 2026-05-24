export function toUserFacingErrorMessage(message?: string | null) {
  const fallback = "Operation impossible pour le moment."

  if (!message) {
    return fallback
  }

  const normalized = message.toLowerCase()

  if (
    normalized.includes("internal server error") ||
    normalized.includes("fetch failed") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("network")
  ) {
    return "Connexion indisponible. Reessayez dans quelques instants."
  }

  if (
    normalized.includes("validation failed") ||
    normalized.includes("invalid") ||
    normalized.includes("expected")
  ) {
    return "Verifiez les informations saisies."
  }

  if (
    normalized.includes("unauthorized") ||
    normalized.includes("forbidden") ||
    normalized.includes("session")
  ) {
    return "Session expiree. Reconnectez-vous."
  }

  if (message.length > 120) {
    return fallback
  }

  return message
}
