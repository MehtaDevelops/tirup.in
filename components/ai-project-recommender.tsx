"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import TextWithBlur from "./text-with-blur"
import { getProjectRecommendations } from "@/lib/actions"

// Tirup Mehta facts for random display
const tirupFacts = [
  "Tirup Mehta is a front-end developer with expertise in React and Next.js.",
  "Tirup specializes in cybersecurity solutions for startups and enterprises.",
  "Tirup has a background in UI/UX design with a focus on minimal aesthetics.",
  "Tirup Mehta is based in Gujarat, India and works with clients globally.",
  "Tirup combines technical expertise with design sensibility for holistic solutions.",
  "Tirup is passionate about creating secure, beautiful, and functional web experiences.",
  "Tirup Mehta has expertise in network security and penetration testing.",
  "Tirup believes in the power of minimalism to create impactful digital experiences.",
]

export default function AIProjectRecommender() {
  const [skills, setSkills] = useState("")
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [randomFact, setRandomFact] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Set a random Tirup fact on load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * tirupFacts.length)
    setRandomFact(tirupFacts[randomIndex])
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [skills])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!skills.trim()) {
      setError("Please enter your skills")
      return
    }

    setIsLoading(true)
    setError("")
    setRecommendations([])

    try {
      const result = await getProjectRecommendations(skills)
      if (result.success && result.recommendations) {
        setRecommendations(result.recommendations)
      } else {
        throw new Error(result.error || "Failed to get recommendations")
      }
    } catch (err) {
      console.error("Error details:", err)
      setError("Failed to get recommendations. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <TextWithBlur className="mb-12">
        <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6 text-center">AI Project Advisor</h2>
        <p className="text-xl font-light text-center text-black/70 mb-2">
          Enter your skills to get personalized project recommendations
        </p>
        <p className="text-sm font-light text-center text-black/50 mb-8">{randomFact}</p>
      </TextWithBlur>

      <TextWithBlur>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Enter any skills (e.g., React, Python, Node.js, UI/UX Design, AWS, Docker...)"
              className="w-full p-4 bg-white border border-black/10 rounded-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-colors resize-none min-h-[100px]"
              rows={3}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 border border-accent/30 rounded-sm hover:bg-accent/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Thinking..." : "Get Recommendations"}
            </button>
          </div>
        </form>
      </TextWithBlur>

      {recommendations.length > 0 && (
        <TextWithBlur className="mt-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-light mb-6">Project Recommendations</h3>
            <ul className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="p-4 border border-black/5 rounded-sm">
                  <p className="text-lg font-light">{recommendation}</p>
                </li>
              ))}
            </ul>
          </div>
        </TextWithBlur>
      )}
    </div>
  )
}
