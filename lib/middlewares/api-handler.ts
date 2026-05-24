import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { isHttpError } from "@/lib/errors/http-error"

type HandlerResult =
  | Response
  | NextResponse
  | { data: unknown; status?: number }
  | unknown

type ApiHandlerFn = () => Promise<HandlerResult> | HandlerResult

async function handle(request: Request, handler: ApiHandlerFn) {
  try {
    const result = await handler()

    if (result instanceof Response) {
      return result
    }

    if (
      result &&
      typeof result === "object" &&
      "data" in result &&
      !Array.isArray(result)
    ) {
      const payload = result as { data: unknown; status?: number }
      return NextResponse.json(payload.data, { status: payload.status ?? 200 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validation failed", issues: error.issues },
        { status: 400 },
      )
    }

    if (isHttpError(error)) {
      return NextResponse.json(
        {
          message: error.message,
          details: error.details,
        },
        { status: error.statusCode },
      )
    }

    console.error("Unhandled API error", {
      path: request.url,
      method: request.method,
      error,
    })

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    )
  }
}

export const ApiHandler = { handle }

export async function handleApi(request: Request, handler: ApiHandlerFn) {
  return ApiHandler.handle(request, handler)
}
