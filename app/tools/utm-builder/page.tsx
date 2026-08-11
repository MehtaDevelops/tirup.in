"use client"

import React, { useState, useEffect, useId } from "react"
import Header from "@/components/header"
import TextWithBlur from "@/components/text-with-blur"
import QrCodeModal from "@/components/qr-code-modal"
import QRCode from "qrcode"
import {
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  Globe,
  History,
  Trash2,
  Search,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Plus,
  Wand2,
  FileCode,
  Code,
  Download,
  CheckSquare,
  Square,
  Tag,
} from "lucide-react"

interface Preset {
  id: string
  label: string
  category: string
  source: string
  medium: string
  campaign: string
}

interface CustomParam {
  id: string
  key: string
  value: string
}

const PRESETS: Preset[] = [
  { id: "linkedin", label: "LinkedIn", category: "Social", source: "linkedin", medium: "social", campaign: "community_outreach" },
  { id: "x", label: "X (Twitter)", category: "Social", source: "x", medium: "social", campaign: "community_outreach" },
  { id: "facebook", label: "Facebook", category: "Social", source: "facebook", medium: "social", campaign: "community_outreach" },
  { id: "reddit", label: "Reddit", category: "Social", source: "reddit", medium: "social", campaign: "community_outreach" },
  { id: "newsletter", label: "Newsletter", category: "Email", source: "newsletter", medium: "email", campaign: "weekly_digest" },
  { id: "peerlist", label: "Peerlist", category: "Email", source: "peerlist", medium: "referral", campaign: "developer_showcase" },
  { id: "producthunt", label: "Product Hunt", category: "Launch", source: "producthunt", medium: "referral", campaign: "v1_launch" },
  { id: "github", label: "GitHub README", category: "Launch", source: "github", medium: "readme", campaign: "developer_tooling" },
]

const BULK_CHANNELS = [
  { id: "linkedin", name: "LinkedIn", source: "linkedin", medium: "social" },
  { id: "x", name: "X (Twitter)", source: "x", medium: "social" },
  { id: "facebook", name: "Facebook", source: "facebook", medium: "social" },
  { id: "newsletter", name: "Email Newsletter", source: "newsletter", medium: "email" },
  { id: "reddit", name: "Reddit", source: "reddit", medium: "social" },
  { id: "producthunt", name: "Product Hunt", source: "producthunt", medium: "referral" },
  { id: "peerlist", name: "Peerlist", source: "peerlist", medium: "referral" },
  { id: "youtube", name: "YouTube", source: "youtube", medium: "video" },
]

