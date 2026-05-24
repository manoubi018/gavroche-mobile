import "server-only"

import { redirect } from "next/navigation"

import { HttpError } from "@/lib/errors/http-error"
import { getOptionalSession } from "@/lib/auth/session"

export async function requireAdminPageSession() {
  const session = await getOptionalSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/login")
  }

  return session
}

export async function requireAdminApiSession() {
  const session = await getOptionalSession()

  if (!session || session.role !== "ADMIN") {
    throw new HttpError(401, "Admin authentication required")
  }

  return session
}
