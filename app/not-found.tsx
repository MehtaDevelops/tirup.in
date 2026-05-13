"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, Terminal, ShieldAlert } from "lucide-react"

export default function NotFound() {
  const pathname = usePathname()
  const [logs, setLogs] = useState<string[]>([])
  
  useEffect(() => {
    const messages = [
      "Initializing recovery protocol...",
      `Attempting to locate: ${pathname}`,
      "Scanning internal project database...",
      "Warning: Page fragment not found (404)",
      "Security integrity: COMPROMISED",
      "Redirecting to safe zone..."
    ]
    
    let i = 0
    const interval = setInterval(() => {
      if (i < messages.length) {
        setLogs(prev => [...prev, messages[i]])
        i++
      } else {
        clearInterval(interval)
      }
    }, 800)
    
    return () => clearInterval(interval)
  }, [pathname])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#050505] text-black dark:text-[#d4d4d4] font-mono p-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      <div className="max-w-2xl w-full relative z-10">
        <div className="border border-black/10 dark:border-white/10 rounded-sm bg-white/40 dark:bg-black/40 backdrop-blur-sm overflow-hidden shadow-2xl">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-black/40 dark:text-white/40" />
              <span className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">system_error.log</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-black/10 dark:bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-black/10 dark:bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-accent/40" />
            </div>
          </div>
          
          {/* Terminal Content */}
          <div className="p-8 md:p-12">
            <div className="flex items-start gap-6 mb-12">
              <div className="p-4 rounded-sm bg-accent/10 border border-accent/20 text-accent">
                <ShieldAlert size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-light text-black dark:text-white mb-2 tracking-tighter uppercase">ERROR_404</h1>
                <p className="text-sm text-black/40 dark:text-white/40">RESOURCE_NOT_FOUND_EXCEPTION</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-12">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3 text-xs md:text-sm animate-in fade-in slide-in-from-left-2 duration-500">
                  <span className="text-black/20 dark:text-white/20">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                  <span className={log?.includes("Warning") || log?.includes("COMPROMISED") ? "text-accent" : "text-black/60 dark:text-white/60"}>
                    {log}
                  </span>
                </div>
              ))}
              <div className="w-2 h-4 bg-accent animate-pulse inline-block align-middle ml-1" />
            </div>
            
            <Link 
              href="/" 
              className="inline-flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 hover:text-accent dark:hover:text-accent transition-colors group"
            >
              <span>Execute Home_Return</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between items-center text-[10px] text-black/20 dark:text-white/20 uppercase tracking-widest px-2">
          <span>Target: {pathname}</span>
          <span>Status: Lost</span>
        </div>
      </div>
    </main>
  )
}
