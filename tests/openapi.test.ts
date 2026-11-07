import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

interface Operation {
  operationId?: string
  summary?: string
  description?: string
  parameters?: unknown[]
  responses?: Record<string, ResponseObject>
}

interface ResponseObject {
  $ref?: string
  description?: string
  content?: Record<string, { schema?: unknown }>
}

interface Spec {
  openapi: string
  info: { title: string; version: string; description?: string }
  paths: Record<string, Record<string, Operation>>
  components?: {
    schemas?: Record<string, unknown>
    responses?: Record<string, ResponseObject>
  }
  "x-versioning-policy"?: unknown
  "x-deprecation-policy"?: unknown
}

function loadSpec(relative: string): Spec {
  return JSON.parse(readFileSync(new URL(relative, import.meta.url), "utf8")) as Spec
}

const specs: Array<[string, Spec]> = [
  ["public/openapi.json", loadSpec("../public/openapi.json")],
  ["public/openapi/blogs.json", loadSpec("../public/openapi/blogs.json")],
]

function operations(spec: Spec): Array<[string, string, Operation]> {
  const entries: Array<[string, string, Operation]> = []
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (["get", "head", "post", "put", "patch", "delete", "options"].includes(method)) {
        entries.push([path, method, operation])
      }
    }
  }
  return entries
}

for (const [name, spec] of specs) {
  test(`${name}: declares OpenAPI 3.1`, () => {
    assert.match(spec.openapi, /^3\.1\./)
    assert.ok(spec.info.title.length > 0)
    assert.ok(spec.info.version.length > 0)
    assert.ok((spec.info.description ?? "").length > 40, "info.description must explain the API")
  })

  test(`${name}: every operation has a unique operationId and a description`, () => {
    const seen = new Set<string>()
    const ops = operations(spec)

    assert.ok(ops.length > 0, "the spec must describe at least one operation")

    for (const [path, method, operation] of ops) {
      assert.ok(operation.operationId, `${method.toUpperCase()} ${path} needs an operationId`)
      assert.match(
        operation.operationId ?? "",
        /^[a-z][a-zA-Z0-9]*$/,
        `${method.toUpperCase()} ${path} operationId must be camelCase`
      )
      assert.ok(!seen.has(operation.operationId), `duplicate operationId ${operation.operationId}`)
      seen.add(operation.operationId)
      assert.ok(
        (operation.description ?? "").length > 20,
        `${method.toUpperCase()} ${path} needs a real description`
      )
    }
  })

  test(`${name}: every operation documents a typed success response`, () => {
    for (const [path, method, operation] of operations(spec)) {
      const responses = operation.responses ?? {}
      const success = Object.entries(responses).filter(([status]) => status.startsWith("2"))
      assert.ok(success.length > 0, `${method.toUpperCase()} ${path} has no 2xx response`)

      for (const [status, response] of success) {
        if (method === "head") {
          // HEAD has no body by definition.
          assert.ok(response.description, `HEAD ${path} needs a description`)
          continue
        }
        const content = response.content ?? {}
        const types = Object.keys(content)
        assert.ok(types.length > 0, `${method.toUpperCase()} ${path} ${status} has no content type`)
        for (const type of types) {
          assert.ok(
            content[type]?.schema,
            `${method.toUpperCase()} ${path} ${status} ${type} needs a schema`
          )
        }
      }
    }
  })

  test(`${name}: 4xx and 5xx responses are typed problem documents`, () => {
    for (const [path, method, operation] of operations(spec)) {
      for (const [status, response] of Object.entries(operation.responses ?? {})) {
        if (!/^[45]/.test(status)) continue

        if (response.$ref) {
          assert.match(response.$ref, /^#\/components\/responses\//)
          continue
        }

        const content = response.content ?? {}
        assert.ok(
          Object.keys(content).includes("application/problem+json"),
          `${method.toUpperCase()} ${path} ${status} must be application/problem+json`
        )
        assert.ok(
          content["application/problem+json"]?.schema,
          `${method.toUpperCase()} ${path} ${status} needs a schema`
        )
      }
    }
  })

  test(`${name}: declares a versioning and deprecation policy`, () => {
    assert.ok(spec["x-versioning-policy"], "x-versioning-policy is required")
    assert.ok(spec["x-deprecation-policy"], "x-deprecation-policy is required")
  })
}

test("public/openapi.json: the Problem schema lists every error code the API emits", () => {
  const spec = specs[0][1]
  const problem = spec.components?.schemas?.Problem as
    | { properties?: { code?: { enum?: string[] } } }
    | undefined

  assert.ok(problem, "Problem schema must exist")
  const codes = problem?.properties?.code?.enum ?? []

  for (const code of [
    "invalid_parameter",
    "not_found",
    "method_not_allowed",
    "rate_limited",
    "upstream_unavailable",
  ]) {
    assert.ok(codes.includes(code), `Problem.code must include ${code}`)
  }
})

test("public/openapi.json: documents the four v1 endpoints", () => {
  const spec = specs[0][1]
  const paths = Object.keys(spec.paths)

  for (const path of ["/api/v1/health", "/api/v1/profile", "/api/v1/projects", "/api/v1/writing"]) {
    assert.ok(paths.includes(path), `missing ${path}`)
  }
})

test("public/openapi.json: the writing endpoint types its limit parameter", () => {
  const spec = specs[0][1]
  const get = spec.paths["/api/v1/writing"]?.get as
    | { parameters?: Array<{ name?: string; in?: string; schema?: { type?: string } }> }
    | undefined

  const limit = get?.parameters?.find((parameter) => parameter.name === "limit")
  assert.ok(limit, "limit parameter must be documented")
  assert.equal(limit?.in, "query")
  assert.equal(limit?.schema?.type, "integer")
})
