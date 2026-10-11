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
    sec: 'Security',
  }
  return tags[0]
    .split(/[-_]+/)
    .map((word) => {
      const lower = word.toLowerCase()
      if (acronyms[lower]) return acronyms[lower]
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}
