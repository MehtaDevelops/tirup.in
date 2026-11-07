# tirup

Command-line client for the [tirup.in API](https://tirup.in/docs). Zero
dependencies; needs Node 18 or newer for the built-in `fetch`.

## Install

From this repository:

```sh
cd cli
npm link          # makes the `tirup` command available globally
```

Or run it without installing:

```sh
node cli/tirup.mjs health
```

## Commands

```sh
tirup health                  # is the API serving requests?
tirup profile                 # identity facts
tirup projects                # the project index
tirup writing --limit 5       # newest 5 articles
```

## Options

| Flag | Meaning |
|---|---|
| `--json` | print the raw JSON instead of a formatted table |
| `--base <url>` | override the API host (default `https://tirup.in`) |
| `-h`, `--help` | show help |
| `-v`, `--version` | show the CLI version |

## Examples

```sh
tirup writing --limit 3
tirup projects --json | jq -r '.projects[].title'
tirup profile --json
TIRUP_API_BASE=http://localhost:3000 tirup health
```

## Exit codes

| Code | Meaning |
|---|---|
| 0 | success |
| 1 | the API returned an RFC 9457 problem document (the `code` and `hint` are printed to stderr) |
| 2 | bad usage or a network failure |

## Rate limits

The CLI hits the same public endpoints as any other client: 60 requests per 60
seconds per client for profile, projects, and writing, and 120 per 60 seconds
for health. The API returns `RateLimit-*` headers on every response and
`Retry-After` on a 429.
