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
  FileCode,
  Search,
  Upload,
  X,
  Calendar,
  PhoneCall,
  Code,
  FileSpreadsheet,
} from "lucide-react"

// Types
type PayloadType = "url" | "text" | "wifi" | "vcard" | "email" | "sms" | "whatsapp" | "calendar"
type ErrorCorrectionLevel = "L" | "M" | "Q" | "H"
type ModuleShape = "square" | "dots" | "rounded"
type EyeShape = "square" | "rounded" | "circle"
type FrameStyle = "none" | "bottom-banner" | "top-banner" | "pill-badge"

interface ColorPreset {
  id: string
  name: string
  fg: string
  bg: string
}

const COLOR_PRESETS: ColorPreset[] = [
  { id: "monochrome-light", name: "Obsidian / White", fg: "#000000", bg: "#FFFFFF" },
  { id: "monochrome-dark", name: "White / Charcoal", fg: "#FFFFFF", bg: "#09090B" },
  { id: "midnight-navy", name: "Midnight Navy", fg: "#0F172A", bg: "#F8FAFC" },
  { id: "emerald", name: "Emerald Minimal", fg: "#047857", bg: "#F0FDF4" },
  { id: "royal-indigo", name: "Royal Indigo", fg: "#4338CA", bg: "#EEF2FF" },
  { id: "charcoal-slate", name: "Charcoal Slate", fg: "#334155", bg: "#F1F5F9" },
  { id: "sunset-amber", name: "Sunset Amber", fg: "#D97706", bg: "#FFFBEB" },
  { id: "transparent-dark", name: "Dark / Transparent", fg: "#000000", bg: "transparent" },
  { id: "transparent-light", name: "White / Transparent", fg: "#FFFFFF", bg: "transparent" },
]

const FRAME_PRESETS = [
  { id: "none", label: "No Frame" },
  { id: "bottom-banner", label: "Bottom 'Scan Me'" },
  { id: "top-banner", label: "Top Header" },
  { id: "pill-badge", label: "Pill Badge" },
]

interface HistoryItem {
  id: string
  type: PayloadType
  title: string
  payload: string
  createdAt: string
}

