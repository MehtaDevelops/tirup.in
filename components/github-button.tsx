import { Github } from "lucide-react"

interface GitHubButtonProps {
  repoUrl: string
  className?: string
}

export default function GitHubButton({ repoUrl, className = "" }: GitHubButtonProps) {
  return (
    <a
      href={`https://${repoUrl}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 text-sm font-light text-black/80 pb-1 link-hover ${className}`}
    >
      <Github size={16} />
      <span>View Source on GitHub</span>
    </a>
  )
}
