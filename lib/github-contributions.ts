export interface ContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
  details?: {
    mehtaDevelops: number
    tirupMehta: number
  }
}

export interface MergedContributionsData {
  combined: {
    total: number
    days: ContributionDay[]
    currentStreak: number
    longestStreak: number
    maxDayCount: number
    bestDayDate: string
  }
  mehtaDevelops: {
    total: number
    days: ContributionDay[]
  }
  tirupMehta: {
    total: number
    days: ContributionDay[]
  }
}

function calculateLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 6) return 2
  if (count <= 12) return 3
  return 4
}

// Generate an empty 52-week calendar as zero-latency baseline
function generateFallbackCalendar(): { date: string; count: number; level: number }[] {
  const days: { date: string; count: number; level: number }[] = []
  const now = new Date()
  for (let i = 365; i >= 0; i--) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    days.push({ date: dateStr, count: 0, level: 0 })
  }
  return days
}

async function fetchUserContributions(username: string): Promise<{ total: number; days: { date: string; count: number; level: number }[] }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const data = await res.json()
    const days = Array.isArray(data.contributions) ? data.contributions : []
    const total = data.total?.lastYear ?? days.reduce((acc: number, d: { count: number }) => acc + (d.count || 0), 0)
    return { total, days }
  } catch (err) {
    console.warn(`[GitHub Contributions] Notice: live fetch for ${username} returned fallback:`, err)
    const fallbackDays = generateFallbackCalendar()
    return { total: 0, days: fallbackDays }
  }
}

export async function getMergedGitHubContributions(): Promise<MergedContributionsData> {
  const [tirupData, mehtaData] = await Promise.all([
    fetchUserContributions("TirupMehta"),
    fetchUserContributions("MehtaDevelops"),
  ])

  const dayMap = new Map<string, { tirup: number; mehta: number }>()

  // Populate from TirupMehta (Primary)
  for (const day of tirupData.days) {
    dayMap.set(day.date, { tirup: day.count || 0, mehta: 0 })
  }

  // Merge from MehtaDevelops (Secondary)
  for (const day of mehtaData.days) {
    const existing = dayMap.get(day.date) || { tirup: 0, mehta: 0 }
    existing.mehta = day.count || 0
    dayMap.set(day.date, existing)
  }

  const sortedDates = Array.from(dayMap.keys()).sort()

  const combinedDays: ContributionDay[] = []
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let maxDayCount = 0
  let bestDayDate = ""

  for (const date of sortedDates) {
    const counts = dayMap.get(date)!
    const totalCount = counts.tirup + counts.mehta

    if (totalCount > maxDayCount) {
      maxDayCount = totalCount
      bestDayDate = date
    }

    if (totalCount > 0) {
      tempStreak++
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
    } else {
      tempStreak = 0
    }

    combinedDays.push({
      date,
      count: totalCount,
      level: calculateLevel(totalCount),
      details: {
        tirupMehta: counts.tirup,
        mehtaDevelops: counts.mehta,
      },
    })
  }

  // Calculate current streak from the latest days
  for (let i = combinedDays.length - 1; i >= 0; i--) {
    if (combinedDays[i].count > 0) {
      currentStreak++
    } else {
      if (i === combinedDays.length - 1) continue
      break
    }
  }

  const mehtaDays: ContributionDay[] = mehtaData.days.map((d) => ({
    date: d.date,
    count: d.count || 0,
    level: calculateLevel(d.count || 0),
  }))

  const tirupDays: ContributionDay[] = tirupData.days.map((d) => ({
    date: d.date,
    count: d.count || 0,
    level: calculateLevel(d.count || 0),
  }))

  return {
    combined: {
      total: tirupData.total + mehtaData.total,
      days: combinedDays,
      currentStreak,
      longestStreak,
      maxDayCount,
      bestDayDate,
    },
    tirupMehta: {
      total: tirupData.total,
      days: tirupDays,
    },
    mehtaDevelops: {
      total: mehtaData.total,
      days: mehtaDays,
    },
  }
}
