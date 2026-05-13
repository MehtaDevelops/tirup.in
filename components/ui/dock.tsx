"use client"

import React, { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Home, Briefcase, Mail } from "lucide-react"
import { AnimatedThemeToggler } from "./animated-theme-toggler"
import { cn } from "@/lib/utils"

export default function Dock() {
  const [isScrollingUp, setIsScrollingUp] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setIsScrollingUp(false)
          } else {
            setIsScrollingUp(true)
          }
          setLastScrollY(currentScrollY)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const handleNav = (e: React.MouseEvent, href: string, id?: string) => {
    e.preventDefault()
    
    if (pathname === "/" && id) {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      router.push(href)
      // If we are navigating to home and have an ID, we wait for navigation and then scroll
      if (id) {
        setTimeout(() => {
          const element = document.getElementById(id)
          if (element) {
            element.scrollIntoView({ behavior: "smooth" })
          }
        }, 100)
      }
    }
  }

  const navItems = [
    { name: "Home", icon: <Home size={18} />, href: "/", id: "" },
    { name: "Work", icon: <Briefcase size={18} />, href: "/", id: "work" },
    { name: "Contact", icon: <Mail size={18} />, href: "/", id: "contact" },
  ]

  return (
    <div
      className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out will-change-transform",
        isScrollingUp ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
      )}
    >
      <nav className="flex items-center gap-2 p-2 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur-md shadow-xl">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.id ? `#${item.id}` : item.href}
            onClick={(e) => handleNav(e, item.href, item.id)}
            className="flex items-center justify-center w-10 h-10 rounded-full text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 group relative"
          >
            {item.icon}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black dark:bg-white text-white dark:text-black text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {item.name}
            </span>
          </a>
        ))}
        <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-1" />
        <AnimatedThemeToggler
          variant="circle"
          className="flex items-center justify-center w-10 h-10 rounded-full text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
        />
      </nav>
    </div>
  )
}
