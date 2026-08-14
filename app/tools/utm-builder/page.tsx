"use client"

import React, { useState, useEffect, useId, useMemo, useCallback } from "react"
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
  AlertCircle,
  CheckCircle2,
  Layers,
  BookmarkPlus,
  RotateCcw,
  FileJson,
  Eye,
  Info,
} from "lucide-react"

// Types
interface Preset {
  id: string
  label: string
  category: "Social" | "Email" | "Developer" | "Paid Ads" | "Custom"
  source: string
  medium: string
  campaign: string
  content?: string
}

interface CustomParam {
  id: string
  key: string
  value: string
}

interface SavedTemplate {
  id: string
  name: string
  source: string
  medium: string
  campaign: string
  content?: string
  term?: string
}

// 16 Standard Presets across 4 Core Categories
const DEFAULT_PRESETS: Preset[] = [
  // Social
  { id: "linkedin", label: "LinkedIn", category: "Social", source: "linkedin", medium: "social", campaign: "community_outreach" },
  { id: "x", label: "X (Twitter)", category: "Social", source: "x", medium: "social", campaign: "community_outreach" },
  { id: "reddit", label: "Reddit", category: "Social", source: "reddit", medium: "social", campaign: "community_discussion" },
  { id: "threads", label: "Threads", category: "Social", source: "threads", medium: "social", campaign: "community_outreach" },
  { id: "instagram", label: "Instagram", category: "Social", source: "instagram", medium: "social", campaign: "bio_link" },
  { id: "youtube", label: "YouTube", category: "Social", source: "youtube", medium: "video", campaign: "video_description" },
  { id: "facebook", label: "Facebook", category: "Social", source: "facebook", medium: "social", campaign: "community_post" },
  { id: "bluesky", label: "Bluesky", category: "Social", source: "bluesky", medium: "social", campaign: "community_outreach" },

  // Email & Newsletter
  { id: "newsletter", label: "Email Newsletter", category: "Email", source: "newsletter", medium: "email", campaign: "weekly_digest" },
  { id: "substack", label: "Substack", category: "Email", source: "substack", medium: "email", campaign: "publication_post" },
  { id: "beehiiv", label: "Beehiiv", category: "Email", source: "beehiiv", medium: "email", campaign: "editorial_link" },

  // Developer & Launch
  { id: "producthunt", label: "Product Hunt", category: "Developer", source: "producthunt", medium: "referral", campaign: "v1_launch" },
  { id: "peerlist", label: "Peerlist", category: "Developer", source: "peerlist", medium: "referral", campaign: "developer_showcase" },
  { id: "github", label: "GitHub README", category: "Developer", source: "github", medium: "readme", campaign: "open_source" },
  { id: "hackernews", label: "Hacker News", category: "Developer", source: "hackernews", medium: "referral", campaign: "show_hn" },

  // Paid Ads
  { id: "google-ads", label: "Google Ads", category: "Paid Ads", source: "google", medium: "cpc", campaign: "brand_search" },
  { id: "meta-ads", label: "Meta Ads", category: "Paid Ads", source: "facebook", medium: "cpc", campaign: "retargeting_q3" },
  { id: "linkedin-ads", label: "LinkedIn Ads", category: "Paid Ads", source: "linkedin", medium: "cpc", campaign: "sponsored_content" },
]

// 12 Bulk Channels for Multi-Channel Distribution Matrix
const BULK_CHANNELS = [
  { id: "linkedin", name: "LinkedIn", category: "Social", source: "linkedin", medium: "social" },
  { id: "x", name: "X (Twitter)", category: "Social", source: "x", medium: "social" },
  { id: "reddit", name: "Reddit", category: "Social", source: "reddit", medium: "social" },
  { id: "threads", name: "Threads", category: "Social", source: "threads", medium: "social" },
  { id: "instagram", name: "Instagram", category: "Social", source: "instagram", medium: "social" },
  { id: "newsletter", name: "Email Newsletter", category: "Email", source: "newsletter", medium: "email" },
  { id: "producthunt", name: "Product Hunt", category: "Launch", source: "producthunt", medium: "referral" },
  { id: "peerlist", name: "Peerlist", category: "Launch", source: "peerlist", medium: "referral" },
  { id: "github", name: "GitHub README", category: "Launch", source: "github", medium: "readme" },
  { id: "hackernews", name: "Hacker News", category: "Launch", source: "hackernews", medium: "referral" },
  { id: "youtube", name: "YouTube", category: "Media", source: "youtube", medium: "video" },
  { id: "facebook", name: "Facebook", category: "Social", source: "facebook", medium: "social" },
]

// Tracking Junk Parameter Blacklist for Inspector 2.0
const TRACKING_JUNK_PARAMS = [
  "fbclid",
  "gclid",
  "msclkid",
  "twclid",
  "igshid",
  "ttclid",
  "mc_eid",
  "mc_cid",
  "_ga",
  "_gl",
  "ref_src",
  "yclid",
  "dclid",
  "wbraid",
  "gbraid",
  "wickedid",
  "s_kwcid",
  "ef_id",
]

/**
 * Predicts the GA4 Default Channel Grouping based on Google's official categorization logic
 */
function predictGa4ChannelGroup(source: string, medium: string): { group: string; status: "optimal" | "warning" | "info"; reason: string } {
  const s = source.trim().toLowerCase()
  const m = medium.trim().toLowerCase()

  if (!s && !m) {
    return { group: "Direct / None", status: "warning", reason: "Missing UTM tags will cause traffic to fall into (direct) / (none)." }
  }

  const socialSources = ["facebook", "linkedin", "x", "twitter", "reddit", "threads", "instagram", "youtube", "tiktok", "bluesky", "mastodon", "pinterest"]
  const searchSources = ["google", "bing", "yahoo", "duckduckgo", "baidu", "ecosia"]

  // Paid Search
  if (searchSources.some(src => s.includes(src)) && ["cpc", "ppc", "paidsearch", "paid-search"].includes(m)) {
    return { group: "Paid Search", status: "optimal", reason: "Standard search engine source with cpc/paid medium." }
  }

  // Paid Social
  if (socialSources.some(src => s.includes(src)) && ["cpc", "ppc", "paid", "paidsocial", "paid-social"].includes(m)) {
    return { group: "Paid Social", status: "optimal", reason: "Recognized social platform source with paid/cpc medium." }
  }

  // Organic Social
  if (socialSources.some(src => s.includes(src)) || ["social", "social-network", "social-media", "sm", "social-post"].includes(m)) {
    return { group: "Organic Social", status: "optimal", reason: "Standard social platform source or social medium." }
  }

  // Email
  if (["email", "e-mail", "newsletter", "digest"].includes(m) || ["newsletter", "substack", "beehiiv", "mailchimp", "convertkit"].includes(s)) {
    return { group: "Email", status: "optimal", reason: "Standard email medium or recognized newsletter provider." }
  }

  // Referral
  if (["referral", "app", "link", "readme", "dev"].includes(m) || ["producthunt", "peerlist", "github", "hackernews", "medium"].includes(s)) {
    return { group: "Referral", status: "optimal", reason: "Standard referral traffic from developer and community hubs." }
  }

  // Organic Search
  if (searchSources.some(src => s.includes(src)) && (m === "organic" || !m)) {
    return { group: "Organic Search", status: "optimal", reason: "Identified search engine referrer." }
  }

  // Affiliates
  if (["affiliate", "affiliates", "partner"].includes(m)) {
    return { group: "Affiliates", status: "optimal", reason: "Standard affiliate partner medium." }
  }

  // Video / Audio
  if (["video", "audio", "podcast"].includes(m)) {
    return { group: "Video / Audio", status: "optimal", reason: "Media-specific traffic medium." }
  }

  // Display
  if (["display", "cpm", "banner"].includes(m)) {
    return { group: "Display", status: "optimal", reason: "Display advertising medium." }
  }

  return {
    group: "Unassigned / Custom",
    status: "warning",
    reason: `Medium '${m || "(empty)"}' is non-standard in GA4 and may be categorized as 'Unassigned'. Consider using 'social', 'email', 'referral', or 'cpc'.`,
  }
}

