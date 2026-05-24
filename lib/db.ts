import "server-only"

function getEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing ${name} in .env.local`)
  }

  return value
}

function isConfiguredValue(value: string | undefined) {
  if (!value) {
    return false
  }

  return !value.startsWith("replace-with-")
}

function getFirstEnv(names: string[]) {
  for (const name of names) {
    const value = process.env[name]

    if (isConfiguredValue(value)) {
      return value as string
    }
  }

  throw new Error(`Missing one of ${names.join(", ")} in .env.local`)
}

export const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
export const supabaseServiceRoleKey = getFirstEnv(["SUPABASE_SERVICE_ROLE_KEY"])
