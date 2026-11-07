import { test } from "node:test"
import assert from "node:assert/strict"

import {
  KNOWN_PREFIXES,
  buildNotFoundMarkdown,
  isKnownPath,
} from "../lib/agent-paths.ts"

test("known static routes are recognised", () => {
  for (const path of ["/", "/about", "/contact", "/privacy"]) {
    assert.equal(isKnownPath(path), true, `${path} should be known`)
  }
})

test("machine-readable files are recognised", () => {
  for (const path of ["/sitemap.xml", "/llms.txt", "/openapi.json", "/.well-known/security.txt"]) {
    assert.equal(isKnownPath(path), true, `${path} should be known`)
  }
})

test("trailing slashes are normalised", () => {
  assert.equal(isKnownPath("/about//"), true)
  assert.equal(isKnownPath("/"), true)
})

test("dynamic prefixes are recognised", () => {
  assert.equal(isKnownPath("/api/v1/health"), true)
  assert.equal(isKnownPath("/writing/some-post"), true)
  assert.equal(isKnownPath("/projects/modelregistry"), true)
})

test("every declared prefix is accepted", () => {
  for (const prefix of KNOWN_PREFIXES) {
    assert.equal(isKnownPath(`${prefix}anything`), true, `${prefix} should be a known prefix`)
  }
})

test("unknown paths are not known", () => {
  for (const path of ["/nope", "/__ora-404-probe", "/docs/nope", "/api"]) {
    assert.equal(isKnownPath(path), false, `${path} should be unknown`)
  }
})

test("real but dynamic paths are known", () => {
  assert.equal(isKnownPath("/writing"), true)
  assert.equal(isKnownPath("/writing/some-post"), true)
})

test("markdown 404 body explains the error and links recovery resources", () => {
  const body = buildNotFoundMarkdown("/__ora-404-probe")

  assert.match(body, /^# 404: Page not found/)
  assert.match(body, /__ora-404-probe/)
  assert.ok(body.length > 20, "body must be longer than 20 characters")
  assert.match(body, /https:\/\/tirup\.in\/llms\.txt/)
  assert.match(body, /https:\/\/tirup\.in\/sitemap\.xml/)
})

test("markdown 404 body strips control characters and markdown punctuation", () => {
  const body = buildNotFoundMarkdown("/bad\u0000path`with`<tags>")

  assert.ok(!body.includes("\u0000"), "control characters are removed")
  assert.ok(!body.includes("`with`"), "backticks are removed from the echoed path")
  assert.ok(!body.includes("<tags>"), "angle brackets are removed from the echoed path")
})

test("markdown 404 body caps the echoed path length", () => {
  const body = buildNotFoundMarkdown(`/${"a".repeat(500)}`)

  assert.match(body, /\.\.\./)
  assert.ok(body.length < 1500, "a hostile path must not inflate the response")
})
