"use client"

import type React from "react"

import { useState } from "react"
import { Github, Instagram, Linkedin, Twitter, Youtube, Globe, BookOpen, Cloud, Code, GraduationCap } from "lucide-react"

interface SocialLink {
  name: string
  url: string
  icon: React.ReactNode
  color: string
}

export default function SocialMediaButtons() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const socialLinks: SocialLink[] = [
    {
      name: "GitHub",
      url: "https://github.com/TirupMehta",
      icon: <Github size={16} />,
      color: "#333",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/TirupMehta",
      icon: <Linkedin size={16} />,
      color: "#0077B5",
    },
    {
      name: "Kaggle",
      url: "https://www.kaggle.com/TirupMehta",
      icon: <GraduationCap size={16} />,
      color: "#E1306C",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/TirupMehta",
      icon: <Instagram size={16} />,
      color: "#E1306C",
    },
    {
      name: "X (Twitter)",
      url: "https://x.com/TirupMehta",
      icon: <Twitter size={16} />,
      color: "#1DA1F2",
    },
    {
      name: "YouTube",
      url: "https://YouTube.com/@TirupMehta",
      icon: <Youtube size={16} />,
      color: "#FF0000",
    },
    {
      name: "Medium",
      url: "https://medium.com/@TirupMehta",
      icon: <BookOpen size={16} />,
      color: "#000000",
    },
    {
      name: "Google Dev",
      url: "https://g.dev/Tirup",
      icon: <Code size={16} />,
      color: "#EA4335",
    },
    {
      name: "Google Cloud",
      url: "https://www.cloudskillsboost.google/public_profiles/5de29c1c-84d0-46a5-a4eb-5fa999499184",
      icon: <Cloud size={16} />,
      color: "#4285F4",
    },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-6 max-w-[240px] md:max-w-none mx-auto">
      {socialLinks.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="social-button relative"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          aria-label={link.name}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 hover:scale-110 active:scale-90"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg)' }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>{link.icon}</span>
          </div>
          {hoveredIndex === index && (
            <div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-md text-xs whitespace-nowrap border-shadow"
              style={{
                animation: "fadeIn 0.2s ease-in-out",
                backgroundColor: 'var(--bg)',
                color: 'var(--text-secondary)',
              }}
            >
              {link.name}
            </div>
          )}
        </a>
      ))}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 5px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        
        .social-button:hover {
          transform: translateY(-2px);
        }
        
        .social-button {
          transition: transform 0.3s ease;
        }
      `}</style>
    </div>
  )
}
