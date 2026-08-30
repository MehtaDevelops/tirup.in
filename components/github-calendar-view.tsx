"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import type { MergedContributionsData, ContributionDay } from "@/lib/github-contributions"
import TextWithBlur from "@/components/text-with-blur"

interface GitHubCalendarViewProps {
  data: MergedContributionsData
}

type TabType = "combined" | "tirupMehta" | "mehtaDevelops"
type TimeRangeType = "1y" | "6m" | "3m"

export default function GitHubCalendarView({ data }: GitHubCalendarViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("combined")
  const [timeRange, setTimeRange] = useState<TimeRangeType>("1y")
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null)
  const [selectedDay, setSelectedDay] = useState<ContributionDay | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Default to 6-month view on mobile screens for optimal sizing and zero-scroll fit
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setTimeRange("6m")
    }
  }, [])

  // Auto-scroll calendar matrix to the current date (right) when in 1y mode on small viewports
  useEffect(() => {
    if (scrollContainerRef.current && timeRange === "1y") {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth
    }
  }, [activeTab, timeRange])

  const activeData = useMemo(() => {
    switch (activeTab) {
      case "tirupMehta":
        return {
          total: data.tirupMehta.total,
          days: data.tirupMehta.days,
          label: "TirupMehta",
          handle: "@TirupMehta",
          url: "https://github.com/TirupMehta",
        }
      case "mehtaDevelops":
        return {
          total: data.mehtaDevelops.total,
          days: data.mehtaDevelops.days,
          label: "MehtaDevelops",
          handle: "@MehtaDevelops",
          url: "https://github.com/MehtaDevelops",
        }
      default:
        return {
          total: data.combined.total,
          days: data.combined.days,
          label: "Combined Activity",
          handle: "All Accounts",
          url: "https://github.com/TirupMehta",
        }
    }
  }, [activeTab, data])

  // Filter days based on selected time range
  const filteredDays = useMemo(() => {
    const allDays = activeData.days || []
    if (allDays.length === 0) return []

    switch (timeRange) {
      case "3m":
        return allDays.slice(-91) // 13 weeks
      case "6m":
        return allDays.slice(-182) // 26 weeks
      case "1y":
      default:
        return allDays
    }
  }, [activeData.days, timeRange])

  // Group days into 7-day columns (weeks)
  const weeks = useMemo(() => {
    const days = filteredDays
    const result: ContributionDay[][] = []
    if (!days || days.length === 0) return result

    let currentWeek: ContributionDay[] = []

    const firstDate = new Date(days[0].date)
    const firstDayOfWeek = isNaN(firstDate.getTime()) ? 0 : firstDate.getUTCDay()
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: "", count: 0, level: 0 })
    }

    for (const day of days) {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: "", count: 0, level: 0 })
      }
      result.push(currentWeek)
    }

    return result
  }, [filteredDays])

  // Month label positions calculated per column index
  const monthLabels = useMemo(() => {
    const labels: { month: string; colIndex: number }[] = []
    let lastMonth = -1

    weeks.forEach((week, colIndex) => {
      const validDay = week.find((d) => d.date)
      if (validDay) {
        const d = new Date(validDay.date)
        if (!isNaN(d.getTime())) {
          const month = d.getUTCMonth()
          if (month !== lastMonth) {
            const monthName = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
            labels.push({ month: monthName, colIndex })
            lastMonth = month
          }
        }
      }
    })

    // Filter out initial label if it collides with the next month within 3 columns
    if (labels.length > 1 && labels[1].colIndex - labels[0].colIndex < 3) {
      labels.shift()
    }

    return labels
  }, [weeks])

  // Unified color scale using emerald opacities and site border tokens
  const getCellColor = (level: number, isSelected: boolean) => {
    let base = ""
    switch (level) {
      case 1:
        base = "bg-emerald-500/25 border-emerald-500/35"
        break
      case 2:
        base = "bg-emerald-500/50 border-emerald-500/60"
        break
      case 3:
        base = "bg-emerald-500/75 border-emerald-500/80"
        break
      case 4:
        base = "bg-emerald-500 border-emerald-400"
        break
      default:
        base = "bg-black/[0.025] dark:bg-white/[0.025] border-black/10 dark:border-white/10"
    }

    if (isSelected) {
      return `${base} ring-2 ring-accent ring-offset-1 ring-offset-background scale-125 z-10`
    }

    return base
  }

  const formatTooltipDate = (dateStr: string) => {
    if (!dateStr) return ""
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    } catch {
      return dateStr
    }
  }

  const activeInspectedDay = hoveredDay || selectedDay

  return (
    <div className="w-full pt-0">
      {/* Intro Narrative Section */}
      <div className="space-y-6 text-base md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl mb-12">
        <TextWithBlur delay={50}>
          <p>
            Engineering activity across my GitHub accounts. My primary profile is{" "}
            <a
              href="https://github.com/TirupMehta"
              target="_blank"
              rel="noopener noreferrer"
              className="link-hover hover:text-accent transition-colors font-normal text-black dark:text-white"
            >
              @TirupMehta
            </a>{" "}
            for systems research, security experiments, and technical essays. Open-source utilities, developer tooling, and client architectures are published under{" "}
            <a
              href="https://github.com/MehtaDevelops"
              target="_blank"
              rel="noopener noreferrer"
              className="link-hover hover:text-accent transition-colors font-normal text-black dark:text-white"
            >
              @MehtaDevelops
            </a>
            .
          </p>
        </TextWithBlur>
      </div>

      {/* Metrics Row */}
      <TextWithBlur delay={100}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 py-6 border-t border-black/10 dark:border-white/10">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-black/50 dark:text-white/50 font-light">Total Commits</span>
            <span className="text-2xl sm:text-3xl tabular-nums font-light text-black dark:text-white">
              {activeData.total}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-black/50 dark:text-white/50 font-light">Current Streak</span>
            <span className="text-2xl sm:text-3xl tabular-nums font-light text-black dark:text-white">
              {data.combined.currentStreak} <span className="text-sm font-normal text-black/40 dark:text-white/40">days</span>
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-black/50 dark:text-white/50 font-light">Longest Streak</span>
            <span className="text-2xl sm:text-3xl tabular-nums font-light text-black dark:text-white">
              {data.combined.longestStreak} <span className="text-sm font-normal text-black/40 dark:text-white/40">days</span>
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-black/50 dark:text-white/50 font-light">Peak Day</span>
            <span className="text-2xl sm:text-3xl tabular-nums font-light text-black dark:text-white">
              {data.combined.maxDayCount} <span className="text-sm font-normal text-black/40 dark:text-white/40">commits</span>
            </span>
          </div>
        </div>
      </TextWithBlur>

      {/* Account Switcher: Mobile Segmented Bar / Desktop Minimal Inline Tabs */}
      <TextWithBlur delay={150}>
        <div className="py-4 border-t border-black/10 dark:border-white/10 select-none">
          {/* Mobile Segmented Control */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] sm:hidden">
            <button
              onClick={() => {
                setActiveTab("combined")
                setSelectedDay(null)
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-md transition-all text-center cursor-pointer active:scale-[0.96] ${
                activeTab === "combined"
                  ? "bg-white dark:bg-white/15 text-black dark:text-white shadow-xs font-normal"
                  : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
              }`}
            >
              <span className="text-xs font-medium">Combined</span>
              <span className="text-[10px] opacity-60 tabular-nums">({data.combined.total})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("tirupMehta")
                setSelectedDay(null)
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-md transition-all text-center cursor-pointer active:scale-[0.96] ${
                activeTab === "tirupMehta"
                  ? "bg-white dark:bg-white/15 text-black dark:text-white shadow-xs font-normal"
                  : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
              }`}
            >
              <span className="text-xs font-medium">@TirupMehta</span>
              <span className="text-[10px] opacity-60">Main Profile</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("mehtaDevelops")
                setSelectedDay(null)
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-md transition-all text-center cursor-pointer active:scale-[0.96] ${
                activeTab === "mehtaDevelops"
                  ? "bg-white dark:bg-white/15 text-black dark:text-white shadow-xs font-normal"
                  : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
              }`}
            >
              <span className="text-xs font-medium">@MehtaDev</span>
              <span className="text-[10px] opacity-60 tabular-nums">({data.mehtaDevelops.total})</span>
            </button>
          </div>

          {/* Desktop Inline Tabs */}
          <div className="hidden sm:flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setActiveTab("combined")
                  setSelectedDay(null)
                }}
                className={`px-3.5 py-1.5 text-[13px] font-light rounded-md transition-colors duration-150 cursor-pointer active:scale-[0.97] ${
                  activeTab === "combined"
                    ? "text-black dark:text-white bg-black/[0.05] dark:bg-white/[0.09]"
                    : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
                }`}
              >
                Combined ({data.combined.total})
              </button>
              <button
                onClick={() => {
                  setActiveTab("tirupMehta")
                  setSelectedDay(null)
                }}
                className={`px-3.5 py-1.5 text-[13px] font-light rounded-md transition-colors duration-150 cursor-pointer active:scale-[0.97] inline-flex items-center gap-1.5 ${
                  activeTab === "tirupMehta"
                    ? "text-black dark:text-white bg-black/[0.05] dark:bg-white/[0.09]"
                    : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
                }`}
              >
                <span>@TirupMehta</span>
                <span className="text-[11px] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 font-normal">Main</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("mehtaDevelops")
                  setSelectedDay(null)
                }}
                className={`px-3.5 py-1.5 text-[13px] font-light rounded-md transition-colors duration-150 cursor-pointer active:scale-[0.97] ${
                  activeTab === "mehtaDevelops"
                    ? "text-black dark:text-white bg-black/[0.05] dark:bg-white/[0.09]"
                    : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
                }`}
              >
                @MehtaDevelops ({data.mehtaDevelops.total})
              </button>
            </div>

            <div className="text-[13px] text-black/50 dark:text-white/50 tabular-nums font-light shrink-0">
              {activeData.label}: <span className="text-black dark:text-white font-normal">{activeData.total} commits</span>
            </div>
          </div>
        </div>
      </TextWithBlur>

      {/* Calendar Matrix Section */}
      <TextWithBlur delay={200}>
        <div className="flex flex-col gap-3.5 py-6 border-t border-black/10 dark:border-white/10">
          {/* Active Hover / Tap Readout */}
          <div className="min-h-[26px] flex items-center justify-between text-xs sm:text-sm text-black/70 dark:text-white/70 font-light">
            {activeInspectedDay ? (
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-black dark:text-white font-normal">
                  {activeInspectedDay.count} {activeInspectedDay.count === 1 ? "contribution" : "contributions"}
                </span>
                <span className="text-black/40 dark:text-white/40">on</span>
                <span className="text-black dark:text-white">{formatTooltipDate(activeInspectedDay.date)}</span>
                {activeInspectedDay.details && (
                  <span className="text-[11px] sm:text-xs text-black/50 dark:text-white/50">
                    (TirupMehta: {activeInspectedDay.details.tirupMehta}, MehtaDevelops: {activeInspectedDay.details.mehtaDevelops})
                  </span>
                )}
              </div>
            ) : (
              <span className="text-black/40 dark:text-white/40 text-xs">
                Hover or tap days to inspect contribution volume.
              </span>
            )}
          </div>

          {/* Grid Container */}
          <div className="w-full select-none">
            <div
              ref={scrollContainerRef}
              className="w-full overflow-x-auto overflow-y-hidden py-1 px-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <div
                className={`flex gap-2 ${
                  timeRange === "1y" ? "min-w-[660px] sm:min-w-0 w-full" : "w-full"
                }`}
              >
                {/* Weekday indicators on the left */}
                <div className="flex flex-col justify-between pt-5 pb-0.5 text-[9px] text-black/40 dark:text-white/40 font-mono select-none pr-0.5 shrink-0">
                  <span className="opacity-0">Sun</span>
                  <span>Mon</span>
                  <span className="opacity-0">Tue</span>
                  <span>Wed</span>
                  <span className="opacity-0">Thu</span>
                  <span>Fri</span>
                  <span className="opacity-0">Sat</span>
                </div>

                {/* Columns & Month Headers */}
                <div className="flex-1 flex flex-col">
                  {/* Month Labels positioned proportionally across columns */}
                  <div className="relative w-full h-5 mb-1.5 text-[11px] text-black/40 dark:text-white/40 font-light">
                    {monthLabels.map(({ month, colIndex }) => (
                      <span
                        key={`${month}-${colIndex}`}
                        className="absolute top-0 whitespace-nowrap transform -translate-x-1/2 first:translate-x-0"
                        style={{
                          left: `${((colIndex + 0.5) / Math.max(weeks.length, 1)) * 100}%`,
                        }}
                      >
                        {month}
                      </span>
                    ))}
                  </div>

                  {/* Matrix Columns */}
                  <div className="flex gap-[2.5px] sm:gap-[3px] w-full items-stretch">
                    {weeks.map((week, colIdx) => {
                      const isFirstCol = colIdx === 0
                      const isLastCol = colIdx === weeks.length - 1
                      const originClass = isLastCol
                        ? "hover:origin-right"
                        : isFirstCol
                        ? "hover:origin-left"
                        : "hover:origin-center"

                      return (
                        <div key={colIdx} className="flex flex-col gap-[2.5px] sm:gap-[3px] flex-1">
                          {week.map((day, rowIdx) => {
                            if (!day.date) {
                              return <div key={rowIdx} className="w-full aspect-square opacity-0 pointer-events-none" />
                            }

                            const isSelected = selectedDay?.date === day.date

                            return (
                              <div
                                key={day.date}
                                onMouseEnter={() => setHoveredDay(day)}
                                onMouseLeave={() => setHoveredDay(null)}
                                onClick={() => setSelectedDay((prev) => (prev?.date === day.date ? null : day))}
                                className={`w-full aspect-square rounded-[2px] border transition-transform duration-100 cursor-pointer ${originClass} ${getCellColor(
                                  day.level,
                                  isSelected
                                )} hover:scale-135 hover:z-20`}
                                title={`${day.count} contributions on ${formatTooltipDate(day.date)}`}
                              />
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend & Minimalist Range Switcher */}
          <div className="flex items-center justify-between gap-2 pt-2 text-xs text-black/50 dark:text-white/50 font-light select-none">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">Range:</span>
              <div className="flex items-center gap-0.5 bg-black/[0.04] dark:bg-white/[0.06] p-0.5 rounded">
                {(["3m", "6m", "1y"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setTimeRange(r)
                      setSelectedDay(null)
                    }}
                    className={`px-1.5 py-0.5 text-[11px] rounded transition-colors uppercase cursor-pointer ${
                      timeRange === r
                        ? "bg-black/[0.08] dark:bg-white/[0.15] text-black dark:text-white font-medium"
                        : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <span className="text-[11px] sm:text-xs">Less</span>
              <div className="w-2.5 h-2.5 rounded-[1px] bg-black/[0.025] dark:bg-white/[0.025] border border-black/10 dark:border-white/10" />
              <div className="w-2.5 h-2.5 rounded-[1px] bg-emerald-500/25 border border-emerald-500/35" />
              <div className="w-2.5 h-2.5 rounded-[1px] bg-emerald-500/50 border border-emerald-500/60" />
              <div className="w-2.5 h-2.5 rounded-[1px] bg-emerald-500/75 border border-emerald-500/80" />
              <div className="w-2.5 h-2.5 rounded-[1px] bg-emerald-500 border border-emerald-400" />
              <span className="text-[11px] sm:text-xs">More</span>
            </div>
          </div>
        </div>
      </TextWithBlur>

      {/* Dual Account Directory List (Exact 100% match with Work page .list-hover-group) */}
      <div className="flex flex-col list-hover-group border-t border-black/10 dark:border-white/10 pt-2">
        {/* TirupMehta Row (Main Account) */}
        <TextWithBlur delay={250}>
          <a
            href="https://github.com/TirupMehta"
            target="_blank"
            rel="noopener noreferrer"
            className="group block py-5 -mx-3 px-3 rounded-lg hover:bg-black/[0.025] dark:hover:bg-white/[0.025] [transition:background-color_120ms_ease-out,transform_100ms_cubic-bezier(0.16,1,0.3,1)] active:scale-[0.99]"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm md:text-base leading-relaxed">
                <span className="font-medium text-black dark:text-white group-hover:text-accent [transition:color_80ms_ease-out] inline-flex items-center gap-1.5">
                  @TirupMehta
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 font-normal text-black/70 dark:text-white/70">Main Profile</span>
                </span>
                <span className="text-black/20 dark:text-white/20 select-none font-extralight">/</span>
                <span className="text-black/50 dark:text-white/50 font-light group-hover:text-black/70 dark:group-hover:text-white/70 [transition:color_80ms_ease-out] text-sm">
                  Primary profile — systems security research, cryptographic tools, and technical essays.
                </span>
              </div>
              <span className="font-mono tabular-nums text-xs md:text-sm text-black/40 dark:text-white/40 select-none shrink-0 group-hover:text-black/60 dark:group-hover:text-white/60 [transition:color_80ms_ease-out]">
                {data.tirupMehta.total} commits ↗
              </span>
            </div>
          </a>
        </TextWithBlur>

        {/* MehtaDevelops Row */}
        <TextWithBlur delay={300}>
          <a
            href="https://github.com/MehtaDevelops"
            target="_blank"
            rel="noopener noreferrer"
            className="group block py-5 -mx-3 px-3 rounded-lg border-t border-black/10 dark:border-white/10 hover:bg-black/[0.025] dark:hover:bg-white/[0.025] [transition:background-color_120ms_ease-out,transform_100ms_cubic-bezier(0.16,1,0.3,1)] active:scale-[0.99]"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm md:text-base leading-relaxed">
                <span className="font-medium text-black dark:text-white group-hover:text-accent [transition:color_80ms_ease-out]">
                  @MehtaDevelops
                </span>
                <span className="text-black/20 dark:text-white/20 select-none font-extralight">/</span>
                <span className="text-black/50 dark:text-white/50 font-light group-hover:text-black/70 dark:group-hover:text-white/70 [transition:color_80ms_ease-out] text-sm">
                  Development organization — open-source libraries, trace utilities, and client systems.
                </span>
              </div>
              <span className="font-mono tabular-nums text-xs md:text-sm text-black/40 dark:text-white/40 select-none shrink-0 group-hover:text-black/60 dark:group-hover:text-white/60 [transition:color_80ms_ease-out]">
                {data.mehtaDevelops.total} commits ↗
              </span>
            </div>
          </a>
        </TextWithBlur>
        <div className="border-t border-black/10 dark:border-white/10" />
      </div>
    </div>
  )
}
