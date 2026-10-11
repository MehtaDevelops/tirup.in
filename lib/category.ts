export function formatCategory(tags?: string[]): string {
  if (!tags || tags.length === 0 || !tags[0]) {
    return 'Dispatch'
  }
  const acronyms: Record<string, string> = {
    ai: 'AI',
    llm: 'LLM',
    llms: 'LLMs',
    api: 'API',
    apis: 'APIs',
    us: 'US',
    usa: 'USA',
    os: 'OS',
    ast: 'AST',
    tldr: 'TL;DR',
    css: 'CSS',
    html: 'HTML',
    js: 'JS',
    ts: 'TS',
    sql: 'SQL',
    ssrf: 'SSRF',
    url: 'URL',
  }
  const first = String(tags[0] ?? '').trim().replace(/[^a-zA-Z0-9 _-]/g, '')
  if (!first) return 'Dispatch'
  return first
    .split(/[-_]+/)
    .map((word) => {
      const lower = word.toLowerCase()
      if (acronyms[lower]) return acronyms[lower]
      // Preserve internal capitals (OAuth, WebSecurity) — only fix all-lower/upper words
      if (word.length > 1 && word.slice(1).match(/[A-Z]/)) return word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}