export default function QrStudioPage() {
  // Input IDs for Accessibility
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
  const waPhoneId = useId()
  const waMsgId = useId()
  const calTitleId = useId()
  const calLocId = useId()
  const calStartId = useId()
  const calEndId = useId()
  const frameTextId = useId()

  // Payload Type
  const [payloadType, setPayloadType] = useState<PayloadType>("url")

  // Form States
  const [url, setUrl] = useState("https://tirup.in")
  const [plainText, setPlainText] = useState("Hello from Tirup Mehta's QR Studio!")
  const [wifiSsid, setWifiSsid] = useState("")
  const [wifiPassword, setWifiPassword] = useState("")
  const [wifiAuth, setWifiAuth] = useState<"WPA" | "WEP" | "nopass">("WPA")
  const [wifiHidden, setWifiHidden] = useState(false)
  const [vcardFirst, setVcardFirst] = useState("Tirup")
  const [vcardLast, setVcardLast] = useState("Mehta")
  const [vcardOrg, setVcardOrg] = useState("Developer & Security Researcher")
  const [vcardTitle, setVcardTitle] = useState("Software Engineer")
  const [vcardPhone, setVcardPhone] = useState("+91 ")
  const [vcardEmail, setVcardEmail] = useState("me@tirup.in")
  const [vcardUrl, setVcardUrl] = useState("https://tirup.in")
  const [emailTo, setEmailTo] = useState("me@tirup.in")
  const [emailSubject, setEmailSubject] = useState("Project Collaboration Inquiry")
  const [emailBody, setEmailBody] = useState("Hi Tirup,\n\nI came across your work and would love to connect.")
  const [smsPhone, setSmsPhone] = useState("+1 ")
  const [smsMessage, setSmsMessage] = useState("Hey, check out this link: https://tirup.in")
  const [waPhone, setWaPhone] = useState("+1 ")
  const [waMessage, setWaMessage] = useState("Hi! Reaching out from your QR code.")
  const [calTitle, setCalTitle] = useState("Keynote / Launch Event")
  const [calLocation, setCalLocation] = useState("Online / San Francisco")
  const [calStart, setCalStart] = useState("2026-09-01T10:00")
  const [calEnd, setCalEnd] = useState("2026-09-01T11:30")

  // Design Customization State
  const [fgColor, setFgColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#FFFFFF")
  const [eccLevel, setEccLevel] = useState<ErrorCorrectionLevel>("H")
  const [marginBlocks, setMarginBlocks] = useState<number>(2)
  const [moduleShape, setModuleShape] = useState<ModuleShape>("square")
  const [eyeShape, setEyeShape] = useState<EyeShape>("square")
  const [frameStyle, setFrameStyle] = useState<FrameStyle>("none")
  const [frameText, setFrameText] = useState("Scan Me")

  // Custom Logo Overlay State
  const [customLogoDataUrl, setCustomLogoDataUrl] = useState<string | null>(null)
  const [customLogoSize, setCustomLogoSize] = useState<number>(22)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Copy Feedback State
  const [copiedImage, setCopiedImage] = useState(false)
  const [copiedSvg, setCopiedSvg] = useState(false)
  const [copiedDataUrl, setCopiedDataUrl] = useState(false)
  const [copiedRawPayload, setCopiedRawPayload] = useState(false)
  const [copiedAscii, setCopiedAscii] = useState(false)

  // Live Canvas and SVG Output
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("")
  const [svgOutputString, setSvgOutputString] = useState<string>("")
  const [asciiQrString, setAsciiQrString] = useState<string>("")

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historySearch, setHistorySearch] = useState("")

  // Load Persisted History from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tirup_qr_studio_history_v6")
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
      case "whatsapp": {
        const p = waPhone.replace(/[^0-9]/g, "")
        const msg = encodeURIComponent(waMessage.trim())
        return `https://wa.me/${p}${msg ? `?text=${msg}` : ""}`
      }
      case "calendar": {
        const sDate = calStart ? new Date(calStart).toISOString().replace(/-|:|\.\d+/g, "") : ""
        const eDate = calEnd ? new Date(calEnd).toISOString().replace(/-|:|\.\d+/g, "") : ""
        return [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "BEGIN:VEVENT",
          `SUMMARY:${calTitle.trim()}`,
          calLocation.trim() ? `LOCATION:${calLocation.trim()}` : "",
          sDate ? `DTSTART:${sDate}` : "",
          eDate ? `DTEND:${eDate}` : "",
          "END:VEVENT",
          "END:VCALENDAR",
        ]
          .filter(Boolean)
          .join("\n")
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
    waPhone,
    waMessage,
    calTitle,
    calLocation,
    calStart,
    calEnd,
  ])

  // Custom Canvas Rendering Engine
  const renderAdvancedCanvas = useCallback(async () => {
    if (!rawPayload) return

    try {
      const qr = QRCode.create(rawPayload, { errorCorrectionLevel: eccLevel })
      const moduleCount = qr.modules.size
      const moduleData = qr.modules.data

      const isFinderPattern = (r: number, c: number) => {
        if (r < 7 && c < 7) return true
        if (r < 7 && c >= moduleCount - 7) return true
        if (r >= moduleCount - 7 && c < 7) return true
        return false
      }

      const baseQrResolution = 1024
      const margin = marginBlocks
      const totalGridSize = moduleCount + margin * 2
      const moduleSize = baseQrResolution / totalGridSize

      const hasFrame = frameStyle !== "none" && frameText.trim()
      const frameHeight = hasFrame ? 140 : 0
      const canvasWidth = baseQrResolution
      const canvasHeight = baseQrResolution + frameHeight

      const canvas = document.createElement("canvas")
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Draw Background
      if (bgColor !== "transparent") {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      } else {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      }

      // Foreground Fill
      const fillStyle = fgColor === "transparent" ? "#000000" : fgColor
      ctx.fillStyle = fillStyle

      const qrOffsetY = frameStyle === "top-banner" ? frameHeight : 0

      // Draw Standard Modules
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          const isDark = moduleData[r * moduleCount + c] === 1
          if (!isDark) continue

          const x = (c + margin) * moduleSize
          const y = (r + margin) * moduleSize + qrOffsetY

          if (isFinderPattern(r, c) && eyeShape !== "square") {
            continue
          }

          if (moduleShape === "dots") {
            ctx.beginPath()
            ctx.arc(x + moduleSize / 2, y + moduleSize / 2, moduleSize * 0.45, 0, Math.PI * 2)
            ctx.fill()
          } else if (moduleShape === "rounded") {
            const rad = moduleSize * 0.35
            ctx.beginPath()
            ctx.roundRect(x + 0.5, y + 0.5, moduleSize - 1, moduleSize - 1, rad)
            ctx.fill()
          } else {
            ctx.fillRect(x, y, moduleSize + 0.2, moduleSize + 0.2)
          }
        }
      }

      // Draw Custom Finder Eyes
      if (eyeShape !== "square") {
        const eyeLocations = [
          { r: 0, c: 0 },
          { r: 0, c: moduleCount - 7 },
          { r: moduleCount - 7, c: 0 },
        ]

        eyeLocations.forEach(({ r, c }) => {
          const eyeX = (c + margin) * moduleSize
          const eyeY = (r + margin) * moduleSize + qrOffsetY
          const eyeDimension = 7 * moduleSize

          ctx.save()
          if (eyeShape === "circle") {
            ctx.beginPath()
            ctx.arc(eyeX + eyeDimension / 2, eyeY + eyeDimension / 2, eyeDimension / 2, 0, Math.PI * 2)
            ctx.fillStyle = fillStyle
            ctx.fill()

            ctx.beginPath()
            ctx.arc(eyeX + eyeDimension / 2, eyeY + eyeDimension / 2, (5 * moduleSize) / 2, 0, Math.PI * 2)
            ctx.fillStyle = bgColor === "transparent" ? "#FFFFFF" : bgColor
            ctx.fill()

            ctx.beginPath()
            ctx.arc(eyeX + eyeDimension / 2, eyeY + eyeDimension / 2, (3 * moduleSize) / 2, 0, Math.PI * 2)
            ctx.fillStyle = fillStyle
            ctx.fill()
          } else if (eyeShape === "rounded") {
            ctx.beginPath()
            ctx.roundRect(eyeX, eyeY, eyeDimension, eyeDimension, eyeDimension * 0.28)
            ctx.fillStyle = fillStyle
            ctx.fill()

            const innerOffset = moduleSize
            const innerDimension = 5 * moduleSize
            ctx.beginPath()
            ctx.roundRect(
              eyeX + innerOffset,
              eyeY + innerOffset,
              innerDimension,
              innerDimension,
              innerDimension * 0.24
            )
            ctx.fillStyle = bgColor === "transparent" ? "#FFFFFF" : bgColor
            ctx.fill()

            const coreOffset = 2 * moduleSize
            const coreDimension = 3 * moduleSize
            ctx.beginPath()
            ctx.roundRect(eyeX + coreOffset, eyeY + coreOffset, coreDimension, coreDimension, coreDimension * 0.28)
            ctx.fillStyle = fillStyle
            ctx.fill()
          }
          ctx.restore()
        })
      }

      // Draw Center Logo / Emblem Badge Overlay
      if (customLogoDataUrl && eccLevel === "H") {
        const logoDim = Math.round(baseQrResolution * (customLogoSize / 100))
        const centerX = canvasWidth / 2
        const centerY = qrOffsetY + baseQrResolution / 2
        const badgePadding = Math.max(10, logoDim * 0.12)
        const badgeDim = logoDim + badgePadding * 2

        ctx.save()
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"

        const badgeRadius = Math.round(badgeDim * 0.22)
        ctx.fillStyle = bgColor === "transparent" ? "#FFFFFF" : bgColor
        ctx.beginPath()
        ctx.roundRect(centerX - badgeDim / 2, centerY - badgeDim / 2, badgeDim, badgeDim, badgeRadius)
        ctx.fill()

        ctx.lineWidth = Math.max(3, Math.round(baseQrResolution * 0.004))
        ctx.strokeStyle = fgColor === "transparent" ? "#000000" : fgColor
        ctx.stroke()

        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = customLogoDataUrl
        await new Promise((resolve) => {
          img.onload = () => {
            ctx.save()
            const imgRadius = Math.round(logoDim * 0.18)
            ctx.beginPath()
            ctx.roundRect(centerX - logoDim / 2, centerY - logoDim / 2, logoDim, logoDim, imgRadius)
            ctx.clip()
            ctx.drawImage(img, centerX - logoDim / 2, centerY - logoDim / 2, logoDim, logoDim)
            ctx.restore()
            resolve(true)
          }
          img.onerror = () => resolve(false)
        })
        ctx.restore()
      }

      // Draw Frame Text
      if (hasFrame) {
        ctx.save()
        ctx.font = "bold 36px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        if (frameStyle === "bottom-banner") {
          const bannerY = baseQrResolution + frameHeight / 2
          ctx.fillStyle = fillStyle
          ctx.fillText(frameText, canvasWidth / 2, bannerY)
        } else if (frameStyle === "top-banner") {
          const bannerY = frameHeight / 2
          ctx.fillStyle = fillStyle
          ctx.fillText(frameText, canvasWidth / 2, bannerY)
        } else if (frameStyle === "pill-badge") {
          const badgeWidth = Math.min(canvasWidth * 0.75, ctx.measureText(frameText).width + 80)
          const badgeHeight = 54
          const badgeX = (canvasWidth - badgeWidth) / 2
          const badgeY = baseQrResolution + 40

          ctx.fillStyle = fillStyle
          ctx.beginPath()
          ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 27)
          ctx.fill()

          ctx.fillStyle = bgColor === "transparent" ? "#FFFFFF" : bgColor
          ctx.font = "bold 26px sans-serif"
          ctx.fillText(frameText, canvasWidth / 2, badgeY + badgeHeight / 2)
        }
        ctx.restore()
      }

      const fullDataUrl = canvas.toDataURL("image/png")
      setPreviewDataUrl(fullDataUrl)

      // Clean Vector SVG
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

      // Terminal ASCII
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
      console.error("QR Render Error:", err)
    }
  }, [
    rawPayload,
    eccLevel,
    marginBlocks,
    frameStyle,
    frameText,
    bgColor,
    fgColor,
    moduleShape,
    eyeShape,
    customLogoDataUrl,
    customLogoSize,
  ])

  useEffect(() => {
    renderAdvancedCanvas()
  }, [renderAdvancedCanvas])

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
        ? `Email: ${emailTo}`
        : payloadType === "whatsapp"
        ? `WhatsApp: ${waPhone}`
        : `${payloadType}: ${rawPayload.slice(0, 30)}...`

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
      localStorage.setItem("tirup_qr_studio_history_v6", JSON.stringify(updated))
    } catch (e) {}
  }, [rawPayload, payloadType, url, wifiSsid, vcardFirst, vcardLast, emailTo, waPhone, history])

  // 1-Click Copy Image to Clipboard
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
    } catch (e) {}
  }

  // 1-Click Copy SVG
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

  // 1-Click Copy Raw Payload
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
    link.download = `qr-code-${payloadType}-${resolution}px-${Date.now()}.png`
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

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomLogoDataUrl(event.target.result as string)
          setEccLevel("H")
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

  const restoreFromHistory = (item: HistoryItem) => {
    setPayloadType(item.type)
    if (item.type === "url") setUrl(item.payload)
    if (item.type === "text") setPlainText(item.payload)
  }

  const clearHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem("tirup_qr_studio_history_v6")
    } catch (e) {}
  }

  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return history
    return history.filter(
      (h) => h.title.toLowerCase().includes(historySearch.toLowerCase()) || h.payload.toLowerCase().includes(historySearch.toLowerCase())
    )
  }, [history, historySearch])

  const payloadTitle = useMemo(() => {
    switch (payloadType) {
      case "url": return "URL Link"
      case "text": return "Plain Text"
      case "wifi": return "Wi-Fi"
      case "vcard": return "vCard"
      case "email": return "Email"
      case "sms": return "SMS"
      case "whatsapp": return "WhatsApp"
      case "calendar": return "Calendar Event"
      default: return "Data"
    }
  }, [payloadType])

  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <Header />

      <section className="section max-w-4xl mx-auto w-full px-6 md:px-20 pb-20">
        {/* Header Title */}
        <TextWithBlur delay={50}>
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs text-accent font-medium">
                <Sparkles size={14} /> Developer Utility & Vector Studio
              </div>
              <div className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50">
                <ShieldCheck size={13} className="text-emerald-500" />
                100% Client-Side Privacy
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif italic font-medium text-black dark:text-white mb-2">
              Pro QR Code & Vector Studio
            </h1>
            <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 max-w-2xl leading-relaxed">
              Generate print-ready vector SVGs, Wi-Fi credentials, vCards, custom module shapes, frames, and high-resolution QR codes with zero tracking.
            </p>
          </div>
        </TextWithBlur>

        {/* ── UNIFIED 2-COLUMN STUDIO ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── LEFT COLUMN: DATA INPUTS & STYLING (7 COLS) ── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Payload Type Selector */}
            <TextWithBlur delay={75}>
              <div className="space-y-2">
                <span className="text-xs text-black/60 dark:text-white/60 block font-medium">
                  Select Data Type:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { type: "url" as const, label: "URL Link", icon: Globe },
                    { type: "text" as const, label: "Plain Text", icon: FileText },
                    { type: "wifi" as const, label: "Wi-Fi Network", icon: Wifi },
                    { type: "vcard" as const, label: "vCard Contact", icon: User },
                    { type: "email" as const, label: "Email", icon: Mail },
                    { type: "sms" as const, label: "SMS", icon: MessageSquare },
                    { type: "whatsapp" as const, label: "WhatsApp", icon: PhoneCall },
                    { type: "calendar" as const, label: "Calendar Event", icon: Calendar },
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => setPayloadType(type)}
                      className={`text-xs px-3 py-2 rounded-none border transition-all duration-200 flex items-center gap-1.5 ${
                        payloadType === type
                          ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-sm"
                          : "bg-white/80 dark:bg-zinc-900/80 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                      }`}
                    >
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </TextWithBlur>

            {/* Dynamic Payload Form */}
            <TextWithBlur delay={100}>
              <div className="p-6 rounded-none bg-white/70 dark:bg-zinc-900/70 border border-black/10 dark:border-white/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                  <span className="text-xs text-black/70 dark:text-white/70 font-medium flex items-center gap-1.5">
                    <Sliders size={13} className="text-accent" /> Data Configuration ({payloadTitle})
                  </span>
                  <span className="text-xs text-black/40 dark:text-white/40">
                    {rawPayload.length} characters
                  </span>
                </div>

                {/* ── MODE: URL ── */}
                {payloadType === "url" && (
                  <div className="space-y-2">
                    <label htmlFor={urlInputId} className="block text-xs text-black/70 dark:text-white/70 font-medium">
                      Target Website Link <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={urlInputId}
                      type="url"
                      placeholder="https://tirup.in or https://yourdomain.com/page"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:border-accent"
                    />
                    <p className="text-xs text-black/50 dark:text-white/50 font-light">
                      Mobile cameras will immediately prompt visitors to open this link in their browser.
                    </p>
                  </div>
                )}

                {/* ── MODE: PLAIN TEXT ── */}
                {payloadType === "text" && (
                  <div className="space-y-2">
                    <label htmlFor={textInputId} className="block text-xs text-black/70 dark:text-white/70 font-medium">
                      Plain Text or Secret Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={textInputId}
                      rows={4}
                      placeholder="Enter raw text, notes, serial numbers, or markdown..."
                      value={plainText}
                      onChange={(e) => setPlainText(e.target.value)}
                      className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                )}

                {/* ── MODE: WI-FI ── */}
                {payloadType === "wifi" && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor={wifiSsidId} className="block text-xs text-black/70 dark:text-white/70 mb-1 font-medium">
                        Network Name (SSID) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={wifiSsidId}
                        type="text"
                        placeholder="e.g. Office_5G_HighSpeed"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={wifiPassId} className="block text-xs text-black/70 dark:text-white/70 mb-1 font-medium">
                          Password
                        </label>
                        <input
                          id={wifiPassId}
                          type="text"
                          placeholder="Wi-Fi Password"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          className="w-full text-base px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-black/70 dark:text-white/70 mb-1 font-medium">
                          Security Protocol
                        </label>
                        <select
                          value={wifiAuth}
                          onChange={(e) => setWifiAuth(e.target.value as any)}
                          className="w-full text-sm px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none"
                        >
                          <option value="WPA">WPA / WPA2 / WPA3 (Default)</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">No Password (Open)</option>
                        </select>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-black/70 dark:text-white/70 cursor-pointer select-none">
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
                        <label htmlFor={vcardFirstId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                          First Name
                        </label>
                        <input
                          id={vcardFirstId}
                          type="text"
                          value={vcardFirst}
                          onChange={(e) => setVcardFirst(e.target.value)}
                          className="w-full text-sm px-3.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor={vcardLastId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                          Last Name
                        </label>
                        <input
                          id={vcardLastId}
                          type="text"
                          value={vcardLast}
                          onChange={(e) => setVcardLast(e.target.value)}
                          className="w-full text-sm px-3.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={vcardOrgId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                          Organization / Bio
                        </label>
                        <input
                          id={vcardOrgId}
                          type="text"
                          value={vcardOrg}
                          onChange={(e) => setVcardOrg(e.target.value)}
                          className="w-full text-sm px-3.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor={vcardPhoneId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                          Phone Number
                        </label>
                        <input
                          id={vcardPhoneId}
                          type="tel"
                          value={vcardPhone}
                          onChange={(e) => setVcardPhone(e.target.value)}
                          className="w-full text-sm px-3.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={vcardEmailId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                          Email Address
                        </label>
                        <input
                          id={vcardEmailId}
                          type="email"
                          value={vcardEmail}
                          onChange={(e) => setVcardEmail(e.target.value)}
                          className="w-full text-sm px-3.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor={vcardSiteId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                          Website URL
                        </label>
                        <input
                          id={vcardSiteId}
                          type="url"
                          value={vcardUrl}
                          onChange={(e) => setVcardUrl(e.target.value)}
                          className="w-full text-sm px-3.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── MODE: EMAIL ── */}
                {payloadType === "email" && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor={emailToId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                        Recipient Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={emailToId}
                        type="email"
                        placeholder="recipient@example.com"
                        value={emailTo}
                        onChange={(e) => setEmailTo(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor={emailSubId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                        Subject Line
                      </label>
                      <input
                        id={emailSubId}
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor={emailBodyId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                        Email Body
                      </label>
                      <textarea
                        id={emailBodyId}
                        rows={3}
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* ── MODE: SMS ── */}
                {payloadType === "sms" && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor={smsPhoneId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                        Recipient Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={smsPhoneId}
                        type="tel"
                        placeholder="+1 555 019 2834"
                        value={smsPhone}
                        onChange={(e) => setSmsPhone(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor={smsMsgId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                        Pre-filled SMS Text
                      </label>
                      <textarea
                        id={smsMsgId}
                        rows={3}
                        value={smsMessage}
                        onChange={(e) => setSmsMessage(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* ── MODE: WHATSAPP ── */}
                {payloadType === "whatsapp" && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor={waPhoneId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                        WhatsApp Number (with country code) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={waPhoneId}
                        type="tel"
                        placeholder="e.g. 15551234567"
                        value={waPhone}
                        onChange={(e) => setWaPhone(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor={waMsgId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                        Pre-filled Greeting Message
                      </label>
                      <textarea
                        id={waMsgId}
                        rows={3}
                        value={waMessage}
                        onChange={(e) => setWaMessage(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* ── MODE: CALENDAR EVENT ── */}
                {payloadType === "calendar" && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor={calTitleId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                        Event Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={calTitleId}
                        type="text"
                        value={calTitle}
                        onChange={(e) => setCalTitle(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor={calLocId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                        Location
                      </label>
                      <input
                        id={calLocId}
                        type="text"
                        value={calLocation}
                        onChange={(e) => setCalLocation(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={calStartId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                          Start Time
                        </label>
                        <input
                          id={calStartId}
                          type="datetime-local"
                          value={calStart}
                          onChange={(e) => setCalStart(e.target.value)}
                          className="w-full text-xs px-2.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor={calEndId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                          End Time
                        </label>
                        <input
                          id={calEndId}
                          type="datetime-local"
                          value={calEnd}
                          onChange={(e) => setCalEnd(e.target.value)}
                          className="w-full text-xs px-2.5 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TextWithBlur>

            {/* Visual Styling Controls */}
            <TextWithBlur delay={120}>
              <div className="p-6 rounded-none bg-white/70 dark:bg-zinc-900/70 border border-black/10 dark:border-white/10 shadow-sm space-y-5">
                <div className="border-b border-black/5 dark:border-white/5 pb-3">
                  <span className="text-xs text-black/70 dark:text-white/70 font-medium flex items-center gap-1.5">
                    <Palette size={13} className="text-accent" /> Vector Shapes & Styling
                  </span>
                </div>

                {/* Module Pattern & Corner Eye Shapes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-black/60 dark:text-white/60 mb-1.5 block font-medium">
                      Module Pattern:
                    </span>
                    <div className="flex gap-2">
                      {[
                        { id: "square" as const, label: "Square" },
                        { id: "rounded" as const, label: "Rounded" },
                        { id: "dots" as const, label: "Dots" },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setModuleShape(m.id)}
                          className={`flex-1 text-xs py-2 rounded-none border transition-all ${
                            moduleShape === m.id
                              ? "bg-black text-white dark:bg-white dark:text-black font-medium shadow-sm"
                              : "bg-white dark:bg-zinc-950 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-black/60 dark:text-white/60 mb-1.5 block font-medium">
                      Corner Finder Eyes:
                    </span>
                    <div className="flex gap-2">
                      {[
                        { id: "square" as const, label: "Classic" },
                        { id: "rounded" as const, label: "Squircle" },
                        { id: "circle" as const, label: "Circle" },
                      ].map((e) => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => setEyeShape(e.id)}
                          className={`flex-1 text-xs py-2 rounded-none border transition-all ${
                            eyeShape === e.id
                              ? "bg-black text-white dark:bg-white dark:text-black font-medium shadow-sm"
                              : "bg-white dark:bg-zinc-950 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                          }`}
                        >
                          {e.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Curated Color Schemes */}
                <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                  <span className="text-xs text-black/60 dark:text-white/60 block font-medium">
                    Color Schemes:
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
                              ? "border-black dark:border-white ring-1 ring-black dark:ring-white font-medium bg-black/5 dark:bg-white/10"
                              : "border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 bg-white/60 dark:bg-zinc-950/60"
                          }`}
                        >
                          <span className="text-black dark:text-white truncate pr-1">{p.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
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

                {/* ── Clean 2-Row Color & ECC Form ── */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-4">
                  {/* Row 1: Foreground & Background Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Foreground Color */}
                    <div className="p-3.5 rounded-none border border-black/10 dark:border-white/10 bg-white/50 dark:bg-zinc-950/50 space-y-2">
                      <label className="block text-xs text-black/70 dark:text-white/70 font-medium">
                        Foreground Color
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={fgColor === "transparent" ? "#000000" : fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-9 h-9 rounded-none border border-black/20 dark:border-white/20 cursor-pointer p-0 bg-transparent shrink-0"
                          title="Pick color"
                        />
                        <input
                          type="text"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none"
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    {/* Background Color */}
                    <div className="p-3.5 rounded-none border border-black/10 dark:border-white/10 bg-white/50 dark:bg-zinc-950/50 space-y-2">
                      <label className="block text-xs text-black/70 dark:text-white/70 font-medium">
                        Background Color
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={bgColor === "transparent" ? "#FFFFFF" : bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-9 h-9 rounded-none border border-black/20 dark:border-white/20 cursor-pointer p-0 bg-transparent shrink-0"
                          title="Pick color"
                        />
                        <input
                          type="text"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none"
                          placeholder="#FFFFFF or transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Error Correction & Margin */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* ECC */}
                    <div className="p-3.5 rounded-none border border-black/10 dark:border-white/10 bg-white/50 dark:bg-zinc-950/50 space-y-2">
                      <label className="block text-xs text-black/70 dark:text-white/70 font-medium">
                        Error Correction (ECC)
                      </label>
                      <select
                        value={eccLevel}
                        onChange={(e) => setEccLevel(e.target.value as ErrorCorrectionLevel)}
                        className="w-full text-xs px-3 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none"
                      >
                        <option value="H">H (30% Redundancy - Best for Logos)</option>
                        <option value="Q">Q (25% High Reliability)</option>
                        <option value="M">M (15% Standard)</option>
                        <option value="L">L (7% Dense)</option>
                      </select>
                    </div>

                    {/* Margin */}
                    <div className="p-3.5 rounded-none border border-black/10 dark:border-white/10 bg-white/50 dark:bg-zinc-950/50 space-y-2">
                      <label className="block text-xs text-black/70 dark:text-white/70 font-medium">
                        Quiet Zone Margin
                      </label>
                      <div className="flex gap-2">
                        {[
                          { val: 0, label: "0" },
                          { val: 1, label: "1" },
                          { val: 2, label: "2 (Default)" },
                          { val: 4, label: "4" },
                        ].map((m) => (
                          <button
                            key={m.val}
                            type="button"
                            onClick={() => setMarginBlocks(m.val)}
                            className={`flex-1 text-xs py-1.5 rounded-none border transition-all ${
                              marginBlocks === m.val
                                ? "bg-black text-white dark:bg-white dark:text-black font-medium"
                                : "bg-white dark:bg-zinc-950 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Frame / Call-to-Action Border */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-3">
                  <span className="text-xs text-black/60 dark:text-white/60 font-medium block">
                    Call-to-Action Frame:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FRAME_PRESETS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFrameStyle(f.id as any)}
                        className={`text-xs py-2 px-2 rounded-none border transition-all truncate ${
                          frameStyle === f.id
                            ? "bg-black text-white dark:bg-white dark:text-black font-medium shadow-sm"
                            : "bg-white dark:bg-zinc-950 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {frameStyle !== "none" && (
                    <div className="pt-1">
                      <label htmlFor={frameTextId} className="block text-xs text-black/60 dark:text-white/60 mb-1">
                        Frame Text
                      </label>
                      <input
                        id={frameTextId}
                        type="text"
                        placeholder="e.g. Scan Me, Scan for Wi-Fi, Visit Website"
                        value={frameText}
                        onChange={(e) => setFrameText(e.target.value)}
                        className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Center Emblem / Custom Logo Upload */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-black/60 dark:text-white/60 font-medium flex items-center gap-1.5">
                      <ImageIcon size={13} /> Center Emblem / Logo Overlay
                    </span>
                    {customLogoDataUrl && (
                      <button
                        onClick={removeCustomLogo}
                        className="text-xs text-red-500 hover:underline flex items-center gap-1"
                      >
                        <X size={12} /> Remove Logo
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
                      className="px-3.5 py-2 rounded-none border border-dashed border-black/20 dark:border-white/20 text-xs text-black/80 dark:text-white/80 hover:border-black dark:hover:border-white transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload size={13} /> {customLogoDataUrl ? "Change Custom Logo..." : "Upload Logo (PNG/SVG)..."}
                    </label>

                    {customLogoDataUrl && (
                      <div className="flex items-center gap-2">
                        <img src={customLogoDataUrl} alt="Logo Preview" className="w-8 h-8 object-contain bg-white p-0.5 border border-black/10 rounded-sm" />
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">ECC Level H enabled</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TextWithBlur>
          </div>

          {/* ── RIGHT COLUMN: LIVE CANVAS & EXPORTS (5 COLS) ── */}
          <div className="lg:col-span-5 space-y-6">
            <TextWithBlur delay={140}>
              <div className="p-6 md:p-8 rounded-none bg-white dark:bg-zinc-950 text-black dark:text-white border border-black/10 dark:border-zinc-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-3">
                  <span className="text-xs text-black/70 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Sparkles size={14} className="text-accent" /> Vector Output Preview
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-none border border-emerald-200 dark:border-emerald-800">
                    2048px Vector
                  </span>
                </div>

                {/* Rendered Canvas Preview */}
                <div className="p-6 bg-zinc-50 dark:bg-black/40 rounded-none border border-black/10 dark:border-zinc-800 flex items-center justify-center min-h-[290px]">
                  {previewDataUrl ? (
                    <img
                      src={previewDataUrl}
                      alt="Rendered QR Code"
                      className="w-full max-w-[270px] h-auto object-contain select-none"
                    />
                  ) : (
                    <div className="text-xs text-black/40 dark:text-zinc-500">Rendering vector...</div>
                  )}
                </div>

                {/* Primary Export Actions */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={copyPngImageToClipboard}
                    className="w-full py-3 px-4 rounded-none bg-black text-white dark:bg-white dark:text-black font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {copiedImage ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    {copiedImage ? "Image Copied to Clipboard!" : "Copy Image to Clipboard"}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => downloadPng(2048)}
                      className="w-full py-2.5 px-3 rounded-none border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Download size={13} /> Download PNG (2K)
                    </button>

                    <button
                      type="button"
                      onClick={downloadSvg}
                      className="w-full py-2.5 px-3 rounded-none border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileCode size={13} /> Download SVG (Vector)
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-black/5 dark:border-zinc-900">
                    <button
                      type="button"
                      onClick={copySvgToClipboard}
                      className="py-2 px-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      title="Copy raw SVG markup"
                    >
                      {copiedSvg ? <Check size={12} className="text-emerald-500" /> : <Code size={12} />}
                      {copiedSvg ? "Copied" : "Copy SVG"}
                    </button>

                    <button
                      type="button"
                      onClick={copyDataUrlToClipboard}
                      className="py-2 px-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      title="Copy Base64 Data URL"
                    >
                      {copiedDataUrl ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      {copiedDataUrl ? "Copied" : "Data URL"}
                    </button>

                    <button
                      type="button"
                      onClick={copyAsciiToClipboard}
                      className="py-2 px-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      title="Copy ASCII Terminal QR Code"
                    >
                      {copiedAscii ? <Check size={12} className="text-emerald-500" /> : <FileText size={12} />}
                      {copiedAscii ? "Copied" : "Terminal"}
                    </button>
                  </div>
                </div>

                {/* Raw Payload Inspector Box */}
                <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-zinc-900">
                  <div className="flex items-center justify-between text-xs text-black/60 dark:text-zinc-400">
                    <span>Encoded Payload:</span>
                    <button
                      onClick={copyRawPayloadToClipboard}
                      className="text-accent hover:underline flex items-center gap-1"
                    >
                      {copiedRawPayload ? "Copied!" : "Copy text"}
                    </button>
                  </div>
                  <div className="p-3 bg-black/5 dark:bg-black/80 font-mono text-xs text-black/80 dark:text-emerald-400 break-all select-all border border-black/10 dark:border-zinc-900 max-h-24 overflow-y-auto leading-relaxed">
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
                      className="inline-flex items-center gap-1 text-xs text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      Test link in new tab <ExternalLink size={12} />
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
          <TextWithBlur delay={180}>
            <div className="mt-14 pt-8 border-t border-black/10 dark:border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <History size={14} className="text-accent" />
                  <h2 className="text-xs text-black/60 dark:text-white/60 font-medium">
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
                      className="text-xs px-3 py-1.5 pl-7 rounded-none border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white focus:outline-none"
                    />
                    <Search size={12} className="absolute left-2.5 top-2.5 text-black/40 dark:text-white/40" />
                  </div>

                  <button
                    onClick={clearHistory}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                </div>
              </div>

              <div className="flex flex-col border-t border-black/10 dark:border-white/10">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="px-2 py-0.5 rounded-none bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70 text-[10px]">
                        {item.type}
                      </span>
                      <span className="truncate text-black dark:text-white font-medium">{item.title}</span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-black/40 dark:text-white/40 text-[11px] hidden sm:inline">{item.createdAt}</span>
                      <button
                        onClick={() => restoreFromHistory(item)}
                        className="px-2.5 py-1 rounded-none border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black dark:text-white font-medium"
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
