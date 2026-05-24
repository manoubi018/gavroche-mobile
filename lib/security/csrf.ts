import { HttpError } from "@/lib/errors/http-error"

export function verifySameOrigin(request: Request) {
  const method = request.method.toUpperCase()

  if (!["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
    return
  }

  const origin = request.headers.get("origin")

  if (!origin) {
    return
  }

  const requestUrl = new URL(request.url)
  const originUrl = new URL(origin)

  if (originUrl.host !== requestUrl.host || originUrl.protocol !== requestUrl.protocol) {
    throw new HttpError(403, "Cross-origin request blocked")
  }
}
