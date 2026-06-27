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
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-[#d4d4d4] font-mono p-6 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      <div className="max-w-2xl w-full relative z-10">
        <div className="border border-white/10 rounded-sm bg-black/40 backdrop-blur-sm overflow-hidden shadow-2xl">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-white/40" />
              <span className="text-[10px] uppercase tracking-widest text-white/40">system_error.log</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-accent/40" />
            </div>
          </div>
          
          {/* Terminal Content */}
          <div className="p-5 md:p-12">
            <div className="flex items-start gap-4 md:gap-6 mb-8 md:mb-12">
              <div className="p-3 md:p-4 rounded-sm bg-accent/10 border border-accent/20 text-accent flex-shrink-0">
                <ShieldAlert size={24} className="md:w-8 md:h-8" />
              </div>
              <div>
                <h1 
                  className="text-2xl md:text-3xl font-light text-white mb-2 tracking-tight"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  404: We can't find the link, but we're glad we caught your attention.
                </h1>
                <p className="text-[10px] md:text-xs text-white/40 uppercase tracking-wider">RESOURCE_NOT_FOUND_EXCEPTION</p>
              </div>
            </div>
            
            <div className="space-y-1.5 md:y-2 mb-10 md:mb-12 overflow-hidden">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 md:gap-3 text-[10px] md:text-sm animate-in fade-in slide-in-from-left-2 duration-500">
                  <span className="text-white/20 whitespace-nowrap">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                  <span className={`${log?.includes("Warning") || log?.includes("COMPROMISED") ? "text-accent" : "text-white/60"} break-all`}>
                    {log}
                  </span>
                </div>
              ))}
              <div className="w-1.5 h-3 md:w-2 md:h-4 bg-accent animate-pulse inline-block align-middle ml-1" />
            </div>
            
            <Link 
              href="/" 
              className="inline-flex items-center gap-3 md:gap-4 text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/40 hover:text-accent transition-colors group"
            >
              <span>Execute Home_Return</span>
              <ArrowRight size={12} className="md:w-3.5 md:h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        
        <div className="mt-4 md:mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0 text-[8px] md:text-[10px] text-white/20 uppercase tracking-widest px-2 overflow-hidden">
          <span className="truncate max-w-full">Target: {pathname}</span>
          <span className="whitespace-nowrap">Status: Lost</span>
        </div>
      </div>
    </main>
  )
}
