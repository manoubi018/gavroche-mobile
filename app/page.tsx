import { redirect } from "next/navigation"

import { getOptionalSession } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const session = await getOptionalSession()
  redirect(session ? "/dashboard" : "/login")
}
