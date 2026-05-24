import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

export const ADMIN_SESSION_COOKIE = "seafood_admin_session"

const DEFAULT_TTL_HOURS = 8

export interface AdminSessionPayload {
  sub: number
  email: string
  name: string
  role: "ADMIN"
  exp: number
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET

  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET in .env.local")
  }

  return secret
}

function getSessionTtlHours() {
  const rawValue = process.env.ADMIN_SESSION_TTL_HOURS

  if (!rawValue) {
    return DEFAULT_TTL_HOURS
  }

  const value = Number(rawValue)
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TTL_HOURS
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url")
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8")
}

function sign(input: string) {
  return createHmac("sha256", getSessionSecret()).update(input).digest()
}

export function createSessionToken(input: Omit<AdminSessionPayload, "exp">) {
  const expiresAt = Math.floor(Date.now() / 1000) + getSessionTtlHours() * 60 * 60
  const payload: AdminSessionPayload = {
    ...input,
    exp: expiresAt,
  }

  const encoded = toBase64Url(JSON.stringify(payload))
  const signature = sign(encoded).toString("base64url")

  return {
    token: `${encoded}.${signature}`,
    payload,
  }
}

export function verifySessionToken(token: string): AdminSessionPayload | null {
  const [encoded, providedSignature] = token.split(".")

  if (!encoded || !providedSignature) {
    return null
  }

  const expected = sign(encoded)
  const provided = Buffer.from(providedSignature, "base64url")

  if (provided.length !== expected.length) {
    return null
  }

  if (!timingSafeEqual(provided, expected)) {
    return null
  }

  const payload = JSON.parse(fromBase64Url(encoded)) as AdminSessionPayload

  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    return null
  }

  return payload
}

export async function getOptionalSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

  if (!token) {
    return null
  }

  return verifySessionToken(token)
}

export async function setSessionCookie(token: string, expiresAt: number) {
  const cookieStore = await cookies()

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt * 1000),
    path: "/",
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
  })
}
