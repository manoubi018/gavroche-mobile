import "server-only"

import { HttpError } from "@/lib/errors/http-error"
import { supabaseServiceRoleKey, supabaseUrl } from "@/lib/db"

type Primitive = string | number | boolean

type QueryMethod = "select" | "insert" | "update" | "delete"

interface QueryOptions {
  table: string
  method: QueryMethod
  select?: string
  filters?: Record<string, Primitive>
  body?: unknown
  single?: boolean
}

interface TransactionClient {
  query<T>(options: QueryOptions): Promise<T>
}

class DBClient {
  private readonly baseRestUrl: string
  private readonly apiKey: string

  constructor() {
    this.baseRestUrl = `${supabaseUrl}/rest/v1`
    this.apiKey = supabaseServiceRoleKey
  }

  private buildUrl(table: string, select?: string, filters?: Record<string, Primitive>) {
    const url = new URL(`${this.baseRestUrl}/${table}`)

    if (select) {
      url.searchParams.set("select", select)
    }

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        url.searchParams.set(key, `eq.${value}`)
      })
    }

    return url
  }

  private getHeaders(extra?: HeadersInit): HeadersInit {
    return {
      apikey: this.apiKey,
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...extra,
    }
  }

  async query<T>(options: QueryOptions): Promise<T> {
    const { table, method, select, filters, body, single = false } = options
    const url = this.buildUrl(table, select, filters)

    const requestInit: RequestInit = {
      headers: this.getHeaders(
        method === "insert" || method === "update" || method === "delete"
          ? { Prefer: "return=representation" }
          : undefined,
      ),
    }

    if (method === "select") {
      requestInit.method = "GET"
    }

    if (method === "insert") {
      requestInit.method = "POST"
      requestInit.body = JSON.stringify(body)
    }

    if (method === "update") {
      requestInit.method = "PATCH"
      requestInit.body = JSON.stringify(body)
    }

    if (method === "delete") {
      requestInit.method = "DELETE"
    }

    let response: Response

    try {
      response = await fetch(url.toString(), requestInit)
    } catch (error) {
      throw new HttpError(503, "Supabase is unreachable", {
        cause: error instanceof Error ? error.message : String(error),
        table,
      })
    }

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new HttpError(
        response.status,
        payload?.message ?? "Supabase request failed",
        payload,
      )
    }

    if (single) {
      if (Array.isArray(payload)) {
        return (payload[0] ?? null) as T
      }

      return payload as T
    }

    return payload as T
  }

  async transaction<T>(callback: (tx: TransactionClient) => Promise<T>): Promise<T> {
    return callback(this)
  }
}

export const dbClient = new DBClient()
