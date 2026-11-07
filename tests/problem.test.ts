import { test } from "node:test"
import assert from "node:assert/strict"

import {
  checkRateLimit,
  clientId,
  problem,
  rateLimitGuard,
  rateLimitHeaders,
} from "../lib/problem.ts"

test("problem() produces an RFC 9457 document", async () => {
  const response = problem({
    status: 404,
    code: "not_found",
    title: "No such API endpoint",
    detail: "No API endpoint is served at /api/v1/nope.",
    instance: "/api/v1/nope",
    hint: "See the docs.",
  })

  assert.equal(response.status, 404)
  assert.match(response.headers.get("content-type") ?? "", /^application\/problem\+json/)
  assert.equal(response.headers.get("cache-control"), "no-store")

  const body = await response.json()
  assert.equal(body.type, "https://tirup.in/docs#error-not_found")
  assert.equal(body.title, "No such API endpoint")
  assert.equal(body.status, 404)
  assert.equal(body.code, "not_found")
  assert.equal(body.instance, "/api/v1/nope")
  assert.equal(body.hint, "See the docs.")
})

test("problem() omits instance and hint when not supplied", async () => {
  const response = problem({
    status: 400,
    code: "invalid_parameter",
    title: "Bad request",
    detail: "Nope.",
  })
  const body = await response.json()

  assert.equal("instance" in body, false)
  assert.equal("hint" in body, false)
})

test("problem() keeps caller headers and adds CORS", () => {
  const response = problem({
    status: 429,
    code: "rate_limited",
    title: "Rate limit exceeded",
    detail: "Slow down.",
    headers: { "Retry-After": "12" },
  })

  assert.equal(response.headers.get("retry-after"), "12")
  assert.equal(response.headers.get("access-control-allow-origin"), "*")
})

test("checkRateLimit allows the quota then blocks", () => {
  const key = `test-${Math.random()}`
  const limit = 3

  for (let i = 0; i < limit; i += 1) {
    const result = checkRateLimit(key, limit, 60_000)
    assert.equal(result.allowed, true)
    assert.equal(result.limit, limit)
    assert.equal(result.remaining, limit - (i + 1))
    assert.equal(result.window, 60)
  }

  const blocked = checkRateLimit(key, limit, 60_000)
  assert.equal(blocked.allowed, false)
  assert.equal(blocked.remaining, 0)
  assert.ok(blocked.reset >= 1)
})

test("checkRateLimit resets after the window", () => {
  const key = `test-window-${Math.random()}`

  assert.equal(checkRateLimit(key, 1, 1).allowed, true)
  assert.equal(checkRateLimit(key, 1, 1).allowed, false)

  // Busy-wait just past the 1ms window.
  const until = Date.now() + 5
  while (Date.now() < until) {
    /* spin */
  }

  assert.equal(checkRateLimit(key, 1, 1).allowed, true)
})

test("rateLimitHeaders exposes the RFC RateLimit set", () => {
  const headers = rateLimitHeaders({
    allowed: true,
    limit: 60,
    remaining: 41,
    reset: 30,
    window: 60,
  })

  assert.equal(headers["RateLimit-Limit"], "60")
  assert.equal(headers["RateLimit-Remaining"], "41")
  assert.equal(headers["RateLimit-Reset"], "30")
  assert.equal(headers["RateLimit-Policy"], "60;w=60")
  assert.equal("Retry-After" in headers, false)
})

test("rateLimitHeaders adds Retry-After only when blocked", () => {
  const headers = rateLimitHeaders({
    allowed: false,
    limit: 60,
    remaining: 0,
    reset: 17,
    window: 60,
  })

  assert.equal(headers["Retry-After"], "17")
  assert.equal(headers["RateLimit-Remaining"], "0")
})

test("clientId prefers the first x-forwarded-for hop", () => {
  const request = new Request("https://tirup.in/api/v1/health", {
    headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
  })
  assert.equal(clientId(request), "203.0.113.7")
})

test("clientId falls back to x-real-ip, then anonymous", () => {
  const realIp = new Request("https://tirup.in/api/v1/health", {
    headers: { "x-real-ip": "198.51.100.9" },
  })
  assert.equal(clientId(realIp), "198.51.100.9")

  const none = new Request("https://tirup.in/api/v1/health")
  assert.equal(clientId(none), "anonymous")
})

test("rateLimitGuard returns a 429 problem once the quota is spent", async () => {
  const key = `guard-${Math.random()}`
  const request = new Request("https://tirup.in/api/v1/projects", {
    headers: { "x-forwarded-for": key },
  })

  for (let i = 0; i < 2; i += 1) {
    const { blocked } = rateLimitGuard(request, 2, 60_000)
    assert.equal(blocked, null)
  }

  const { result, blocked } = rateLimitGuard(request, 2, 60_000)
  assert.notEqual(blocked, null)
  assert.equal(result.allowed, false)
  assert.equal(blocked?.status, 429)
  assert.match(blocked?.headers.get("content-type") ?? "", /^application\/problem\+json/)
  assert.ok(blocked?.headers.get("retry-after"))

  const body = await blocked?.json()
  assert.equal(body.code, "rate_limited")
  assert.ok(body.hint.includes("Retry-After"))
})
