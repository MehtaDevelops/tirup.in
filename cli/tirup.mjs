#!/usr/bin/env node
/**
 * tirup — command-line client for the tirup.in API.
 *
 * Zero dependencies: uses the fetch built into Node 18+. Run it with
 *   node cli/tirup.mjs health
 * or, after `npm link` inside cli/, with
 *   tirup health
 *
 * Every subcommand is a thin wrapper over https://tirup.in/api/v1/*, so the
 * same rate limits and problem documents apply.
 */

const VERSION = "1.0.0"
const DEFAULT_BASE = process.env.TIRUP_API_BASE || "https://tirup.in"

const USAGE = `tirup ${VERSION} — CLI for the tirup.in API

Usage
  tirup <command> [options]

Commands
  health                 Check that the API is serving requests
  profile                Print Tirup Mehta's public profile
  projects               List every public project
  writing [--limit N]    List published articles (1-50, default 10)
  help                   Show this help
  version                Show the CLI version

Options
  --json                 Print the raw JSON response instead of a table
  --base <url>           Override the API host (default ${DEFAULT_BASE})
  -h, --help             Show this help
  -v, --version          Show the CLI version

Examples
  tirup health
  tirup writing --limit 3
  tirup projects --json | jq '.projects[].title'
  tirup profile --json

Exit codes
  0  success
  1  the API returned a problem document
  2  bad usage or a network failure
`

function fail(message, code = 2) {
  process.stderr.write(`tirup: ${message}\n`)
  process.exit(code)
}

function parseArgs(argv) {
  const options = { json: false, base: DEFAULT_BASE, limit: undefined, command: null }
  const rest = []

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === "--json") options.json = true
    else if (arg === "-h" || arg === "--help") options.command = "help"
    else if (arg === "-v" || arg === "--version") options.command = "version"
    else if (arg === "--base") {
      const value = argv[i + 1]
      if (!value) fail("--base needs a URL")
      options.base = value.replace(/\/+$/, "")
      i += 1
    } else if (arg.startsWith("--base=")) {
      options.base = arg.slice("--base=".length).replace(/\/+$/, "")
    } else if (arg === "--limit") {
      const value = argv[i + 1]
      if (!value) fail("--limit needs a number")
      options.limit = value
      i += 1
    } else if (arg.startsWith("--limit=")) {
      options.limit = arg.slice("--limit=".length)
    } else if (arg.startsWith("-")) {
      fail(`unknown option ${arg}`)
    } else {
      rest.push(arg)
    }
  }

  if (!options.command && rest.length > 0) options.command = rest.shift()
  if (rest.length > 0) fail(`unexpected argument ${rest[0]}`)
  return options
}

async function request(options, path) {
  let url = `${options.base}${path}`
  if (options.limit !== undefined) {
    url += `?limit=${encodeURIComponent(options.limit)}`
  }

  let response
  try {
    response = await fetch(url, { headers: { Accept: "application/json" } })
  } catch (error) {
    fail(`could not reach ${url}: ${error.message}`)
  }

  const text = await response.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    fail(`expected JSON from ${url}, got ${response.headers.get("content-type") || "unknown type"}`)
  }

  if (!response.ok) {
    const code = body.code || `http_${response.status}`
    process.stderr.write(`tirup: ${code}: ${body.detail || body.title || "request failed"}\n`)
    if (body.hint) process.stderr.write(`hint: ${body.hint}\n`)
    process.exit(1)
  }

  return body
}

function printJson(body) {
  process.stdout.write(`${JSON.stringify(body, null, 2)}\n`)
}

function printHealth(body) {
  process.stdout.write(`status   ${body.status}\n`)
  process.stdout.write(`service  ${body.service}\n`)
  process.stdout.write(`version  ${body.version}\n`)
  process.stdout.write(`uptime   ${body.uptimeSeconds}s\n`)
}

function printProfile(body) {
  process.stdout.write(`${body.name}\n`)
  if (body.headline) process.stdout.write(`${body.headline}\n`)
  process.stdout.write("\n")
  if (body.summary) process.stdout.write(`${body.summary}\n\n`)
  if (body.location) {
    process.stdout.write(`location  ${body.location.locality}, ${body.location.country}\n`)
  }
  if (body.url) process.stdout.write(`site      ${body.url}\n`)
  if (body.blog) process.stdout.write(`blog      ${body.blog}\n`)
  if (body.contact) process.stdout.write(`contact   ${body.contact}\n`)
  if (Array.isArray(body.knowsAbout) && body.knowsAbout.length > 0) {
    process.stdout.write(`skills    ${body.knowsAbout.join(", ")}\n`)
  }
}

function printProjects(body) {
  process.stdout.write(`${body.count} project${body.count === 1 ? "" : "s"}\n\n`)
  for (const project of body.projects) {
    process.stdout.write(`${project.title}  (${project.slug})\n`)
    if (project.description) process.stdout.write(`  ${project.description}\n`)
    if (project.liveUrl) process.stdout.write(`  live   ${project.liveUrl}\n`)
    if (project.repository) process.stdout.write(`  source ${project.repository}\n`)
    if (project.techStack.length > 0) process.stdout.write(`  stack  ${project.techStack.join(", ")}\n`)
    process.stdout.write("\n")
  }
}

function printWriting(body) {
  process.stdout.write(`${body.count} of ${body.total} article${body.total === 1 ? "" : "s"}\n\n`)
  for (const post of body.posts) {
    const date = post.publishedAt ? post.publishedAt.slice(0, 10) : "----------"
    process.stdout.write(`${date}  ${post.title}\n`)
    process.stdout.write(`          ${post.url}\n`)
    if (post.tldr) process.stdout.write(`          ${post.tldr}\n`)
    process.stdout.write("\n")
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  switch (options.command) {
    case null:
    case "help":
      process.stdout.write(USAGE)
      return
    case "version":
      process.stdout.write(`${VERSION}\n`)
      return
    case "health": {
      const body = await request(options, "/api/v1/health")
      options.json ? printJson(body) : printHealth(body)
      return
    }
    case "profile": {
      const body = await request(options, "/api/v1/profile")
      options.json ? printJson(body) : printProfile(body)
      return
    }
    case "projects": {
      const body = await request(options, "/api/v1/projects")
      options.json ? printJson(body) : printProjects(body)
      return
    }
    case "writing": {
      const body = await request(options, "/api/v1/writing")
      options.json ? printJson(body) : printWriting(body)
      return
    }
    default:
      fail(`unknown command "${options.command}". Run "tirup help".`)
  }
}

main().catch((error) => fail(error.message || String(error)))
