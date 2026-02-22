"use server"

export async function getProjectRecommendations(skills: string) {
  if (!skills?.trim()) throw new Error("Skills are required")
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set")
    throw new Error("AI Service is currently unavailable")
  }

  const prompt = `Based on these skills: ${skills}, suggest 3-5 underrated but highly useful project ideas that would be valuable to build. Format your response as a list of project ideas only, with a brief one-sentence description for each.`

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024 },
        }),
      }
    )

    if (!response.ok) throw new Error(`API error: ${response.status}`)
    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error("Invalid response format")

    const recommendations = text.split(/\d+\.\s|\n-\s|\n•\s/).filter(Boolean).map((item: string) => item.trim())
    return { success: true, recommendations }
  } catch (error) {
    console.error("Error in getProjectRecommendations:", error)
    return { success: false, error: "Failed to get recommendations" }
  }
}
