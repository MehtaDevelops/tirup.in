"use client"

import React, { useState, useEffect, useId, useMemo, useRef, useCallback } from "react"
import Header from "@/components/header"
import TextWithBlur from "@/components/text-with-blur"
import QRCode from "qrcode"
import {
  Sparkles,
  Link as LinkIcon,
  Globe,
  Wifi,
  User,
  Mail,
  MessageSquare,
  Coins,
  FileText,
  Copy,
  Check,
  Download,
  ExternalLink,
  Trash2,
  History,
  Palette,
  ShieldCheck,
  Sliders,
  Image as ImageIcon,
  RotateCcw,
  Code2,
  FileCode,
  Layers,
  Search,
  Eye,
  Info,
  CheckCircle2,
  Smartphone,
  Upload,
  X,
} from "lucide-react"

// Types
type PayloadType = "url" | "text" | "wifi" | "vcard" | "email" | "sms" | "crypto"
type ErrorCorrectionLevel = "L" | "M" | "Q" | "H"

interface ColorPreset {
  id: string
  name: string
  fg: string
  bg: string
  isDark?: boolean
}

const COLOR_PRESETS: ColorPreset[] = [
  { id: "monochrome-light", name: "Obsidian / White", fg: "#000000", bg: "#FFFFFF" },
  { id: "monochrome-dark", name: "White / Dark Zinc", fg: "#FFFFFF", bg: "#09090B", isDark: true },
  { id: "emerald", name: "Emerald Pro", fg: "#10B981", bg: "#022C22", isDark: true },
  { id: "cyan-neon", name: "Cyberpunk Cyan", fg: "#06B6D4", bg: "#082F49", isDark: true },
  { id: "indigo", name: "Royal Indigo", fg: "#4F46E5", bg: "#EEF2FF" },
  { id: "amber", name: "Sunset Amber", fg: "#F59E0B", bg: "#18181B", isDark: true },
  { id: "crimson", name: "Crimson Security", fg: "#E11D48", bg: "#FFF1F2" },
  { id: "transparent-dark", name: "Dark / Transparent", fg: "#000000", bg: "transparent" },
  { id: "transparent-light", name: "White / Transparent", fg: "#FFFFFF", bg: "transparent", isDark: true },
]

const CENTER_ICONS = [
  { id: "none", label: "None", icon: null },
  { id: "link", label: "Link", icon: "link" },
  { id: "globe", label: "Globe", icon: "globe" },
  { id: "wifi", label: "Wi-Fi", icon: "wifi" },
  { id: "user", label: "Contact", icon: "user" },
  { id: "mail", label: "Email", icon: "mail" },
  { id: "shield", label: "Security", icon: "shield" },
  { id: "star", label: "Star", icon: "star" },
]

interface HistoryItem {
  id: string
  type: PayloadType
  title: string
  payload: string
  createdAt: string
}

