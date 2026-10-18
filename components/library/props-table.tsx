export type PropRow = {
  name: string
  type: string
  defaultValue: string
  description: string
}

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="rounded-xl border border-zinc-900/10 dark:border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-zinc-900/10 dark:border-white/10 bg-zinc-900/[0.03] dark:bg-white/[0.03] text-left">
              <th className="px-4 py-2.5 font-mono font-medium text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Prop</th>
              <th className="px-4 py-2.5 font-mono font-medium text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Type</th>
              <th className="px-4 py-2.5 font-mono font-medium text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Default</th>
              <th className="px-4 py-2.5 font-mono font-medium text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.name}
                className="border-b border-zinc-900/5 dark:border-white/5 last:border-0 hover:bg-zinc-900/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-2.5 font-mono text-[13px] text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{r.name}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{r.type}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{r.defaultValue}</td>
                <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{r.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
