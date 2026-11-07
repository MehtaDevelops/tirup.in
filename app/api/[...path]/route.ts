import { handleHead, preflight } from "@/lib/api"
import { methodNotAllowed, notFound } from "@/lib/problem"

/**
 * Catch-all for /api/* paths that no route handler claims.
 *
 * Without this, Next.js renders its HTML 404 page, which an agent has to guess
 * at. Every unknown API path now answers with an RFC 9457 problem document so
 * the failure is parseable.
 */

export const dynamic = "force-dynamic"

export async function GET(request: Request): Promise<Response> {
  return notFound(request)
}

export async function HEAD(request: Request): Promise<Response> {
  return handleHead(request, GET)
}

export function OPTIONS(): Response {
  return preflight()
}

export function POST(request: Request): Response {
  return methodNotAllowed(request)
}

export function PUT(request: Request): Response {
  return methodNotAllowed(request)
}

export function PATCH(request: Request): Response {
  return methodNotAllowed(request)
}

export function DELETE(request: Request): Response {
  return methodNotAllowed(request)
}