export default function QrStudioPage() {
  const urlInputId = useId()
  const textInputId = useId()
  const wifiSsidId = useId()
  const wifiPassId = useId()
  const vcardFirstId = useId()
  const vcardLastId = useId()
  const vcardOrgId = useId()
  const vcardPhoneId = useId()
  const vcardEmailId = useId()
  const vcardSiteId = useId()
  const emailToId = useId()
  const emailSubId = useId()
  const emailBodyId = useId()
  const smsPhoneId = useId()
  const smsMsgId = useId()
  const cryptoAddrId = useId()
  const cryptoAmtId = useId()

  const [payloadType, setPayloadType] = useState<PayloadType>("url")

  // State per payload type
  // 1. URL
  const [url, setUrl] = useState("https://tirup.in")
  // 2. Text
  const [plainText, setPlainText] = useState("Hello from Tirup Mehta's QR Studio!")
  // 3. Wi-Fi
  const [wifiSsid, setWifiSsid] = useState("")
  const [wifiPassword, setWifiPassword] = useState("")
  const [wifiAuth, setWifiAuth] = useState<"WPA" | "WEP" | "nopass">("WPA")
  const [wifiHidden, setWifiHidden] = useState(false)
  // 4. vCard
  const [vcardFirst, setVcardFirst] = useState("Tirup")
  const [vcardLast, setVcardLast] = useState("Mehta")
  const [vcardOrg, setVcardOrg] = useState("Developer & Security Researcher")
  const [vcardTitle, setVcardTitle] = useState("Software Engineer")
  const [vcardPhone, setVcardPhone] = useState("+91 ")
  const [vcardEmail, setVcardEmail] = useState("me@tirup.in")
  const [vcardUrl, setVcardUrl] = useState("https://tirup.in")
  // 5. Email
  const [emailTo, setEmailTo] = useState("me@tirup.in")
  const [emailSubject, setEmailSubject] = useState("Project Collaboration Inquiry")
  const [emailBody, setEmailBody] = useState("Hi Tirup,\n\nI came across your work and would love to connect.")
  // 6. SMS
  const [smsPhone, setSmsPhone] = useState("+1 ")
  const [smsMessage, setSmsMessage] = useState("Hey, check out this link: https://tirup.in")
  // 7. Crypto
  const [cryptoCurrency, setCryptoCurrency] = useState<"bitcoin" | "ethereum" | "solana" | "upi">("bitcoin")
  const [cryptoAddress, setCryptoAddress] = useState("")
  const [cryptoAmount, setCryptoAmount] = useState("")

  // Design Customization State
  const [fgColor, setFgColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#FFFFFF")
  const [eccLevel, setEccLevel] = useState<ErrorCorrectionLevel>("H")
  const [marginBlocks, setMarginBlocks] = useState<number>(2)
  const [selectedCenterIcon, setSelectedCenterIcon] = useState<string>("none")
  const [customLogoDataUrl, setCustomLogoDataUrl] = useState<string | null>(null)
  const [customLogoSize, setCustomLogoSize] = useState<number>(22) // percentage 15-30%

  // Output format & Copy state
  const [copiedImage, setCopiedImage] = useState(false)
  const [copiedSvg, setCopiedSvg] = useState(false)
  const [copiedDataUrl, setCopiedDataUrl] = useState(false)
  const [copiedRawPayload, setCopiedRawPayload] = useState(false)
  const [copiedAscii, setCopiedAscii] = useState(false)

  // Live Canvas and SVG Output
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("")
  const [svgOutputString, setSvgOutputString] = useState<string>("")
  const [asciiQrString, setAsciiQrString] = useState<string>("")
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historySearch, setHistorySearch] = useState("")

  // Load Persisted History from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tirup_qr_studio_history_v1")
      if (saved) setHistory(JSON.parse(saved))
    } catch (e) {}
  }, [])

  // Construct Raw Encoded Payload
  const rawPayload = useMemo(() => {
    switch (payloadType) {
      case "url": {
        const trimmed = url.trim()
        if (!trimmed) return "https://tirup.in"
        return trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`
      }
      case "text": {
        return plainText.trim() || " "
      }
      case "wifi": {
        const ssid = wifiSsid.trim()
        const pass = wifiPassword.trim()
        const auth = wifiAuth
        const hidden = wifiHidden ? "H:true;" : ""
        return `WIFI:S:${ssid};T:${auth};P:${pass};${hidden};`
      }
      case "vcard": {
        return [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `N:${vcardLast.trim()};${vcardFirst.trim()};;;`,
          `FN:${vcardFirst.trim()} ${vcardLast.trim()}`.trim(),
          vcardOrg.trim() ? `ORG:${vcardOrg.trim()}` : "",
          vcardTitle.trim() ? `TITLE:${vcardTitle.trim()}` : "",
          vcardPhone.trim() ? `TEL;TYPE=CELL:${vcardPhone.trim()}` : "",
          vcardEmail.trim() ? `EMAIL:${vcardEmail.trim()}` : "",
          vcardUrl.trim() ? `URL:${vcardUrl.trim()}` : "",
          "END:VCARD",
        ]
          .filter(Boolean)
          .join("\n")
      }
      case "email": {
        const to = emailTo.trim()
        const sub = encodeURIComponent(emailSubject.trim())
        const body = encodeURIComponent(emailBody.trim())
        const q: string[] = []
        if (sub) q.push(`subject=${sub}`)
        if (body) q.push(`body=${body}`)
        return `mailto:${to}${q.length > 0 ? `?${q.join("&")}` : ""}`
      }
      case "sms": {
        const p = smsPhone.trim()
        const msg = encodeURIComponent(smsMessage.trim())
        return `sms:${p}${msg ? `?body=${msg}` : ""}`
      }
      case "crypto": {
        const addr = cryptoAddress.trim()
        const amt = cryptoAmount.trim()
        if (cryptoCurrency === "bitcoin") {
          return `bitcoin:${addr}${amt ? `?amount=${amt}` : ""}`
        }
        if (cryptoCurrency === "ethereum") {
          return `ethereum:${addr}${amt ? `?value=${amt}` : ""}`
        }
        if (cryptoCurrency === "solana") {
          return `solana:${addr}${amt ? `?amount=${amt}` : ""}`
        }
        if (cryptoCurrency === "upi") {
          return `upi://pay?pa=${addr}&pn=Payee${amt ? `&am=${amt}` : ""}&cu=INR`
        }
        return addr
      }
      default:
        return url
    }
  }, [
    payloadType,
    url,
    plainText,
    wifiSsid,
    wifiPassword,
    wifiAuth,
    wifiHidden,
    vcardFirst,
    vcardLast,
    vcardOrg,
    vcardTitle,
    vcardPhone,
    vcardEmail,
    vcardUrl,
    emailTo,
    emailSubject,
    emailBody,
    smsPhone,
    smsMessage,
    cryptoCurrency,
    cryptoAddress,
    cryptoAmount,
  ])

  // Generate QR Code on Canvas with Custom Colors, Margin, ECC, and Center Icon
  const generateQrCode = useCallback(async () => {
    if (!rawPayload) return

    try {
      // 1. Generate High-Res Base Canvas (1024x1024)
      const baseCanvas = document.createElement("canvas")
      const qrSize = 1024

      await QRCode.toCanvas(baseCanvas, rawPayload, {
        errorCorrectionLevel: eccLevel,
        margin: marginBlocks,
        width: qrSize,
        color: {
          dark: fgColor === "transparent" ? "#000000" : fgColor,
          light: bgColor === "transparent" ? "#00000000" : bgColor,
        },
      })

      const ctx = baseCanvas.getContext("2d")
      if (ctx) {
        // Overlay center logo or icon if selected
        const hasCenterLogo = (selectedCenterIcon !== "none" || customLogoDataUrl) && eccLevel === "H"

        if (hasCenterLogo) {
          const logoDim = Math.round(qrSize * (customLogoSize / 100))
          const centerPos = (qrSize - logoDim) / 2
          const radius = Math.round(logoDim * 0.15)

          // Background badge backing under the icon to keep QR scannable
          ctx.save()
          ctx.fillStyle = bgColor === "transparent" ? "#FFFFFF" : bgColor
          ctx.beginPath()
          ctx.arc(qrSize / 2, qrSize / 2, (logoDim / 2) * 1.15, 0, Math.PI * 2)
          ctx.fill()
          ctx.lineWidth = 4
          ctx.strokeStyle = fgColor === "transparent" ? "#000000" : fgColor
          ctx.stroke()
          ctx.restore()

          if (customLogoDataUrl) {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.src = customLogoDataUrl
            await new Promise((resolve) => {
              img.onload = () => {
                ctx.save()
                ctx.beginPath()
                ctx.arc(qrSize / 2, qrSize / 2, logoDim / 2, 0, Math.PI * 2)
                ctx.clip()
                ctx.drawImage(img, centerPos, centerPos, logoDim, logoDim)
                ctx.restore()
                resolve(true)
              }
              img.onerror = () => resolve(false)
            })
          }
        }

        const dataUrl = baseCanvas.toDataURL("image/png")
        setPreviewDataUrl(dataUrl)
      }

      // 2. Generate Pure SVG String Output
      QRCode.toString(
        rawPayload,
        {
          type: "svg",
          errorCorrectionLevel: eccLevel,
          margin: marginBlocks,
          color: {
            dark: fgColor,
            light: bgColor === "transparent" ? "#00000000" : bgColor,
          },
        },
        (err, svg) => {
          if (!err && svg) setSvgOutputString(svg)
        }
      )

      // 3. Generate Terminal ASCII Art
      QRCode.toString(
        rawPayload,
        {
          type: "utf8",
          errorCorrectionLevel: "L",
          margin: 1,
        },
        (err, ascii) => {
          if (!err && ascii) setAsciiQrString(ascii)
        }
      )
    } catch (err) {
      console.error("QR Code generation error:", err)
    }
  }, [rawPayload, fgColor, bgColor, eccLevel, marginBlocks, selectedCenterIcon, customLogoDataUrl, customLogoSize])

  // Re-generate QR code on input or styling changes
  useEffect(() => {
    generateQrCode()
  }, [generateQrCode])

  // Save to History
  const logToHistory = useCallback(() => {
    if (!rawPayload.trim()) return
    const title =
      payloadType === "url"
        ? url
        : payloadType === "wifi"
        ? `Wi-Fi: ${wifiSsid || "Network"}`
        : payloadType === "vcard"
        ? `Contact: ${vcardFirst} ${vcardLast}`
        : payloadType === "email"
        ? `Email to: ${emailTo}`
        : `${payloadType.toUpperCase()}: ${rawPayload.slice(0, 30)}...`

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      type: payloadType,
      title,
      payload: rawPayload,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    const updated = [newItem, ...history.filter((h) => h.payload !== rawPayload).slice(0, 19)]
    setHistory(updated)
    try {
      localStorage.setItem("tirup_qr_studio_history_v1", JSON.stringify(updated))
    } catch (e) {}
  }, [rawPayload, payloadType, url, wifiSsid, vcardFirst, vcardLast, emailTo, history])

  // 1-Click Copy Image to Clipboard as PNG Blob
  const copyPngImageToClipboard = async () => {
    if (!previewDataUrl) return
    try {
      const response = await fetch(previewDataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])
      setCopiedImage(true)
      setTimeout(() => setCopiedImage(false), 2000)
      logToHistory()
    } catch (e) {
      // Fallback
    }
  }

  // 1-Click Copy SVG Code
  const copySvgToClipboard = async () => {
    if (!svgOutputString) return
    try {
      await navigator.clipboard.writeText(svgOutputString)
      setCopiedSvg(true)
      setTimeout(() => setCopiedSvg(false), 2000)
      logToHistory()
    } catch (e) {}
  }

  // 1-Click Copy Data URL
  const copyDataUrlToClipboard = async () => {
    if (!previewDataUrl) return
    try {
      await navigator.clipboard.writeText(previewDataUrl)
      setCopiedDataUrl(true)
      setTimeout(() => setCopiedDataUrl(false), 2000)
      logToHistory()
    } catch (e) {}
  }

  // 1-Click Copy Raw Encoded String
  const copyRawPayloadToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(rawPayload)
      setCopiedRawPayload(true)
      setTimeout(() => setCopiedRawPayload(false), 2000)
    } catch (e) {}
  }

  // 1-Click Copy ASCII Terminal Text
  const copyAsciiToClipboard = async () => {
    if (!asciiQrString) return
    try {
      await navigator.clipboard.writeText(asciiQrString)
      setCopiedAscii(true)
      setTimeout(() => setCopiedAscii(false), 2000)
    } catch (e) {}
  }

  // Download High-Res PNG
  const downloadPng = (resolution: 1024 | 2048 | 4096 = 2048) => {
    if (!previewDataUrl) return
    const link = document.createElement("a")
    link.href = previewDataUrl
    link.download = `qr-code-${payloadType}-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    logToHistory()
  }

  // Download Vector SVG
  const downloadSvg = () => {
    if (!svgOutputString) return
    const blob = new Blob([svgOutputString], { type: "image/svg+xml;charset=utf-8" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `qr-code-vector-${payloadType}-${Date.now()}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    logToHistory()
  }

  // Handle Custom Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomLogoDataUrl(event.target.result as string)
          setEccLevel("H") // Force High Error Correction for Logo safety
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeCustomLogo = () => {
    setCustomLogoDataUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Apply Color Preset
  const applyColorPreset = (preset: ColorPreset) => {
    setFgColor(preset.fg)
    setBgColor(preset.bg)
  }

  // Restore item from history
  const restoreFromHistory = (item: HistoryItem) => {
    setPayloadType(item.type)
    if (item.type === "url") setUrl(item.payload)
    if (item.type === "text") setPlainText(item.payload)
  }

  const clearHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem("tirup_qr_studio_history_v1")
    } catch (e) {}
  }

  // Filtered History
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return history
    return history.filter(
      (h) => h.title.toLowerCase().includes(historySearch.toLowerCase()) || h.payload.toLowerCase().includes(historySearch.toLowerCase())
    )
  }, [history, historySearch])

  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <Header />

      <section className="section max-w-5xl mx-auto w-full px-6 md:px-20 pb-20">
        {/* Header Title */}
        <TextWithBlur delay={50}>
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-accent uppercase font-medium">
                <Sparkles size={14} /> Developer Utility & Vector Studio
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-black/50 dark:text-white/50">
                <ShieldCheck size={13} className="text-emerald-500" />
                100% Client-Side Privacy (Zero Tracking)
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif italic font-medium text-black dark:text-white mb-2">
              Pro QR Code & Vector Studio
            </h1>
            <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 max-w-2xl leading-relaxed">
              Generate print-ready vector SVGs, Wi-Fi credentials, vCards, and ultra-high-resolution QR codes with custom styling, center logos, and zero telemetry.
            </p>
          </div>
        </TextWithBlur>

        {/* Payload Type Selector Tabs */}
        <TextWithBlur delay={80}>
          <div className="flex flex-wrap items-center gap-1.5 mb-8 pb-3 border-b border-black/10 dark:border-white/10">
            {[
              { type: "url" as const, label: "Website URL", icon: Globe },
              { type: "text" as const, label: "Plain Text", icon: FileText },
              { type: "wifi" as const, label: "Wi-Fi Network", icon: Wifi },
              { type: "vcard" as const, label: "vCard Contact", icon: User },
              { type: "email" as const, label: "Email Mailto", icon: Mail },
              { type: "sms" as const, label: "SMS Message", icon: MessageSquare },
              { type: "crypto" as const, label: "Crypto & UPI", icon: Coins },
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setPayloadType(type)}
                className={`text-sm px-3.5 py-2 rounded-none border transition-all duration-200 flex items-center gap-1.5 ${
                  payloadType === type
                    ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-sm"
                    : "bg-white/80 dark:bg-zinc-900/80 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </TextWithBlur>

        {/* Main 2-Column Studio Grid: Left Controls | Right Live QR Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── LEFT COLUMN: INPUT FORMS & STYLING CONTROLS (7 Cols) ── */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Dynamic Payload Inputs Form */}
            <TextWithBlur delay={100}>
              <div className="p-6 rounded-none bg-white/70 dark:bg-zinc-900/70 border border-black/10 dark:border-white/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                  <span className="text-xs uppercase font-mono tracking-wider text-black/60 dark:text-white/60 font-medium flex items-center gap-1.5">
                    <Sliders size={13} className="text-accent" /> Data Configuration ({payloadType.toUpperCase()})
                  </span>
                  <span className="text-[11px] font-mono text-black/40 dark:text-white/40">
                    {rawPayload.length} characters
                  </span>
                </div>

                {/* ── MODE: URL ── */}
                {payloadType === "url" && (
                  <div className="space-y-2">
                    <label htmlFor={urlInputId} className="block text-xs font-mono uppercase tracking-wider text-black/70 dark:text-white/70 font-medium">
                      Target Website Link <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={urlInputId}
                      type="url"
                      placeholder="https://tirup.in or https://yourdomain.com/page"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:border-accent font-mono"
                    />
                    <p className="text-xs text-black/50 dark:text-white/50 font-light">
                      Scanners will immediately prompt to open this destination URL in the default browser.
                    </p>
                  </div>
                )}

                {/* ── MODE: PLAIN TEXT ── */}
                {payloadType === "text" && (
                  <div className="space-y-2">
                    <label htmlFor={textInputId} className="block text-xs font-mono uppercase tracking-wider text-black/70 dark:text-white/70 font-medium">
                      Plain Text or Secret Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={textInputId}
                      rows={4}
                      placeholder="Enter raw text, notes, serial numbers, or markdown..."
                      value={plainText}
                      onChange={(e) => setPlainText(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:border-accent font-mono"
                    />
                  </div>
                )}

                {/* ── MODE: WI-FI ── */}
                {payloadType === "wifi" && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor={wifiSsidId} className="block text-xs font-mono uppercase tracking-wider text-black/70 dark:text-white/70 mb-1 font-medium">
                        Network Name (SSID) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={wifiSsidId}
                        type="text"
                        placeholder="e.g. Home_5G_Network"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:border-accent font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={wifiPassId} className="block text-xs font-mono uppercase tracking-wider text-black/70 dark:text-white/70 mb-1 font-medium">
                          Password
                        </label>
                        <input
                          id={wifiPassId}
                          type="text"
                          placeholder="Wi-Fi Password"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:border-accent font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-black/70 dark:text-white/70 mb-1 font-medium">
                          Encryption Protocol
                        </label>
                        <select
                          value={wifiAuth}
                          onChange={(e) => setWifiAuth(e.target.value as any)}
                          className="w-full text-sm px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none font-mono"
                        >
                          <option value="WPA">WPA / WPA2 / WPA3 (Default)</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">No Password (Open)</option>
                        </select>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-mono text-black/70 dark:text-white/70 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={wifiHidden}
                        onChange={(e) => setWifiHidden(e.target.checked)}
                        className="rounded-none accent-black dark:accent-white"
                      />
                      <span>Hidden SSID Network</span>
                    </label>
                  </div>
                )}

                {/* ── MODE: VCARD ── */}
                {payloadType === "vcard" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={vcardFirstId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                          First Name
                        </label>
                        <input
                          id={vcardFirstId}
                          type="text"
                          value={vcardFirst}
                          onChange={(e) => setVcardFirst(e.target.value)}
                          className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label htmlFor={vcardLastId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                          Last Name
                        </label>
                        <input
                          id={vcardLastId}
                          type="text"
                          value={vcardLast}
                          onChange={(e) => setVcardLast(e.target.value)}
                          className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={vcardOrgId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                          Organization / Bio
                        </label>
                        <input
                          id={vcardOrgId}
                          type="text"
                          value={vcardOrg}
                          onChange={(e) => setVcardOrg(e.target.value)}
                          className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label htmlFor={vcardPhoneId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                          Phone Number
                        </label>
                        <input
                          id={vcardPhoneId}
                          type="tel"
                          value={vcardPhone}
                          onChange={(e) => setVcardPhone(e.target.value)}
                          className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={vcardEmailId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                          Email Address
                        </label>
                        <input
                          id={vcardEmailId}
                          type="email"
                          value={vcardEmail}
                          onChange={(e) => setVcardEmail(e.target.value)}
                          className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label htmlFor={vcardSiteId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                          Website URL
                        </label>
                        <input
                          id={vcardSiteId}
                          type="url"
                          value={vcardUrl}
                          onChange={(e) => setVcardUrl(e.target.value)}
                          className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── MODE: EMAIL ── */}
                {payloadType === "email" && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor={emailToId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                        Recipient Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={emailToId}
                        type="email"
                        placeholder="recipient@example.com"
                        value={emailTo}
                        onChange={(e) => setEmailTo(e.target.value)}
                        className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor={emailSubId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                        Subject Line
                      </label>
                      <input
                        id={emailSubId}
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor={emailBodyId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                        Email Body
                      </label>
                      <textarea
                        id={emailBodyId}
                        rows={3}
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* ── MODE: SMS ── */}
                {payloadType === "sms" && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor={smsPhoneId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                        Recipient Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={smsPhoneId}
                        type="tel"
                        placeholder="+1 555 019 2834"
                        value={smsPhone}
                        onChange={(e) => setSmsPhone(e.target.value)}
                        className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor={smsMsgId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                        Pre-filled SMS Text
                      </label>
                      <textarea
                        id={smsMsgId}
                        rows={3}
                        value={smsMessage}
                        onChange={(e) => setSmsMessage(e.target.value)}
                        className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* ── MODE: CRYPTO & UPI ── */}
                {payloadType === "crypto" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {(["bitcoin", "ethereum", "solana", "upi"] as const).map((curr) => (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => setCryptoCurrency(curr)}
                          className={`text-xs px-3 py-1.5 uppercase font-mono rounded-none border transition-all ${
                            cryptoCurrency === curr
                              ? "bg-black text-white dark:bg-white dark:text-black font-medium"
                              : "bg-white dark:bg-zinc-950 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70"
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label htmlFor={cryptoAddrId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                        {cryptoCurrency === "upi" ? "UPI VPA (e.g. user@okhdfcbank)" : `${cryptoCurrency.toUpperCase()} Wallet Address`}
                      </label>
                      <input
                        id={cryptoAddrId}
                        type="text"
                        placeholder="Enter wallet address or UPI ID..."
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value)}
                        className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                      />
                    </div>

                    <div>
                      <label htmlFor={cryptoAmtId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                        Requested Amount (optional)
                      </label>
                      <input
                        id={cryptoAmtId}
                        type="text"
                        placeholder="e.g. 0.05"
                        value={cryptoAmount}
                        onChange={(e) => setCryptoAmount(e.target.value)}
                        className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </TextWithBlur>

            {/* 2. Visual Styling & Color Studio */}
            <TextWithBlur delay={120}>
              <div className="p-6 rounded-none bg-white/70 dark:bg-zinc-900/70 border border-black/10 dark:border-white/10 shadow-sm space-y-5">
                <div className="border-b border-black/5 dark:border-white/5 pb-3">
                  <span className="text-xs uppercase font-mono tracking-wider text-black/60 dark:text-white/60 font-medium flex items-center gap-1.5">
                    <Palette size={13} className="text-accent" /> Visual Styling & Color Engine
                  </span>
                </div>

                {/* Color Palettes */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-black/50 dark:text-white/50 block">
                    Curated Color Schemes:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COLOR_PRESETS.map((p) => {
                      const isSelected = fgColor === p.fg && bgColor === p.bg
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => applyColorPreset(p)}
                          className={`text-xs px-3 py-2 rounded-none border flex items-center justify-between transition-all ${
                            isSelected
                              ? "border-black dark:border-white ring-1 ring-black dark:ring-white font-medium"
                              : "border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30"
                          }`}
                        >
                          <span className="text-black dark:text-white">{p.name}</span>
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: p.fg }} />
                            <span
                              className="w-3 h-3 rounded-full border border-black/20"
                              style={{ backgroundColor: p.bg === "transparent" ? "#E4E4E7" : p.bg }}
                            />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Custom Color Pickers & Quiet Zone Margin */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-black/5 dark:border-white/5">
                  <div>
                    <label className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1.5">
                      Foreground Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={fgColor === "transparent" ? "#000000" : fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-8 h-8 rounded-none border border-black/20 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 font-mono text-black dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1.5">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor === "transparent" ? "#FFFFFF" : bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded-none border border-black/20 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 font-mono text-black dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1.5">
                      Error Correction (ECC)
                    </label>
                    <select
                      value={eccLevel}
                      onChange={(e) => setEccLevel(e.target.value as ErrorCorrectionLevel)}
                      className="w-full text-xs px-3 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                    >
                      <option value="H">H (30% Redundancy - Best for Logos)</option>
                      <option value="Q">Q (25% High Reliability)</option>
                      <option value="M">M (15% Standard)</option>
                      <option value="L">L (7% Dense)</option>
                    </select>
                  </div>
                </div>

                {/* Center Badge / Logo Overlay */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-mono tracking-wider text-black/60 dark:text-white/60 font-medium flex items-center gap-1.5">
                      <ImageIcon size={13} /> Center Logo / Emblem Overlay
                    </span>
                    {customLogoDataUrl && (
                      <button
                        onClick={removeCustomLogo}
                        className="text-xs font-mono text-red-500 hover:underline flex items-center gap-1"
                      >
                        <X size={12} /> Remove Custom Logo
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="custom-logo-upload"
                    />
                    <label
                      htmlFor="custom-logo-upload"
                      className="px-3.5 py-2 rounded-none border border-dashed border-black/20 dark:border-white/20 text-xs font-mono text-black/80 dark:text-white/80 hover:border-black dark:hover:border-white transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload size={13} /> {customLogoDataUrl ? "Change Custom Logo..." : "Upload Logo (PNG/SVG)..."}
                    </label>

                    {customLogoDataUrl && (
                      <div className="flex items-center gap-2">
                        <img src={customLogoDataUrl} alt="Logo Preview" className="w-8 h-8 object-contain bg-white p-0.5 border border-black/10" />
                        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">ECC forced to Level H</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TextWithBlur>
          </div>

          {/* ── RIGHT COLUMN: LIVE CANVAS PREVIEW & EXPORT ACTIONS (5 Cols) ── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live QR Output Studio Box */}
            <TextWithBlur delay={140}>
              <div className="p-6 md:p-8 rounded-none bg-zinc-950 text-white border border-zinc-800 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <span className="text-xs uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Sparkles size={14} className="text-accent" /> Vector Output Preview
                  </span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-none border border-emerald-800">
                    Print Ready
                  </span>
                </div>

                {/* Rendered QR Image Box with Subtle Grid Pattern */}
                <div className="p-6 bg-white rounded-none border border-zinc-700/80 flex items-center justify-center shadow-inner relative group min-h-[280px]">
                  {previewDataUrl ? (
                    <img
                      src={previewDataUrl}
                      alt="Generated QR Code"
                      className="w-full max-w-[260px] h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="text-xs font-mono text-zinc-400">Rendering vector...</div>
                  )}
                </div>

                {/* Primary Export Buttons */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={copyPngImageToClipboard}
                    className="w-full py-3 px-4 rounded-none bg-white text-black font-medium text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {copiedImage ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    {copiedImage ? "Image Copied to Clipboard!" : "Copy Image to Clipboard"}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => downloadPng(2048)}
                      className="py-2.5 px-3 rounded-none bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 border border-zinc-800 font-mono"
                    >
                      <Download size={13} /> Download PNG (2K)
                    </button>

                    <button
                      type="button"
                      onClick={downloadSvg}
                      className="py-2.5 px-3 rounded-none bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 border border-zinc-800 font-mono"
                    >
                      <FileCode size={13} /> Download Vector SVG
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-900">
                    <button
                      type="button"
                      onClick={copySvgToClipboard}
                      className="py-2 px-2 rounded-none bg-zinc-900 text-zinc-400 hover:text-white text-[11px] font-mono transition-colors text-center border border-zinc-800/80"
                      title="Copy raw SVG markup"
                    >
                      {copiedSvg ? "Copied SVG!" : "Copy SVG"}
                    </button>

                    <button
                      type="button"
                      onClick={copyDataUrlToClipboard}
                      className="py-2 px-2 rounded-none bg-zinc-900 text-zinc-400 hover:text-white text-[11px] font-mono transition-colors text-center border border-zinc-800/80"
                      title="Copy Base64 Data URL"
                    >
                      {copiedDataUrl ? "Copied Data!" : "Copy Data URL"}
                    </button>

                    <button
                      type="button"
                      onClick={copyAsciiToClipboard}
                      className="py-2 px-2 rounded-none bg-zinc-900 text-zinc-400 hover:text-white text-[11px] font-mono transition-colors text-center border border-zinc-800/80"
                      title="Copy ASCII Terminal QR Code"
                    >
                      {copiedAscii ? "Copied ASCII!" : "Copy ASCII"}
                    </button>
                  </div>
                </div>

                {/* Raw Payload Inspector Box */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>Encoded Payload:</span>
                    <button
                      onClick={copyRawPayloadToClipboard}
                      className="text-accent hover:underline flex items-center gap-1"
                    >
                      {copiedRawPayload ? "Copied!" : "Copy Text"}
                    </button>
                  </div>
                  <div className="p-3 bg-black/80 font-mono text-xs text-emerald-400 break-all select-all border border-zinc-900 max-h-24 overflow-y-auto leading-relaxed">
                    {rawPayload}
                  </div>
                </div>

                {/* Test Action */}
                {payloadType === "url" && (
                  <div className="pt-1 text-right">
                    <a
                      href={rawPayload}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                    >
                      Test Scanned URL in New Tab <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </TextWithBlur>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PERSISTENT HISTORY ARCHIVE                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {history.length > 0 && (
          <TextWithBlur delay={200}>
            <div className="mt-14 pt-8 border-t border-black/10 dark:border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <History size={14} className="text-accent" />
                  <h2 className="text-xs uppercase font-mono tracking-wider text-black/60 dark:text-white/60 font-medium">
                    Recent Generated QR Codes ({history.length})
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
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="px-2 py-0.5 rounded-none bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70 uppercase text-[10px]">
                        {item.type}
                      </span>
                      <span className="truncate text-black dark:text-white font-medium">{item.title}</span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-black/40 dark:text-white/40 text-[11px] hidden sm:inline">{item.createdAt}</span>
                      <button
                        onClick={() => restoreFromHistory(item)}
                        className="px-2.5 py-1 rounded-none border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black dark:text-white"
                      >
                        Load
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TextWithBlur>
        )}
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-black/10 dark:border-white/10">
        <p className="text-xs text-black/50 dark:text-white/50" suppressHydrationWarning>© {currentYear} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