export default function UtmBuilderPage() {
  // Input IDs for Accessibility
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
  const templateNameId = useId()

  const [activeTab, setActiveTab] = useState<"single" | "bulk" | "inspector" | "templates">("single")

  // Formatting Options
  const [autoLowercase, setAutoLowercase] = useState(true)
  const [spaceSeparator, setSpaceSeparator] = useState<"_" | "-" | "+" | "%20">("_")
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<string>("All")

  // Single Studio State
  const [baseUrl, setBaseUrl] = useState("https://tirup.in")
  const [customPath, setCustomPath] = useState("")
  const [source, setSource] = useState("linkedin")
  const [medium, setMedium] = useState("social")
  const [campaign, setCampaign] = useState("community_outreach")
  const [content, setContent] = useState("")
  const [term, setTerm] = useState("")
  const [customParams, setCustomParams] = useState<CustomParam[]>([])
  const [copiedFormat, setCopiedFormat] = useState<"plain" | "markdown" | "html" | "json" | null>(null)
  const [copyQrSuccess, setCopyQrSuccess] = useState(false)

  // Inline QR Code State
  const [showInlineQr, setShowInlineQr] = useState(false)
  const [inlineQrDataUrl, setInlineQrDataUrl] = useState("")
  const qrSize = 300

  // Bulk Studio State
  const [bulkBaseUrl, setBulkBaseUrl] = useState("https://tirup.in")
  const [bulkCampaign, setBulkCampaign] = useState("summer_launch")
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["linkedin", "x", "newsletter", "producthunt"])
  const [copiedBulkId, setCopiedBulkId] = useState<string | null>(null)
  const [bulkExportMessage, setBulkExportMessage] = useState<string | null>(null)

  // Inspector State
  const [inspectUrl, setInspectUrl] = useState("")
  const [inspectedData, setInspectedData] = useState<{
    baseUrl: string
    path: string
    hash: string
    source: string
    medium: string
    campaign: string
    content: string
    term: string
    utmExtra: Record<string, string>
    junkParams: Record<string, string>
    otherParams: Record<string, string>
  } | null>(null)

  // QR Code Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrModalUrl, setQrModalUrl] = useState("")
  const [qrModalTitle, setQrModalTitle] = useState("")

  // Saved Custom Templates State
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([])
  const [newTemplateName, setNewTemplateName] = useState("")
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false)

  // History State
  const [history, setHistory] = useState<string[]>([])
  const [historySearch, setHistorySearch] = useState("")

  // Load Persisted Data from localStorage
  useEffect(() => {
    try {
      const savedHist = localStorage.getItem("tirup_utm_studio_history_v2")
      if (savedHist) setHistory(JSON.parse(savedHist))

      const savedTemps = localStorage.getItem("tirup_utm_custom_templates")
      if (savedTemps) setSavedTemplates(JSON.parse(savedTemps))
    } catch (e) {}
  }, [])

  // Normalizer Helper
  const formatParamValue = useCallback((val: string) => {
    let formatted = val.trim()
    if (autoLowercase) {
      formatted = formatted.toLowerCase()
    }
    // Replace spaces with configured separator
    formatted = formatted.replace(/\s+/g, spaceSeparator)
    return formatted
  }, [autoLowercase, spaceSeparator])

  // Single URL Construction
  const cleanBaseUrl = useMemo(() => {
    const raw = baseUrl.trim()
    if (!raw) return "https://tirup.in"
    return raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`
  }, [baseUrl])

  const cleanPath = useMemo(() => {
    const raw = customPath.trim()
    if (!raw) return ""
    return raw.startsWith("/") ? raw : `/${raw}`
  }, [customPath])

  const singleFinalUrl = useMemo(() => {
    const params = new URLSearchParams()

    const s = formatParamValue(source)
    const m = formatParamValue(medium)
    const c = formatParamValue(campaign)
    const cnt = formatParamValue(content)
    const t = formatParamValue(term)

    if (s) params.set("utm_source", s)
    if (m) params.set("utm_medium", m)
    if (c) params.set("utm_campaign", c)
    if (cnt) params.set("utm_content", cnt)
    if (t) params.set("utm_term", t)

    customParams.forEach((cp) => {
      const k = formatParamValue(cp.key)
      const v = formatParamValue(cp.value)
      if (k && v) params.set(k, v)
    })

    const queryString = params.toString()
    return `${cleanBaseUrl}${cleanPath}${queryString ? `?${queryString}` : ""}`
  }, [cleanBaseUrl, cleanPath, source, medium, campaign, content, term, customParams, formatParamValue])

  // Real-Time GA4 Channel Grouping Prediction
  const ga4ChannelPrediction = useMemo(() => {
    return predictGa4ChannelGroup(source, medium)
  }, [source, medium])

  // URL Audit Validation Checks
  const auditChecks = useMemo(() => {
    const issues: { type: "error" | "warning" | "success"; text: string }[] = []

    if (!source.trim()) {
      issues.push({ type: "error", text: "Missing utm_source (Required for GA4)" })
    }
    if (!medium.trim()) {
      issues.push({ type: "error", text: "Missing utm_medium (Required for GA4)" })
    }
    if (!campaign.trim()) {
      issues.push({ type: "error", text: "Missing utm_campaign (Required for GA4)" })
    }
    if (source.includes(" ") || medium.includes(" ") || campaign.includes(" ")) {
      issues.push({ type: "warning", text: "Parameters contain spaces. Normalizer will convert spaces to separators." })
    }
    if (!baseUrl.startsWith("https://")) {
      issues.push({ type: "warning", text: "Target URL does not use secure HTTPS protocol." })
    }
    if (singleFinalUrl.length > 2048) {
      issues.push({ type: "error", text: "URL exceeds standard 2048 character limit." })
    }
    if (issues.length === 0) {
      issues.push({ type: "success", text: "Link passes all GA4 syntax & URL formatting checks." })
    }
    return issues
  }, [source, medium, campaign, baseUrl, singleFinalUrl])

  // Generate QR Data URL whenever singleFinalUrl changes
  useEffect(() => {
    if (singleFinalUrl) {
      QRCode.toDataURL(
        singleFinalUrl,
        {
          width: qrSize,
          margin: 2,
          color: { dark: "#000000", light: "#FFFFFF" },
        },
        (err, data) => {
          if (!err && data) setInlineQrDataUrl(data)
        }
      )
    }
  }, [singleFinalUrl, qrSize])

  // Multi-Format Copy
  const copyFormat = useCallback(async (format: "plain" | "markdown" | "html" | "json") => {
    let payload = singleFinalUrl
    const campaignTitle = campaign ? campaign.replace(/[_\\-]/g, " ") : "Campaign Link"

    if (format === "markdown") {
      payload = `[${campaignTitle}](${singleFinalUrl})`
    } else if (format === "html") {
      payload = `<a href="${singleFinalUrl}" target="_blank" rel="noopener noreferrer">${campaignTitle}</a>`
    } else if (format === "json") {
      payload = JSON.stringify(
        {
          url: singleFinalUrl,
          base_url: cleanBaseUrl,
          path: cleanPath,
          utm_source: formatParamValue(source),
          utm_medium: formatParamValue(medium),
          utm_campaign: formatParamValue(campaign),
          utm_content: formatParamValue(content),
          utm_term: formatParamValue(term),
          predicted_channel: ga4ChannelPrediction.group,
        },
        null,
        2
      )
    }

    try {
      await navigator.clipboard.writeText(payload)
      setCopiedFormat(format)
      setTimeout(() => setCopiedFormat(null), 2000)
      
      // History Logger
      if (!history.includes(singleFinalUrl)) {
        const updated = [singleFinalUrl, ...history.slice(0, 19)]
        setHistory(updated)
        try {
          localStorage.setItem("tirup_utm_studio_history_v2", JSON.stringify(updated))
        } catch (e) {}
      }
    } catch (e) {}
  }, [singleFinalUrl, campaign, cleanBaseUrl, cleanPath, source, medium, content, term, ga4ChannelPrediction.group, formatParamValue, history])

  // Keyboard Shortcuts (Ctrl/Cmd + Enter to copy)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        copyFormat("plain")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [copyFormat])

  // Apply Presets
  const applyPreset = (p: { source: string; medium: string; campaign: string; content?: string }) => {
    setSource(p.source)
    setMedium(p.medium)
    setCampaign(p.campaign)
    if (p.content !== undefined) setContent(p.content)
  }

  // Custom Query Parameters Builder
  const addCustomParam = () => {
    setCustomParams([...customParams, { id: Date.now().toString(), key: "", value: "" }])
  }

  const updateCustomParam = (id: string, key: string, value: string) => {
    setCustomParams(customParams.map((p) => (p.id === id ? { ...p, key, value } : p)))
  }

  const removeCustomParam = (id: string) => {
    setCustomParams(customParams.filter((p) => p.id !== id))
  }

  const clearHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem("tirup_utm_studio_history_v2")
    } catch (e) {}
  }

  // Copy QR Image to Clipboard (Canvas blob copy)
  const copyQrImageToClipboard = async () => {
    if (!inlineQrDataUrl) return
    try {
      const response = await fetch(inlineQrDataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])
      setCopyQrSuccess(true)
      setTimeout(() => setCopyQrSuccess(false), 2000)
    } catch (e) {
      // Fallback
    }
  }

  // Focus Input on chip click
  const focusInput = (elementId: string) => {
    const el = document.getElementById(elementId)
    if (el) {
      el.focus()
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // Save Custom Template
  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) return
    const template: SavedTemplate = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      source: source.trim(),
      medium: medium.trim(),
      campaign: campaign.trim(),
      content: content.trim(),
      term: term.trim(),
    }
    const updated = [template, ...savedTemplates]
    setSavedTemplates(updated)
    try {
      localStorage.setItem("tirup_utm_custom_templates", JSON.stringify(updated))
    } catch (e) {}
    setNewTemplateName("")
    setShowSaveTemplateModal(false)
  }

  const deleteTemplate = (id: string) => {
    const updated = savedTemplates.filter((t) => t.id !== id)
    setSavedTemplates(updated)
    try {
      localStorage.setItem("tirup_utm_custom_templates", JSON.stringify(updated))
    } catch (e) {}
  }

  // Reset Form
  const resetForm = () => {
    setBaseUrl("https://tirup.in")
    setCustomPath("")
    setSource("linkedin")
    setMedium("social")
    setCampaign("community_outreach")
    setContent("")
    setTerm("")
    setCustomParams([])
  }

  // ── BULK STUDIO HELPERS ──
  const cleanBulkBase = useMemo(() => {
    const raw = bulkBaseUrl.trim()
    if (!raw) return "https://tirup.in"
    return raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`
  }, [bulkBaseUrl])

  const cleanBulkCamp = useMemo(() => {
    return formatParamValue(bulkCampaign.trim() || "campaign")
  }, [bulkCampaign, formatParamValue])

  const activeBulkChannels = useMemo(() => {
    return BULK_CHANNELS.filter((c) => selectedChannels.includes(c.id))
  }, [selectedChannels])

  const bulkUrls = useMemo(() => {
    return activeBulkChannels.map((ch) => {
      const p = new URLSearchParams()
      p.set("utm_source", formatParamValue(ch.source))
      p.set("utm_medium", formatParamValue(ch.medium))
      p.set("utm_campaign", cleanBulkCamp)
      return {
        channel: ch,
        url: `${cleanBulkBase}?${p.toString()}`,
      }
    })
  }, [activeBulkChannels, cleanBulkBase, cleanBulkCamp, formatParamValue])

  const toggleChannelSelect = (id: string) => {
    if (selectedChannels.includes(id)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== id))
      }
    } else {
      setSelectedChannels([...selectedChannels, id])
    }
  }

  const selectAllBulk = () => setSelectedChannels(BULK_CHANNELS.map((c) => c.id))
  const selectSocialBulk = () => setSelectedChannels(BULK_CHANNELS.filter((c) => c.category === "Social").map((c) => c.id))
  const selectDevBulk = () => setSelectedChannels(BULK_CHANNELS.filter((c) => c.category === "Launch" || c.category === "Developer").map((c) => c.id))

  const handleCopyBulkSingle = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedBulkId(id)
      setTimeout(() => setCopiedBulkId(null), 2000)
      if (!history.includes(url)) {
        const updated = [url, ...history.slice(0, 19)]
        setHistory(updated)
        try {
          localStorage.setItem("tirup_utm_studio_history_v2", JSON.stringify(updated))
        } catch (e) {}
      }
    } catch (e) {}
  }

  const exportBulkCsv = () => {
    const rows = [
      ["Channel", "Category", "Source", "Medium", "Campaign", "Predicted GA4 Channel", "Tagged URL"],
      ...bulkUrls.map((b) => [
        b.channel.name,
        b.channel.category,
        b.channel.source,
        b.channel.medium,
        cleanBulkCamp,
        predictGa4ChannelGroup(b.channel.source, b.channel.medium).group,
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
    setBulkExportMessage("CSV exported successfully!")
    setTimeout(() => setBulkExportMessage(null), 3000)
  }

  const exportBulkJson = async () => {
    const jsonOutput = bulkUrls.map((b) => ({
      channel: b.channel.name,
      category: b.channel.category,
      source: b.channel.source,
      medium: b.channel.medium,
      campaign: cleanBulkCamp,
      predicted_channel: predictGa4ChannelGroup(b.channel.source, b.channel.medium).group,
      url: b.url,
    }))
    try {
      await navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2))
      setBulkExportMessage("JSON copied to clipboard!")
      setTimeout(() => setBulkExportMessage(null), 3000)
    } catch (e) {}
  }

  const exportBulkMarkdown = async () => {
    const mdTable = [
      "| Channel | Source | Medium | Campaign | Tagged Link |",
      "| :--- | :--- | :--- | :--- | :--- |",
      ...bulkUrls.map((b) => `| ${b.channel.name} | \`${b.channel.source}\` | \`${b.channel.medium}\` | \`${cleanBulkCamp}\` | [Link](${b.url}) |`),
    ].join("\n")

    try {
      await navigator.clipboard.writeText(mdTable)
      setBulkExportMessage("Markdown Table copied to clipboard!")
      setTimeout(() => setBulkExportMessage(null), 3000)
    } catch (e) {}
  }

  const exportBulkGoogleSheetsTsv = async () => {
    const rows = [
      ["Channel", "Source", "Medium", "Campaign", "URL"].join("\t"),
      ...bulkUrls.map((b) => [b.channel.name, b.channel.source, b.channel.medium, cleanBulkCamp, b.url].join("\t")),
    ].join("\n")

    try {
      await navigator.clipboard.writeText(rows)
      setBulkExportMessage("TSV copied! Paste directly into Google Sheets or Excel.")
      setTimeout(() => setBulkExportMessage(null), 3000)
    } catch (e) {}
  }

  // ── INSPECTOR 2.0 (DECONSTRUCTION & TRACKING JUNK STRIPPER) ──
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

      const utmExtra: Record<string, string> = {}
      const junkParams: Record<string, string> = {}
      const otherParams: Record<string, string> = {}

      searchP.forEach((val, key) => {
        const lower = key.toLowerCase()
        if (["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].includes(lower)) {
          // already captured
        } else if (lower.startsWith("utm_")) {
          utmExtra[key] = val
        } else if (TRACKING_JUNK_PARAMS.includes(lower)) {
          junkParams[key] = val
        } else {
          otherParams[key] = val
        }
      })

      setInspectedData({
        baseUrl: `${parsedUrl.protocol}//${parsedUrl.host}`,
        path: parsedUrl.pathname,
        hash: parsedUrl.hash,
        source: s,
        medium: m,
        campaign: c,
        content: cnt,
        term: t,
        utmExtra,
        junkParams,
        otherParams,
      })
    } catch (err) {
      setInspectedData(null)
    }
  }

  const stripJunkAndSanitizeInspect = () => {
    if (!inspectUrl.trim() || !inspectedData) return
    try {
      const parsedUrl = new URL(inspectUrl.trim().startsWith("http") ? inspectUrl.trim() : `https://${inspectUrl.trim()}`)
      const searchP = new URLSearchParams(parsedUrl.search)
      const cleanParams = new URLSearchParams()

      searchP.forEach((val, key) => {
        const lowerKey = key.toLowerCase()
        if (!TRACKING_JUNK_PARAMS.includes(lowerKey)) {
          // Normalize casing and trim
          cleanParams.set(lowerKey, val.toLowerCase().trim())
        }
      })

      const cleanedPath = parsedUrl.pathname.replace(/\/+/g, "/")
      const fixed = `${parsedUrl.protocol}//${parsedUrl.host}${cleanedPath}${cleanParams.toString() ? `?${cleanParams.toString()}` : ""}${parsedUrl.hash}`

      setInspectUrl(fixed)
      handleInspect(fixed)
    } catch (e) {}
  }

  const sendInspectedToStudio = () => {
    if (!inspectedData) return
    setBaseUrl(inspectedData.baseUrl)
    setCustomPath(inspectedData.path)
    setSource(inspectedData.source)
    setMedium(inspectedData.medium)
    setCampaign(inspectedData.campaign)
    setContent(inspectedData.content)
    setTerm(inspectedData.term)

    const extra: CustomParam[] = []
    Object.entries(inspectedData.utmExtra).forEach(([k, v]) => {
      extra.push({ id: Math.random().toString(), key: k, value: v })
    })
    Object.entries(inspectedData.otherParams).forEach(([k, v]) => {
      extra.push({ id: Math.random().toString(), key: k, value: v })
    })
    setCustomParams(extra)

    setActiveTab("single")
  }

  // Filtered Presets based on category selection
  const filteredPresets = useMemo(() => {
    if (selectedPresetCategory === "All") return DEFAULT_PRESETS
    return DEFAULT_PRESETS.filter((p) => p.category === selectedPresetCategory)
  }, [selectedPresetCategory])

  // Filtered History
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return history
    return history.filter((url) => url.toLowerCase().includes(historySearch.toLowerCase().trim()))
  }, [history, historySearch])

  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <Header />

      <section className="section max-w-4xl mx-auto w-full px-6 md:px-20 pb-20">
        {/* Title & Top Metadata */}
        <TextWithBlur delay={50}>
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-accent uppercase font-medium">
                <Sparkles size={14} /> Developer Utility & Attribution Studio
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-black/50 dark:text-white/50">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                GA4 Standard Compliant
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif italic font-medium text-black dark:text-white mb-2">
              GA4 Campaign URL Builder
            </h1>
            <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 max-w-2xl leading-relaxed">
              Generate standardized UTM links for social distribution, email campaigns, and developer launches. Eliminate{" "}
              <span className="font-normal text-black dark:text-white">(direct) / (none)</span> traffic leakage in Google Analytics 4.
            </p>
          </div>
        </TextWithBlur>

        {/* Mode Navigation Tabs */}
        <TextWithBlur delay={80}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-black/10 dark:border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab("single")}
                className={`text-sm px-4 py-2 rounded-none border transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === "single"
                    ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-sm"
                    : "bg-white/80 dark:bg-zinc-900/80 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                }`}
              >
                <LinkIcon size={14} /> Single Studio
              </button>

              <button
                onClick={() => setActiveTab("bulk")}
                className={`text-sm px-4 py-2 rounded-none border transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === "bulk"
                    ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-sm"
                    : "bg-white/80 dark:bg-zinc-900/80 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                }`}
              >
                <Layers size={14} /> Bulk 12-Channel Matrix
              </button>

              <button
                onClick={() => setActiveTab("inspector")}
                className={`text-sm px-4 py-2 rounded-none border transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === "inspector"
                    ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-sm"
                    : "bg-white/80 dark:bg-zinc-900/80 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                }`}
              >
                <Search size={14} /> URL Inspector & Sanitizer
              </button>

              <button
                onClick={() => setActiveTab("templates")}
                className={`text-sm px-4 py-2 rounded-none border transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === "templates"
                    ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-sm"
                    : "bg-white/80 dark:bg-zinc-900/80 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                }`}
              >
                <BookmarkPlus size={14} /> Saved Templates ({savedTemplates.length})
              </button>
            </div>

            {/* Quick Reset Form */}
            {activeTab === "single" && (
              <button
                onClick={resetForm}
                className="text-xs font-mono text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors flex items-center gap-1"
                title="Reset all inputs to defaults"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </TextWithBlur>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: SINGLE STUDIO (10X PRO BUILDER)                             */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "single" && (
          <div className="space-y-6">
            
            {/* Presets & Categorized Quick Tags */}
            <TextWithBlur delay={100}>
              <div className="space-y-3 pb-5 border-b border-black/10 dark:border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs uppercase font-mono tracking-wider text-black/50 dark:text-white/50 font-medium flex items-center gap-1.5">
                    <Tag size={13} className="text-accent" /> Channel Presets:
                  </span>
                  
                  {/* Category Filter Chips */}
                  <div className="flex items-center gap-1 text-xs font-mono">
                    {["All", "Social", "Email", "Developer", "Paid Ads"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedPresetCategory(cat)}
                        className={`px-2 py-0.5 rounded-none transition-colors ${
                          selectedPresetCategory === cat
                            ? "bg-black/10 dark:bg-white/15 text-black dark:text-white font-medium"
                            : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {filteredPresets.map((p) => {
                    const isSelected = source === p.source && medium === p.medium && campaign === p.campaign
                    return (
                      <button
                        key={p.id}
                        onClick={() => applyPreset(p)}
                        className={`text-sm px-3.5 py-1.5 rounded-none border transition-all duration-200 ${
                          isSelected
                            ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-sm"
                            : "bg-white/80 dark:bg-zinc-900/80 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                        }`}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </TextWithBlur>

            {/* Inputs Form */}
            <TextWithBlur delay={120}>
              <div className="space-y-5 pb-6 border-b border-black/10 dark:border-white/10">
                
                {/* Domain & Path */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor={baseUrlInputId} className="block text-xs font-mono uppercase tracking-wider text-black/70 dark:text-white/70 mb-2 font-medium">
                      Target Website Domain <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={baseUrlInputId}
                      type="url"
                      placeholder="https://tirup.in or https://yourdomain.com"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor={customPathId} className="block text-xs font-mono uppercase tracking-wider text-black/70 dark:text-white/70 mb-2 font-medium">
                      Path <span className="text-[10px] opacity-60">(optional)</span>
                    </label>
                    <input
                      id={customPathId}
                      type="text"
                      placeholder="/work or /blogs/post-slug"
                      value={customPath}
                      onChange={(e) => setCustomPath(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent font-mono"
                    />
                  </div>
                </div>

                {/* Core Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label htmlFor={utmSourceId} className="block text-xs font-mono uppercase tracking-wider text-black/70 dark:text-white/70 mb-2 font-medium">
                      utm_source <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={utmSourceId}
                      type="text"
                      placeholder="e.g. linkedin, newsletter, twitter"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent font-mono"
                    />
                    <span className="text-xs text-black/50 dark:text-white/50 mt-1 block">Referrer platform or origin</span>
                  </div>

                  <div>
                    <label htmlFor={utmMediumId} className="block text-xs font-mono uppercase tracking-wider text-black/70 dark:text-white/70 mb-2 font-medium">
                      utm_medium <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={utmMediumId}
                      type="text"
                      placeholder="e.g. social, email, referral, cpc"
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent font-mono"
                    />
                    <span className="text-xs text-black/50 dark:text-white/50 mt-1 block">Marketing channel type</span>
                  </div>

                  <div>
                    <label htmlFor={utmCampaignId} className="block text-xs font-mono uppercase tracking-wider text-black/70 dark:text-white/70 mb-2 font-medium">
                      utm_campaign <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={utmCampaignId}
                      type="text"
                      placeholder="e.g. community_outreach, launch_v1"
                      value={campaign}
                      onChange={(e) => setCampaign(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent font-mono"
                    />
                    <span className="text-xs text-black/50 dark:text-white/50 mt-1 block">Campaign theme, product or launch</span>
                  </div>
                </div>

                {/* Optional Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-black/5 dark:border-white/5">
                  <div>
                    <label htmlFor={utmContentId} className="block text-xs font-mono uppercase tracking-wider text-black/60 dark:text-white/60 mb-1.5 font-medium">
                      utm_content <span className="text-[10px] opacity-60">(A/B test or link position)</span>
                    </label>
                    <input
                      id={utmContentId}
                      type="text"
                      placeholder="e.g. hero_cta, footer_link, variant_b"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor={utmTermId} className="block text-xs font-mono uppercase tracking-wider text-black/60 dark:text-white/60 mb-1.5 font-medium">
                      utm_term <span className="text-[10px] opacity-60">(Keyword targeting / audience)</span>
                    </label>
                    <input
                      id={utmTermId}
                      type="text"
                      placeholder="e.g. web_security, react_developers"
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent font-mono"
                    />
                  </div>
                </div>

                {/* Smart Normalizer Controls */}
                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-black/70 dark:text-white/70 select-none">
                      <input
                        type="checkbox"
                        checked={autoLowercase}
                        onChange={(e) => setAutoLowercase(e.target.checked)}
                        className="rounded-none accent-black dark:accent-white"
                      />
                      <span>Auto-Lowercase Parameters</span>
                    </label>

                    <div className="flex items-center gap-1.5 text-black/70 dark:text-white/70">
                      <span>Space Separator:</span>
                      <select
                        value={spaceSeparator}
                        onChange={(e) => setSpaceSeparator(e.target.value as any)}
                        aria-label="Space Separator"
                        className="px-2 py-1 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none"
                      >
                        <option value="_">Underscore (_)</option>
                        <option value="-">Hyphen (-)</option>
                        <option value="+">Plus (+)</option>
                        <option value="%20">Percent Encoded (%20)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSaveTemplateModal(true)}
                      className="text-xs text-accent hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <BookmarkPlus size={13} /> Save as Template
                    </button>
                    <span className="text-black/20 dark:text-white/20">•</span>
                    <button
                      type="button"
                      onClick={addCustomParam}
                      className="text-xs text-accent hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Plus size={13} /> Add Custom Param
                    </button>
                  </div>
                </div>

                {/* Custom Dynamic Parameters List */}
                {customParams.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                    <span className="text-xs uppercase font-mono tracking-wider text-black/50 dark:text-white/50 block font-medium">
                      Custom Query Parameters:
                    </span>
                    {customParams.map((p) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Key (e.g. ref, affiliate_id)"
                          value={p.key}
                          onChange={(e) => updateCustomParam(p.id, e.target.value, p.value)}
                          className="flex-1 text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          value={p.value}
                          onChange={(e) => updateCustomParam(p.id, p.key, e.target.value)}
                          className="flex-1 text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomParam(p.id)}
                          className="p-2 text-black/40 hover:text-red-500 transition-colors"
                          aria-label="Remove parameter"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TextWithBlur>

            {/* Live Intelligence & GA4 Default Channel Grouping Badge */}
            <TextWithBlur delay={140}>
              <div className="p-4 rounded-none bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-mono tracking-wider text-black/50 dark:text-white/50 font-medium">
                      GA4 Default Channel Group:
                    </span>
                    <span className="px-2.5 py-0.5 font-mono text-xs font-medium rounded-none bg-black dark:bg-white text-white dark:text-black">
                      {ga4ChannelPrediction.group}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono text-black/60 dark:text-white/60">
                    <Info size={13} className="text-accent" />
                    <span>{ga4ChannelPrediction.reason}</span>
                  </div>
                </div>

                {/* Audit Checklist */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-black/5 dark:border-white/5 text-xs font-mono">
                  {auditChecks.map((check, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-none border ${
                        check.type === "success"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          : check.type === "warning"
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                          : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                      }`}
                    >
                      {check.type === "success" && <CheckCircle2 size={12} />}
                      {check.type === "warning" && <AlertCircle size={12} />}
                      {check.type === "error" && <AlertCircle size={12} />}
                      {check.text}
                    </span>
                  ))}
                </div>
              </div>
            </TextWithBlur>

            {/* Generated Output Studio Box */}
            <TextWithBlur delay={160}>
              <div className="p-6 md:p-8 rounded-none bg-zinc-950 text-white border border-zinc-800 shadow-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5 font-medium">
                    <LinkIcon size={14} className="text-accent" /> Tagged URL Output
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowInlineQr(!showInlineQr)}
                      className="text-xs px-3 py-1 rounded-none bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex items-center gap-1 font-mono cursor-pointer"
                    >
                      <QrCode size={13} /> {showInlineQr ? "Hide QR" : "Show QR"}
                    </button>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-none border border-emerald-800">
                      Ready
                    </span>
                  </div>
                </div>

                {/* Interactive Parameter Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {source && (
                    <button
                      onClick={() => focusInput(utmSourceId)}
                      className="text-xs font-mono px-2.5 py-1 rounded-none bg-zinc-900 text-emerald-300 hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
                      title="Click to edit utm_source"
                    >
                      utm_source: <span className="font-semibold text-white">{formatParamValue(source)}</span>
                    </button>
                  )}
                  {medium && (
                    <button
                      onClick={() => focusInput(utmMediumId)}
                      className="text-xs font-mono px-2.5 py-1 rounded-none bg-zinc-900 text-emerald-300 hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
                      title="Click to edit utm_medium"
                    >
                      utm_medium: <span className="font-semibold text-white">{formatParamValue(medium)}</span>
                    </button>
                  )}
                  {campaign && (
                    <button
                      onClick={() => focusInput(utmCampaignId)}
                      className="text-xs font-mono px-2.5 py-1 rounded-none bg-zinc-900 text-emerald-300 hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
                      title="Click to edit utm_campaign"
                    >
                      utm_campaign: <span className="font-semibold text-white">{formatParamValue(campaign)}</span>
                    </button>
                  )}
                  {content && (
                    <button
                      onClick={() => focusInput(utmContentId)}
                      className="text-xs font-mono px-2.5 py-1 rounded-none bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
                    >
                      utm_content: <span className="font-semibold text-white">{formatParamValue(content)}</span>
                    </button>
                  )}
                </div>

                {/* Monospace Code Output */}
                <div className="p-4 md:p-5 rounded-none bg-black/90 font-mono text-sm md:text-base text-emerald-400 break-all select-all border border-zinc-800 leading-relaxed shadow-inner">
                  {singleFinalUrl}
                </div>

                {/* Inline QR Studio Panel */}
                {showInlineQr && inlineQrDataUrl && (
                  <div className="p-5 rounded-none bg-black/60 border border-zinc-800 flex flex-col sm:flex-row items-center gap-6 animate-in fade-in">
                    <img src={inlineQrDataUrl} alt="Campaign QR Code" className="w-44 h-44 bg-white p-2.5 rounded-none shrink-0" />
                    <div className="space-y-3 text-center sm:text-left flex-1">
                      <div>
                        <p className="text-sm text-zinc-200 font-mono font-medium">Vector Campaign QR Code</p>
                        <p className="text-xs text-zinc-400 font-light mt-0.5">Scannable attribution link for print, posters, and keynotes.</p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <a
                          href={inlineQrDataUrl}
                          download={`campaign-qr-${formatParamValue(campaign) || "link"}.png`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors shadow-sm"
                        >
                          <Download size={13} /> Download PNG (High-Res)
                        </a>

                        <button
                          onClick={copyQrImageToClipboard}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-zinc-800 text-zinc-200 text-xs font-medium hover:bg-zinc-700 transition-colors"
                        >
                          {copyQrSuccess ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          {copyQrSuccess ? "QR Image Copied!" : "Copy QR Image"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Multi-Format Copy Actions & Quick Shortcuts */}
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => copyFormat("plain")}
                    className="flex-1 min-w-[140px] px-4 py-2.5 rounded-none bg-white text-black font-medium text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {copiedFormat === "plain" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copiedFormat === "plain" ? "Copied URL!" : "Copy URL"}
                  </button>

                  <button
                    type="button"
                    onClick={() => copyFormat("markdown")}
                    className="flex-1 min-w-[140px] px-4 py-2.5 rounded-none bg-zinc-800 text-zinc-200 hover:text-white font-medium text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5 font-mono cursor-pointer"
                  >
                    {copiedFormat === "markdown" ? <Check size={14} className="text-emerald-400" /> : <FileCode size={14} />}
                    {copiedFormat === "markdown" ? "Copied Markdown!" : "Copy Markdown"}
                  </button>

                  <button
                    type="button"
                    onClick={() => copyFormat("html")}
                    className="flex-1 min-w-[130px] px-4 py-2.5 rounded-none bg-zinc-800 text-zinc-200 hover:text-white font-medium text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5 font-mono cursor-pointer"
                  >
                    {copiedFormat === "html" ? <Check size={14} className="text-emerald-400" /> : <Code size={14} />}
                    {copiedFormat === "html" ? "Copied HTML!" : "Copy HTML"}
                  </button>

                  <button
                    type="button"
                    onClick={() => copyFormat("json")}
                    className="px-4 py-2.5 rounded-none bg-zinc-800 text-zinc-200 hover:text-white font-medium text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5 font-mono cursor-pointer"
                    title="Copy payload as structured JSON object"
                  >
                    {copiedFormat === "json" ? <Check size={14} className="text-emerald-400" /> : <FileJson size={14} />}
                    JSON
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

                <div className="pt-2 text-right">
                  <span className="text-[11px] font-mono text-zinc-500">
                    Protip: Press <kbd className="px-1.5 py-0.5 rounded-none bg-zinc-800 text-zinc-300 border border-zinc-700">⌘ + Enter</kbd> or <kbd className="px-1.5 py-0.5 rounded-none bg-zinc-800 text-zinc-300 border border-zinc-700">Ctrl + Enter</kbd> to copy link instantly.
                  </span>
                </div>
              </div>
            </TextWithBlur>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: BULK 12-CHANNEL MATRIX                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "bulk" && (
          <div className="space-y-6">
            <TextWithBlur delay={100}>
              <div className="space-y-5 pb-6 border-b border-black/10 dark:border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={bulkBaseUrlId} className="block text-xs font-mono uppercase tracking-wider text-black/70 dark:text-white/70 mb-1.5 flex items-center gap-1 font-medium">
                      <Globe size={13} /> Target Base URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={bulkBaseUrlId}
                      type="url"
                      placeholder="https://tirup.in/work"
                      value={bulkBaseUrl}
                      onChange={(e) => setBulkBaseUrl(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor={bulkCampaignId} className="block text-xs font-mono uppercase tracking-wider text-black/70 dark:text-white/70 mb-1.5 font-medium">
                      Campaign Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={bulkCampaignId}
                      type="text"
                      placeholder="e.g. summer_launch_2026"
                      value={bulkCampaign}
                      onChange={(e) => setBulkCampaign(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent font-mono"
                    />
                  </div>
                </div>

                {/* Channel Quick Selectors */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs uppercase font-mono tracking-wider text-black/50 dark:text-white/50 font-medium">
                      Select Channels ({selectedChannels.length}/{BULK_CHANNELS.length}):
                    </span>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <button onClick={selectAllBulk} className="text-accent hover:underline">Select All</button>
                      <span className="opacity-30">•</span>
                      <button onClick={selectSocialBulk} className="text-accent hover:underline">Only Social</button>
                      <span className="opacity-30">•</span>
                      <button onClick={selectDevBulk} className="text-accent hover:underline">Only Launch/Dev</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {BULK_CHANNELS.map((ch) => {
                      const isSelected = selectedChannels.includes(ch.id)
                      return (
                        <button
                          key={ch.id}
                          onClick={() => toggleChannelSelect(ch.id)}
                          className={`text-sm px-3.5 py-2 rounded-none border flex items-center gap-2 transition-all ${
                            isSelected
                              ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-sm"
                              : "bg-white dark:bg-zinc-900 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                          }`}
                        >
                          {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                          <span className="truncate">{ch.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Bulk Export Toolbar */}
                <div className="flex flex-wrap gap-2 justify-end pt-3 border-t border-black/5 dark:border-white/5">
                  <button
                    onClick={exportBulkMarkdown}
                    className="px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 font-medium text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 font-mono"
                  >
                    <FileCode size={13} /> Copy Markdown Table
                  </button>

                  <button
                    onClick={exportBulkGoogleSheetsTsv}
                    className="px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 font-medium text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 font-mono"
                  >
                    <FileSpreadsheet size={13} /> Copy for Sheets / Excel
                  </button>

                  <button
                    onClick={exportBulkJson}
                    className="px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 font-medium text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 font-mono"
                  >
                    <FileJson size={13} /> Copy JSON
                  </button>

                  <button
                    onClick={exportBulkCsv}
                    className="px-4 py-2 rounded-none bg-black text-white dark:bg-white dark:text-black font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Download size={13} /> Export CSV
                  </button>
                </div>

                {bulkExportMessage && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-mono text-center animate-in fade-in">
                    {bulkExportMessage}
                  </div>
                )}
              </div>
            </TextWithBlur>

            {/* Generated Multi-Channel List */}
            <TextWithBlur delay={150}>
              <div className="flex flex-col border-t border-black/10 dark:border-white/10">
                {bulkUrls.map((b) => {
                  const ga4Grouping = predictGa4ChannelGroup(b.channel.source, b.channel.medium)
                  return (
                    <div
                      key={b.channel.id}
                      className="py-4 border-b border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-black dark:text-white font-mono">{b.channel.name}</span>
                          <span className="text-xs font-mono opacity-50">
                            ({b.channel.source} / {b.channel.medium})
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70">
                            {ga4Grouping.group}
                          </span>
                        </div>
                        <p className="font-mono text-sm text-emerald-600 dark:text-emerald-400 truncate select-all">
                          {b.url}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setQrModalUrl(b.url)
                            setQrModalTitle(`${b.channel.name} Campaign Link`)
                            setQrModalOpen(true)
                          }}
                          className="p-2 rounded-none border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                          title="Generate QR Code"
                        >
                          <QrCode size={14} />
                        </button>
                        <button
                          onClick={() => handleCopyBulkSingle(b.channel.id, b.url)}
                          className="px-3.5 py-1.5 rounded-none bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-medium text-black dark:text-white transition-colors flex items-center gap-1.5 font-mono"
                        >
                          {copiedBulkId === b.channel.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                          {copiedBulkId === b.channel.id ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </TextWithBlur>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: URL INSPECTOR & JUNK TRACKER SANITIZER                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "inspector" && (
          <div className="space-y-6">
            <TextWithBlur delay={100}>
              <div className="pb-6 border-b border-black/10 dark:border-white/10 space-y-4">
                <div>
                  <label htmlFor={inspectInputId} className="block text-xs font-mono uppercase tracking-wider text-black/70 dark:text-white/70 mb-2 flex items-center gap-1.5 font-medium">
                    <Search size={14} /> Paste Any URL to Inspect, Validate & Sanitize
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id={inspectInputId}
                      type="text"
                      placeholder="https://example.com/page?utm_source=Linkedin&utm_medium=social&utm_campaign=launch&fbclid=IwAR123&_ga=GA1.2.3"
                      value={inspectUrl}
                      onChange={(e) => handleInspect(e.target.value)}
                      className="flex-1 text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none focus:border-accent font-mono"
                    />
                    {inspectUrl.trim() && (
                      <button
                        onClick={stripJunkAndSanitizeInspect}
                        className="px-4 py-2.5 rounded-none bg-black text-white dark:bg-white dark:text-black font-medium text-sm flex items-center justify-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                        title="Remove fbclid/gclid/junk and normalize lowercase"
                      >
                        <Wand2 size={14} /> Clean & Strip Junk
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
                      <ShieldCheck size={15} className="text-accent" /> Parameter Diagnostic Breakdown
                    </span>
                    <button
                      onClick={sendInspectedToStudio}
                      className="text-xs px-3.5 py-1.5 rounded-none border border-black/10 dark:border-white/10 text-black dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1 font-mono"
                    >
                      Open in Single Studio <ArrowRight size={13} />
                    </button>
                  </div>

                  <div className="py-3.5 border-b border-black/10 dark:border-white/10 flex justify-between items-baseline gap-4 font-mono text-sm">
                    <span className="text-black/50 dark:text-white/50 uppercase text-xs">Target Host & Path</span>
                    <span className="text-black dark:text-white break-all font-medium text-right">{inspectedData.baseUrl}{inspectedData.path}</span>
                  </div>

                  <div className="py-3.5 border-b border-black/10 dark:border-white/10 flex justify-between items-baseline gap-4 font-mono text-sm">
                    <span className="text-black/50 dark:text-white/50 uppercase text-xs">utm_source</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{inspectedData.source || "(none)"}</span>
                  </div>

                  <div className="py-3.5 border-b border-black/10 dark:border-white/10 flex justify-between items-baseline gap-4 font-mono text-sm">
                    <span className="text-black/50 dark:text-white/50 uppercase text-xs">utm_medium</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{inspectedData.medium || "(none)"}</span>
                  </div>

                  <div className="py-3.5 border-b border-black/10 dark:border-white/10 flex justify-between items-baseline gap-4 font-mono text-sm">
                    <span className="text-black/50 dark:text-white/50 uppercase text-xs">utm_campaign</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{inspectedData.campaign || "(none)"}</span>
                  </div>

                  {inspectedData.content && (
                    <div className="py-3.5 border-b border-black/10 dark:border-white/10 flex justify-between items-baseline gap-4 font-mono text-sm">
                      <span className="text-black/50 dark:text-white/50 uppercase text-xs">utm_content</span>
                      <span className="text-black dark:text-white">{inspectedData.content}</span>
                    </div>
                  )}

                  {inspectedData.term && (
                    <div className="py-3.5 border-b border-black/10 dark:border-white/10 flex justify-between items-baseline gap-4 font-mono text-sm">
                      <span className="text-black/50 dark:text-white/50 uppercase text-xs">utm_term</span>
                      <span className="text-black dark:text-white">{inspectedData.term}</span>
                    </div>
                  )}

                  {/* Detected Tracking Junk Warning */}
                  {Object.keys(inspectedData.junkParams).length > 0 && (
                    <div className="py-4 border-b border-black/10 dark:border-white/10 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-amber-600 dark:text-amber-400">
                        <AlertCircle size={14} />
                        <span>Detected {Object.keys(inspectedData.junkParams).length} third-party tracking junk parameters:</span>
                      </div>
                      <div className="flex flex-wrap gap-2 font-mono text-xs">
                        {Object.entries(inspectedData.junkParams).map(([k, v]) => (
                          <span key={k} className="px-2 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
                            {k}={v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Predicted GA4 Channel */}
                  <div className="py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs uppercase font-mono tracking-wider text-black/50 dark:text-white/50">
                      Predicted GA4 Default Channel Group
                    </span>
                    <span className="px-2.5 py-1 font-mono text-xs font-medium rounded-none bg-black dark:bg-white text-white dark:text-black">
                      {predictGa4ChannelGroup(inspectedData.source, inspectedData.medium).group}
                    </span>
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

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: SAVED TEMPLATES                                             */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            <TextWithBlur delay={100}>
              <div className="pb-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-xs uppercase font-mono tracking-wider text-black/70 dark:text-white/70 font-medium">
                    Your Reusable Attribution Templates
                  </h2>
                  <p className="text-xs text-black/50 dark:text-white/50 font-light mt-0.5">
                    Save time by pre-configuring source, medium, and campaign patterns for your recurring distributions.
                  </p>
                </div>
                <button
                  onClick={() => setShowSaveTemplateModal(true)}
                  className="px-3.5 py-2 rounded-none bg-black text-white dark:bg-white dark:text-black text-xs font-medium font-mono flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={13} /> New Template
                </button>
              </div>
            </TextWithBlur>

            {savedTemplates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedTemplates.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-none border border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm text-black dark:text-white font-mono">{t.name}</h3>
                      <button
                        onClick={() => deleteTemplate(t.id)}
                        className="text-black/40 hover:text-red-500 transition-colors p-1"
                        title="Delete template"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="space-y-1 font-mono text-xs text-black/70 dark:text-white/70">
                      <div>source: <span className="text-accent font-semibold">{t.source}</span></div>
                      <div>medium: <span className="text-accent font-semibold">{t.medium}</span></div>
                      <div>campaign: <span className="text-accent font-semibold">{t.campaign}</span></div>
                    </div>

                    <button
                      onClick={() => {
                        applyPreset(t)
                        setActiveTab("single")
                      }}
                      className="w-full py-2 rounded-none border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-mono font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      Load into Studio <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-black/10 dark:border-white/10 space-y-2">
                <BookmarkPlus size={24} className="mx-auto text-black/30 dark:text-white/30" />
                <p className="text-sm font-light text-black/60 dark:text-white/60">No custom templates saved yet.</p>
                <p className="text-xs font-mono text-black/40 dark:text-white/40">
                  Configure parameters in the Single Studio and click "Save as Template".
                </p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PERSISTENT RECENT HISTORY ACROSS ALL TABS                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {history.length > 0 && (
          <TextWithBlur delay={200}>
            <div className="mt-12 pt-6 border-t border-black/10 dark:border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <History size={14} className="text-accent" />
                  <h2 className="text-xs uppercase font-mono tracking-wider text-black/60 dark:text-white/60 font-medium">
                    Recent Generated Campaign Links ({history.length})
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search history..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="text-xs px-3 py-1.5 pl-7 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none font-mono"
                    />
                    <Search size={12} className="absolute left-2.5 top-2.5 text-black/40 dark:text-white/40" />
                  </div>

                  <button
                    onClick={clearHistory}
                    className="text-xs font-mono text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                </div>
              </div>

              <div className="flex flex-col border-t border-black/10 dark:border-white/10">
                {filteredHistory.map((url, i) => (
                  <div key={i} className="py-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-3 text-xs font-mono">
                    <span className="truncate text-black/70 dark:text-white/70 flex-1 select-all">{url}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setQrModalUrl(url)
                          setQrModalTitle("Campaign QR Code")
                          setQrModalOpen(true)
                        }}
                        className="p-1.5 text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors"
                        title="QR Code"
                      >
                        <QrCode size={13} />
                      </button>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(url)
                        }}
                        className="p-1.5 text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors"
                        title="Copy URL"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={() => {
                          handleInspect(url)
                          setActiveTab("inspector")
                        }}
                        className="p-1.5 text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors"
                        title="Inspect in Inspector"
                      >
                        <Eye size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TextWithBlur>
        )}
      </section>

      {/* Save Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 bg-white dark:bg-zinc-950 rounded-none border border-black/10 dark:border-white/10 shadow-2xl space-y-4">
            <h3 className="text-sm uppercase font-mono tracking-wider text-black/70 dark:text-white/70 font-medium flex items-center gap-1.5">
              <BookmarkPlus size={15} className="text-accent" /> Save Attribution Template
            </h3>

            <div>
              <label htmlFor={templateNameId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1.5">
                Template Name
              </label>
              <input
                id={templateNameId}
                type="text"
                placeholder="e.g. Weekly Substack Issue, Podcast Sponsor"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 text-black dark:text-white font-mono focus:outline-none focus:border-accent"
                autoFocus
              />
            </div>

            <div className="p-3 bg-black/5 dark:bg-white/5 font-mono text-xs space-y-1">
              <div>source: {source}</div>
              <div>medium: {medium}</div>
              <div>campaign: {campaign}</div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(false)}
                className="px-4 py-2 text-xs font-mono border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="px-4 py-2 text-xs font-mono font-medium bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        url={qrModalUrl}
        title={qrModalTitle || "Campaign URL QR Code"}
      />

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-black/10 dark:border-white/10">
        <p className="text-xs text-black/50 dark:text-white/50" suppressHydrationWarning>© {currentYear} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