export default function UtmBuilderPage() {
  const baseUrlInputId = useId()
  const customPathId = useId()
  const utmSourceId = useId()
  const utmMediumId = useId()
  const utmCampaignId = useId()
  const utmContentId = useId()
  const utmTermId = useId()
  const bulkBaseUrlId = useId()
  const bulkCampaignId = useId()
  const inspectInputId = useId()

  const [activeTab, setActiveTab] = useState<"single" | "bulk" | "inspector">("single")

  // Single Studio State
  const [baseUrl, setBaseUrl] = useState("https://tirup.in")
  const [customPath, setCustomPath] = useState("")
  const [source, setSource] = useState("linkedin")
  const [medium, setMedium] = useState("social")
  const [campaign, setCampaign] = useState("community_outreach")
  const [content, setContent] = useState("")
  const [term, setTerm] = useState("")
  const [customParams, setCustomParams] = useState<CustomParam[]>([])
  const [copiedFormat, setCopiedFormat] = useState<"plain" | "markdown" | "html" | null>(null)

  // Inline QR Code State
  const [showInlineQr, setShowInlineQr] = useState(false)
  const [inlineQrDataUrl, setInlineQrDataUrl] = useState("")

  // Bulk Studio State
  const [bulkBaseUrl, setBulkBaseUrl] = useState("https://tirup.in")
  const [bulkCampaign, setBulkCampaign] = useState("summer_launch")
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["linkedin", "x"])
  const [copiedBulkId, setCopiedBulkId] = useState<string | null>(null)
  const [copiedBulkMarkdown, setCopiedBulkMarkdown] = useState(false)

  // Inspector State
  const [inspectUrl, setInspectUrl] = useState("")
  const [inspectedData, setInspectedData] = useState<{
    baseUrl: string
    path: string
    source: string
    medium: string
    campaign: string
    content: string
    term: string
    otherParams: Record<string, string>
  } | null>(null)

  // QR Code Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrModalUrl, setQrModalUrl] = useState("")

  // History State
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tirup_utm_studio_history")
      if (saved) {
        setHistory(JSON.parse(saved))
      }
    } catch (e) {}
  }, [])

  // Single URL Construction
  const cleanBaseUrl = baseUrl.trim()
    ? baseUrl.trim().startsWith("http")
      ? baseUrl.trim()
      : `https://${baseUrl.trim()}`
    : "https://tirup.in"
  const cleanPath = customPath.trim()
    ? customPath.trim().startsWith("/")
      ? customPath.trim()
      : `/${customPath.trim()}`
    : ""

  const params = new URLSearchParams()
  if (source.trim()) params.set("utm_source", source.trim().toLowerCase())
  if (medium.trim()) params.set("utm_medium", medium.trim().toLowerCase())
  if (campaign.trim()) params.set("utm_campaign", campaign.trim().toLowerCase())
  if (content.trim()) params.set("utm_content", content.trim().toLowerCase())
  if (term.trim()) params.set("utm_term", term.trim().toLowerCase())

  customParams.forEach((cp) => {
    if (cp.key.trim() && cp.value.trim()) {
      params.set(cp.key.trim(), cp.value.trim())
    }
  })

  const queryString = params.toString()
  const singleFinalUrl = `${cleanBaseUrl}${cleanPath}${queryString ? `?${queryString}` : ""}`

  // Render Inline QR code whenever singleFinalUrl changes
  useEffect(() => {
    if (singleFinalUrl) {
      QRCode.toDataURL(
        singleFinalUrl,
        {
          width: 260,
          margin: 2,
          color: { dark: "#000000", light: "#FFFFFF" },
        },
        (err, data) => {
          if (!err && data) setInlineQrDataUrl(data)
        }
      )
    }
  }, [singleFinalUrl])

  const applyPreset = (p: { source: string; medium: string; campaign: string }) => {
    setSource(p.source)
    setMedium(p.medium)
    setCampaign(p.campaign)
  }

  const addCustomParam = () => {
    setCustomParams([...customParams, { id: Date.now().toString(), key: "", value: "" }])
  }

  const updateCustomParam = (id: string, key: string, value: string) => {
    setCustomParams(customParams.map((p) => (p.id === id ? { ...p, key, value } : p)))
  }

  const removeCustomParam = (id: string) => {
    setCustomParams(customParams.filter((p) => p.id !== id))
  }

  const saveToHistory = (url: string) => {
    if (!history.includes(url)) {
      const updated = [url, ...history.slice(0, 14)]
      setHistory(updated)
      try {
        localStorage.setItem("tirup_utm_studio_history", JSON.stringify(updated))
      } catch (e) {}
    }
  }

  const copyFormat = async (format: "plain" | "markdown" | "html") => {
    let payload = singleFinalUrl
    if (format === "markdown") {
      const title = campaign ? campaign.replace(/_/g, " ") : "Campaign Link"
      payload = `[${title}](${singleFinalUrl})`
    } else if (format === "html") {
      payload = `<a href="${singleFinalUrl}">Campaign Link</a>`
    }

    try {
      await navigator.clipboard.writeText(payload)
      setCopiedFormat(format)
      setTimeout(() => setCopiedFormat(null), 2000)
      saveToHistory(singleFinalUrl)
    } catch (e) {}
  }

  // Focus helpers for parameter chips
  const focusInput = (elementId: string) => {
    const el = document.getElementById(elementId)
    if (el) {
      el.focus()
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // Bulk URL Generation
  const cleanBulkBase = bulkBaseUrl.trim()
    ? bulkBaseUrl.trim().startsWith("http")
      ? bulkBaseUrl.trim()
      : `https://${bulkBaseUrl.trim()}`
    : "https://tirup.in"
  const cleanBulkCamp = bulkCampaign.trim() ? bulkCampaign.trim().toLowerCase() : "campaign"

  const activeBulkChannels = BULK_CHANNELS.filter((c) => selectedChannels.includes(c.id))

  const bulkUrls = activeBulkChannels.map((ch) => {
    const p = new URLSearchParams()
    p.set("utm_source", ch.source)
    p.set("utm_medium", ch.medium)
    p.set("utm_campaign", cleanBulkCamp)
    return {
      channel: ch,
      url: `${cleanBulkBase}?${p.toString()}`,
    }
  })

  const toggleChannelSelect = (id: string) => {
    if (selectedChannels.includes(id)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== id))
      }
    } else {
      setSelectedChannels([...selectedChannels, id])
    }
  }

  const handleCopyBulk = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedBulkId(id)
      setTimeout(() => setCopiedBulkId(null), 2000)
      saveToHistory(url)
    } catch (e) {}
  }

  const copyBulkMarkdownList = async () => {
    const mdList = bulkUrls.map((b) => `- [${b.channel.name}](${b.url})`).join("\n")
    try {
      await navigator.clipboard.writeText(mdList)
      setCopiedBulkMarkdown(true)
      setTimeout(() => setCopiedBulkMarkdown(false), 2000)
    } catch (e) {}
  }

  const exportBulkCsv = () => {
    const rows = [
      ["Channel", "Source", "Medium", "Campaign", "Tagged URL"],
      ...bulkUrls.map((b) => [
        b.channel.name,
        b.channel.source,
        b.channel.medium,
        cleanBulkCamp,
        b.url,
      ]),
    ]
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map((cell) => `"${cell}"`).join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `utm_campaign_${cleanBulkCamp}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // URL Deconstruction & Sanitizer / Fixer
  const handleInspect = (rawUrl: string) => {
    setInspectUrl(rawUrl)
    if (!rawUrl.trim()) {
      setInspectedData(null)
      return
    }

    try {
      const parsedUrl = new URL(rawUrl.trim().startsWith("http") ? rawUrl.trim() : `https://${rawUrl.trim()}`)
      const searchP = new URLSearchParams(parsedUrl.search)

      const s = searchP.get("utm_source") || ""
      const m = searchP.get("utm_medium") || ""
      const c = searchP.get("utm_campaign") || ""
      const cnt = searchP.get("utm_content") || ""
      const t = searchP.get("utm_term") || ""

      const other: Record<string, string> = {}
      searchP.forEach((val, key) => {
        if (!key.startsWith("utm_")) {
          other[key] = val
        }
      })

      setInspectedData({
        baseUrl: `${parsedUrl.protocol}//${parsedUrl.host}`,
        path: parsedUrl.pathname,
        source: s,
        medium: m,
        campaign: c,
        content: cnt,
        term: t,
        otherParams: other,
      })
    } catch (err) {
      setInspectedData(null)
    }
  }

  const cleanAndFixInspectUrl = () => {
    if (!inspectUrl.trim()) return
    try {
      const parsedUrl = new URL(inspectUrl.trim().startsWith("http") ? inspectUrl.trim() : `https://${inspectUrl.trim()}`)
      const searchP = new URLSearchParams(parsedUrl.search)
      const cleanParams = new URLSearchParams()

      // Strip known tracking junk parameters
      const junkKeys = ["fbclid", "msclkid", "_ga", "mc_eid", "ref_src"]

      searchP.forEach((val, key) => {
        const lowerKey = key.toLowerCase()
        if (!junkKeys.includes(lowerKey)) {
          cleanParams.set(lowerKey, val.toLowerCase())
        }
      })

      const cleanedPath = parsedUrl.pathname.replace(/\/+/g, "/")
      const fixed = `${parsedUrl.protocol}//${parsedUrl.host}${cleanedPath}${cleanParams.toString() ? `?${cleanParams.toString()}` : ""}`
      
      setInspectUrl(fixed)
      handleInspect(fixed)
    } catch (e) {}
  }

  const applyInspectedToSingle = () => {
    if (!inspectedData) return
    setBaseUrl(inspectedData.baseUrl)
    setCustomPath(inspectedData.path)
    setSource(inspectedData.source)
    setMedium(inspectedData.medium)
    setCampaign(inspectedData.campaign)
    setContent(inspectedData.content)
    setTerm(inspectedData.term)
    setActiveTab("single")
  }

  const clearHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem("tirup_utm_studio_history")
    } catch (e) {}
  }

  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <Header />

      <section className="section max-w-4xl mx-auto w-full px-6 md:px-20 pb-20">
        {/* Header Title */}
        <TextWithBlur delay={50}>
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-accent uppercase font-medium mb-2">
              <Sparkles size={14} /> Developer Utility
            </div>
            <h1 className="text-3xl md:text-4xl font-serif italic font-medium text-black dark:text-white mb-2">
              GA4 Campaign URL Builder
            </h1>
            <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 max-w-2xl leading-relaxed">
              Generate tagged links for social posts, newsletters, and community outreach. Eliminate <span className="font-normal text-black dark:text-white">(direct) / (none)</span> traffic leakage in GA4.
            </p>
          </div>
        </TextWithBlur>

        {/* Minimal Tab Filter Bar - Single Bottom Separator Line */}
        <TextWithBlur delay={80}>
          <div className="flex flex-wrap items-center gap-2 mb-6 pb-3 border-b border-black/10 dark:border-white/10">
            <span className="text-xs font-mono uppercase tracking-wider text-black/40 dark:text-white/40 mr-2 flex items-center gap-1">
              <Tag size={13} /> Mode:
            </span>
            <button
              onClick={() => setActiveTab("single")}
              className={`text-sm px-4 py-2 rounded-none border transition-all duration-200 ${
                activeTab === "single"
                  ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-sm"
                  : "bg-white/80 dark:bg-zinc-900/80 border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:border-black/30 dark:hover:border-white/30"
              }`}
            >
              Single Builder
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`text-sm px-4 py-2 rounded-none border transition-all duration-200 ${
                activeTab === "bulk"
                  ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-sm"
                  : "bg-white/80 dark:bg-zinc-900/80 border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:border-black/30 dark:hover:border-white/30"
              }`}
            >
              Bulk 8-Channel Suite
            </button>
            <button
              onClick={() => setActiveTab("inspector")}
              className={`text-sm px-4 py-2 rounded-none border transition-all duration-200 ${
                activeTab === "inspector"
                  ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-sm"
                  : "bg-white/80 dark:bg-zinc-900/80 border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:border-black/30 dark:hover:border-white/30"
              }`}
            >
              URL Inspector
            </button>
          </div>
        </TextWithBlur>

        {/* ── TAB 1: SINGLE BUILDER ── */}
        {activeTab === "single" && (
          <div className="space-y-6">
            
            {/* Presets Selection */}
            <TextWithBlur delay={100}>
              <div className="mb-2">
                <span className="text-xs uppercase font-mono tracking-wider text-black/40 dark:text-white/40 block mb-2.5 font-medium">
                  Quick Channel Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p)}
                      className={`text-sm px-3.5 py-1.5 rounded-none border transition-all duration-200 ${
                        source === p.source && medium === p.medium && campaign === p.campaign
                          ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-sm"
                          : "bg-white/80 dark:bg-zinc-900/80 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </TextWithBlur>

            {/* Inputs Form Section - Single Bottom Divider */}
            <TextWithBlur delay={120}>
              <div className="space-y-5 pb-6 border-b border-black/10 dark:border-white/10">
                
                {/* Target Domain & Path */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor={baseUrlInputId} className="block text-xs font-mono uppercase tracking-wider text-black/60 dark:text-white/60 mb-2 font-medium">
                      Target Website Domain <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={baseUrlInputId}
                      type="url"
                      placeholder="https://tirup.in or https://yourdomain.com"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label htmlFor={customPathId} className="block text-xs font-mono uppercase tracking-wider text-black/60 dark:text-white/60 mb-2 font-medium">
                      Target Path <span className="text-[10px] opacity-60">(optional)</span>
                    </label>
                    <input
                      id={customPathId}
                      type="text"
                      placeholder="/work or /blogs/slug"
                      value={customPath}
                      onChange={(e) => setCustomPath(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Core Campaign Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label htmlFor={utmSourceId} className="block text-xs font-mono uppercase tracking-wider text-black/60 dark:text-white/60 mb-2 font-medium">
                      utm_source <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={utmSourceId}
                      type="text"
                      placeholder="e.g. linkedin, newsletter"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent"
                    />
                    <span className="text-xs text-black/50 dark:text-white/50 mt-1 block">Referrer platform</span>
                  </div>

                  <div>
                    <label htmlFor={utmMediumId} className="block text-xs font-mono uppercase tracking-wider text-black/60 dark:text-white/60 mb-2 font-medium">
                      utm_medium <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={utmMediumId}
                      type="text"
                      placeholder="e.g. social, email, referral"
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent"
                    />
                    <span className="text-xs text-black/50 dark:text-white/50 mt-1 block">Marketing channel medium</span>
                  </div>

                  <div>
                    <label htmlFor={utmCampaignId} className="block text-xs font-mono uppercase tracking-wider text-black/60 dark:text-white/60 mb-2 font-medium">
                      utm_campaign <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={utmCampaignId}
                      type="text"
                      placeholder="e.g. community_outreach"
                      value={campaign}
                      onChange={(e) => setCampaign(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent"
                    />
                    <span className="text-xs text-black/50 dark:text-white/50 mt-1 block">Campaign theme or launch</span>
                  </div>
                </div>

                {/* Optional Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-black/5 dark:border-white/5">
                  <div>
                    <label htmlFor={utmContentId} className="block text-xs font-mono uppercase tracking-wider text-black/50 dark:text-white/50 mb-1.5 font-medium">
                      utm_content <span className="text-[10px] opacity-60">(optional)</span>
                    </label>
                    <input
                      id={utmContentId}
                      type="text"
                      placeholder="e.g. cta_button, header_link"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label htmlFor={utmTermId} className="block text-xs font-mono uppercase tracking-wider text-black/50 dark:text-white/50 mb-1.5 font-medium">
                      utm_term <span className="text-[10px] opacity-60">(optional)</span>
                    </label>
                    <input
                      id={utmTermId}
                      type="text"
                      placeholder="e.g. web_security, react"
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Custom Dynamic Parameters Builder */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-mono tracking-wider text-black/50 dark:text-white/50 font-medium">
                      Custom Query Parameters
                    </span>
                    <button
                      type="button"
                      onClick={addCustomParam}
                      className="text-xs text-accent hover:underline flex items-center gap-1 font-mono font-medium"
                    >
                      <Plus size={14} /> Add Parameter
                    </button>
                  </div>

                  {customParams.length > 0 && (
                    <div className="space-y-2">
                      {customParams.map((p) => (
                        <div key={p.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Key (e.g. ref)"
                            value={p.key}
                            onChange={(e) => updateCustomParam(p.id, e.target.value, p.value)}
                            className="flex-1 text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g. newsletter)"
                            value={p.value}
                            onChange={(e) => updateCustomParam(p.id, p.key, e.target.value)}
                            className="flex-1 text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => removeCustomParam(p.id)}
                            className="p-2 text-black/40 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TextWithBlur>

            {/* Live Output Box */}
            <TextWithBlur delay={150}>
              <div className="p-6 md:p-8 rounded-none bg-zinc-900 text-white dark:bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5 font-medium">
                    <LinkIcon size={14} className="text-accent" /> Generated Tagged Link Output
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowInlineQr(!showInlineQr)}
                      className="text-xs px-3 py-1 rounded-none bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex items-center gap-1 font-mono"
                    >
                      <QrCode size={13} /> {showInlineQr ? "Hide QR" : "Show QR"}
                    </button>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-none border border-emerald-800">
                      GA4 Ready
                    </span>
                  </div>
                </div>

                {/* Interactive Parameter Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {source && (
                    <button
                      onClick={() => focusInput(utmSourceId)}
                      className="text-sm font-mono px-3 py-1 rounded-none bg-zinc-800 text-emerald-300 hover:bg-zinc-700 transition-colors cursor-pointer border border-zinc-700"
                    >
                      utm_source: {source}
                    </button>
                  )}
                  {medium && (
                    <button
                      onClick={() => focusInput(utmMediumId)}
                      className="text-sm font-mono px-3 py-1 rounded-none bg-zinc-800 text-emerald-300 hover:bg-zinc-700 transition-colors cursor-pointer border border-zinc-700"
                    >
                      utm_medium: {medium}
                    </button>
                  )}
                  {campaign && (
                    <button
                      onClick={() => focusInput(utmCampaignId)}
                      className="text-sm font-mono px-3 py-1 rounded-none bg-zinc-800 text-emerald-300 hover:bg-zinc-700 transition-colors cursor-pointer border border-zinc-700"
                    >
                      utm_campaign: {campaign}
                    </button>
                  )}
                </div>

                {/* Generated Code Output */}
                <div className="p-4 md:p-5 rounded-none bg-black/80 font-mono text-sm md:text-base text-emerald-400 break-all select-all border border-zinc-800/90 leading-relaxed shadow-inner">
                  {singleFinalUrl}
                </div>

                {/* Inline QR Code Exporter */}
                {showInlineQr && inlineQrDataUrl && (
                  <div className="p-4 rounded-none bg-black/40 border border-zinc-800 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
                    <img src={inlineQrDataUrl} alt="QR Code" className="w-44 h-44 bg-white p-2 rounded-none" />
                    <div className="space-y-2 text-center sm:text-left">
                      <p className="text-sm text-zinc-200 font-mono font-medium">Vector Campaign QR Code</p>
                      <a
                        href={inlineQrDataUrl}
                        download="campaign-qr-code.png"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-none bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors shadow-sm"
                      >
                        <Download size={14} /> Download PNG
                      </a>
                    </div>
                  </div>
                )}

                {/* Multi-Format Copy Actions */}
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => copyFormat("plain")}
                    className="flex-1 min-w-[130px] px-4 py-2.5 rounded-none bg-white text-black font-medium text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {copiedFormat === "plain" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copiedFormat === "plain" ? "Copied Plain!" : "Copy Plain URL"}
                  </button>

                  <button
                    type="button"
                    onClick={() => copyFormat("markdown")}
                    className="flex-1 min-w-[130px] px-4 py-2.5 rounded-none bg-zinc-800 text-zinc-200 hover:text-white font-medium text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5 font-mono"
                  >
                    {copiedFormat === "markdown" ? <Check size={14} className="text-emerald-400" /> : <FileCode size={14} />}
                    {copiedFormat === "markdown" ? "Copied Markdown!" : "Copy Markdown"}
                  </button>

                  <button
                    type="button"
                    onClick={() => copyFormat("html")}
                    className="flex-1 min-w-[130px] px-4 py-2.5 rounded-none bg-zinc-800 text-zinc-200 hover:text-white font-medium text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5 font-mono"
                  >
                    {copiedFormat === "html" ? <Check size={14} className="text-emerald-400" /> : <Code size={14} />}
                    {copiedFormat === "html" ? "Copied HTML!" : "Copy HTML"}
                  </button>

                  <a
                    href={singleFinalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-none bg-zinc-800 text-zinc-300 hover:text-white font-medium text-sm hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
                  >
                    Test Link <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </TextWithBlur>
          </div>
        )}

        {/* ── TAB 2: BULK 8-CHANNEL SUITE ── */}
        {activeTab === "bulk" && (
          <div className="space-y-6">
            <TextWithBlur delay={100}>
              <div className="space-y-5 pb-6 border-b border-black/10 dark:border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={bulkBaseUrlId} className="block text-xs font-mono uppercase tracking-wider text-black/60 dark:text-white/60 mb-1.5 flex items-center gap-1 font-medium">
                      <Globe size={13} /> Target Base URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={bulkBaseUrlId}
                      type="url"
                      placeholder="https://tirup.in/work"
                      value={bulkBaseUrl}
                      onChange={(e) => setBulkBaseUrl(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label htmlFor={bulkCampaignId} className="block text-xs font-mono uppercase tracking-wider text-black/60 dark:text-white/60 mb-1.5 font-medium">
                      Campaign Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={bulkCampaignId}
                      type="text"
                      placeholder="e.g. summer_launch_2026"
                      value={bulkCampaign}
                      onChange={(e) => setBulkCampaign(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Channel Selector Toggles */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5">
                  <span className="text-xs uppercase font-mono tracking-wider text-black/50 dark:text-white/50 block mb-2 font-medium">
                    Select Channels ({selectedChannels.length}/8):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {BULK_CHANNELS.map((ch) => {
                      const isSelected = selectedChannels.includes(ch.id)
                      return (
                        <button
                          key={ch.id}
                          onClick={() => toggleChannelSelect(ch.id)}
                          className={`text-sm px-3.5 py-1.5 rounded-none border flex items-center gap-2 transition-all ${
                            isSelected
                              ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium"
                              : "bg-white dark:bg-zinc-900 border-black/10 dark:border-white/10 text-black/60 dark:text-white/60"
                          }`}
                        >
                          {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                          {ch.name}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end pt-2">
                  <button
                    onClick={copyBulkMarkdownList}
                    className="px-4 py-2 rounded-none border border-black/10 dark:border-white/10 font-medium text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5"
                  >
                    {copiedBulkMarkdown ? <Check size={14} className="text-emerald-500" /> : <FileCode size={14} />}
                    {copiedBulkMarkdown ? "Copied Markdown List!" : "Copy Markdown List"}
                  </button>

                  <button
                    onClick={exportBulkCsv}
                    className="px-5 py-2 rounded-none bg-black text-white dark:bg-white dark:text-black font-medium text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <FileSpreadsheet size={14} /> Export CSV
                  </button>
                </div>
              </div>
            </TextWithBlur>

            {/* Multi-Channel List */}
            <TextWithBlur delay={150}>
              <div className="flex flex-col border-t border-black/10 dark:border-white/10">
                {bulkUrls.map((b) => (
                  <div
                    key={b.channel.id}
                    className="py-4 border-b border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-black dark:text-white font-mono">{b.channel.name}</span>
                        <span className="text-xs font-mono opacity-50">
                          ({b.channel.source} / {b.channel.medium})
                        </span>
                      </div>
                      <p className="font-mono text-sm text-emerald-600 dark:text-emerald-400 truncate">
                        {b.url}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setQrModalUrl(b.url)
                          setQrModalOpen(true)
                        }}
                        className="p-2 rounded-none border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                        title="QR Code"
                      >
                        <QrCode size={14} />
                      </button>
                      <button
                        onClick={() => handleCopyBulk(b.channel.id, b.url)}
                        className="px-4 py-2 rounded-none bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-sm font-medium text-black dark:text-white transition-colors flex items-center gap-1.5"
                      >
                        {copiedBulkId === b.channel.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {copiedBulkId === b.channel.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </TextWithBlur>
          </div>
        )}

        {/* ── TAB 3: URL INSPECTOR ── */}
        {activeTab === "inspector" && (
          <div className="space-y-6">
            <TextWithBlur delay={100}>
              <div className="pb-6 border-b border-black/10 dark:border-white/10">
                <div>
                  <label htmlFor={inspectInputId} className="block text-xs font-mono uppercase tracking-wider text-black/60 dark:text-white/60 mb-2 flex items-center gap-1.5 font-medium">
                    <Search size={14} /> Paste Any Tagged URL to Inspect & Sanitize
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id={inspectInputId}
                      type="text"
                      placeholder="https://tirup.in/work?utm_source=linkedin&utm_medium=social&utm_campaign=outreach&fbclid=123"
                      value={inspectUrl}
                      onChange={(e) => handleInspect(e.target.value)}
                      className="flex-1 text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent font-mono"
                    />
                    {inspectUrl.trim() && (
                      <button
                        onClick={cleanAndFixInspectUrl}
                        className="px-4 py-2.5 rounded-none bg-black text-white dark:bg-white dark:text-black font-medium text-sm flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
                        title="Remove fbclid/junk & normalize lower-case"
                      >
                        <Wand2 size={14} /> Auto-Fix URL
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </TextWithBlur>

            {inspectedData ? (
              <TextWithBlur delay={150}>
                <div className="flex flex-col border-t border-black/10 dark:border-white/10">
                  <div className="py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs uppercase font-mono tracking-wider text-black/50 dark:text-white/50 flex items-center gap-1.5 font-medium">
                      <ShieldCheck size={15} className="text-accent" /> Parameter Breakdown Diagnostics
                    </span>
                    <button
                      onClick={applyInspectedToSingle}
                      className="text-sm px-3.5 py-1.5 rounded-none border border-black/10 dark:border-white/10 text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1"
                    >
                      Edit in Studio <ArrowRight size={13} />
                    </button>
                  </div>

                  <div className="py-4 border-b border-black/10 dark:border-white/10 flex justify-between items-baseline gap-4 font-mono text-sm">
                    <span className="text-black/50 dark:text-white/50 uppercase text-xs">Base Domain & Path</span>
                    <span className="text-black dark:text-white break-all font-medium text-right">{inspectedData.baseUrl}{inspectedData.path}</span>
                  </div>

                  <div className="py-4 border-b border-black/10 dark:border-white/10 flex justify-between items-baseline gap-4 font-mono text-sm">
                    <span className="text-black/50 dark:text-white/50 uppercase text-xs">utm_source</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{inspectedData.source || "(not specified)"}</span>
                  </div>

                  <div className="py-4 border-b border-black/10 dark:border-white/10 flex justify-between items-baseline gap-4 font-mono text-sm">
                    <span className="text-black/50 dark:text-white/50 uppercase text-xs">utm_medium</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{inspectedData.medium || "(not specified)"}</span>
                  </div>

                  <div className="py-4 border-b border-black/10 dark:border-white/10 flex justify-between items-baseline gap-4 font-mono text-sm">
                    <span className="text-black/50 dark:text-white/50 uppercase text-xs">utm_campaign</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{inspectedData.campaign || "(not specified)"}</span>
                  </div>
                </div>
              </TextWithBlur>
            ) : inspectUrl.trim() ? (
              <div className="py-4 border-b border-black/10 dark:border-white/10 text-red-500 text-sm font-mono">
                Invalid URL format. Please paste a valid URL string starting with http:// or https://
              </div>
            ) : null}
          </div>
        )}

        {/* ── SAVED RECENT HISTORY ── */}
        {history.length > 0 && (
          <TextWithBlur delay={250}>
            <div className="mt-10 pt-4 border-t border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs uppercase font-mono tracking-wider text-black/50 dark:text-white/50 flex items-center gap-1.5 font-medium">
                  <History size={14} /> Recent Generated Links
                </h2>
                <button
                  onClick={clearHistory}
                  className="text-xs font-mono text-red-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 size={12} /> Clear History
                </button>
              </div>

              <div className="flex flex-col border-t border-black/10 dark:border-white/10">
                {history.map((url, i) => (
                  <div key={i} className="py-3.5 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-3 text-sm font-mono">
                    <span className="truncate text-black/70 dark:text-white/70 flex-1">{url}</span>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => {
                          setQrModalUrl(url)
                          setQrModalOpen(true)
                        }}
                        className="text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors"
                        title="QR Code"
                      >
                        <QrCode size={14} />
                      </button>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(url)
                        }}
                        className="text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors"
                        title="Copy"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TextWithBlur>
        )}
      </section>

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        url={qrModalUrl}
        title="Campaign URL QR Code"
      />

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-black/10 dark:border-white/10">
        <p className="text-xs text-black/50 dark:text-white/50" suppressHydrationWarning>© {currentYear} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
