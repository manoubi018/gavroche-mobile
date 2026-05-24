import "server-only"

type AttemptState = {
  count: number
  resetAt: number
}

const attempts = new Map<string, AttemptState>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 10

export function assertLoginRateLimit(key: string) {
  const now = Date.now()
  const current = attempts.get(key)

  if (!current || current.resetAt <= now) {
    attempts.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    })
    return
  }

  if (current.count >= MAX_ATTEMPTS) {
    throw new Error("Too many login attempts. Please try again later.")
  }

  current.count += 1
  attempts.set(key, current)
}

export function clearLoginRateLimit(key: string) {
  attempts.delete(key)
}
