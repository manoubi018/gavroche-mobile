"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { adminAuthService } from "@/features/admin-auth/service"
import { adminAuthValidator } from "@/features/admin-auth/validator"
import { clearLoginRateLimit, assertLoginRateLimit } from "@/lib/auth/rate-limit"
import { isHttpError } from "@/lib/errors/http-error"
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session"

function getClientFingerprint(headerList: Headers, email: string) {
  const forwardedFor = headerList.get("x-forwarded-for")?.split(",")[0]?.trim()
  const realIp = headerList.get("x-real-ip")?.trim()
  const userAgent = headerList.get("user-agent")?.trim()

  return [forwardedFor ?? realIp ?? "local", userAgent ?? "unknown", email]
    .filter(Boolean)
    .join(":")
}

function getLoginErrorMessage(error: unknown) {
  if (isHttpError(error)) {
    if (error.statusCode === 401) {
      return "Email ou mot de passe incorrect."
    }

    if (error.statusCode === 403) {
      return "Ce compte administrateur n'est pas actif."
    }

    if (error.statusCode === 423) {
      return "Ce compte est temporairement verrouille. Reessayez dans quelques minutes."
    }

    if (error.statusCode === 429) {
      return "Trop de tentatives de connexion. Veuillez patienter avant de reessayer."
    }

    if (error.statusCode === 503) {
      return "Connexion a la base de donnees indisponible pour le moment. Reessayez dans un instant."
    }
  }

  return "Connexion impossible pour le moment. Veuillez reessayer."
}

export async function loginAction(formData: FormData) {
  const rawEmail = String(formData.get("email") ?? "").trim().toLowerCase()
  const rawPassword = String(formData.get("password") ?? "")

  try {
    const headerList = await headers()
    const fingerprint = getClientFingerprint(headerList, rawEmail)

    assertLoginRateLimit(fingerprint)

    const input = adminAuthValidator.validateAuthenticate({
      email: rawEmail,
      password: rawPassword,
    })

    const admin = await adminAuthService.authenticateAdmin(input)
    const session = createSessionToken({
      sub: admin.id,
      email: admin.email,
      name: admin.nom,
      role: admin.role,
    })

    await setSessionCookie(session.token, session.payload.exp)
    clearLoginRateLimit(fingerprint)
  } catch (error) {
    const message = getLoginErrorMessage(error)
    redirect(`/login?error=${encodeURIComponent(message)}`)
  }

  redirect("/dashboard")
}

export async function logoutAction() {
  await clearSessionCookie()
  redirect("/login")
}
