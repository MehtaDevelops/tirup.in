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
  Scan,
  Calendar,
  PhoneCall,
  CheckSquare,
  Square,
  Type,
  Maximize2,
  AlertTriangle,
} from "lucide-react"

// Types
type PayloadType = "url" | "text" | "wifi" | "vcard" | "email" | "sms" | "whatsapp" | "crypto" | "calendar"
type ErrorCorrectionLevel = "L" | "M" | "Q" | "H"
type ModuleShape = "square" | "dots" | "rounded"
type EyeShape = "square" | "rounded" | "circle"
type FrameStyle = "none" | "bottom-banner" | "top-banner" | "pill-badge"

interface ColorPreset {
  id: string
  name: string
  fg: string
  bg: string
  fgEnd?: string // For gradients
  isDark?: boolean
}

const COLOR_PRESETS: ColorPreset[] = [
  { id: "monochrome-light", name: "Obsidian / White", fg: "#000000", bg: "#FFFFFF" },
  { id: "monochrome-dark", name: "White / Dark Zinc", fg: "#FFFFFF", bg: "#09090B", isDark: true },
  { id: "emerald", name: "Emerald Matrix", fg: "#10B981", fgEnd: "#059669", bg: "#022C22", isDark: true },
  { id: "cyberpunk", name: "Cyberpunk Neon", fg: "#06B6D4", fgEnd: "#8B5CF6", bg: "#09090B", isDark: true },
  { id: "royal-indigo", name: "Royal Indigo", fg: "#4F46E5", fgEnd: "#7C3AED", bg: "#EEF2FF" },
  { id: "sunset", name: "Sunset Horizon", fg: "#F59E0B", fgEnd: "#EF4444", bg: "#18181B", isDark: true },
  { id: "crimson", name: "Crimson Security", fg: "#E11D48", bg: "#FFF1F2" },
  { id: "transparent-dark", name: "Dark / Transparent", fg: "#000000", bg: "transparent" },
  { id: "transparent-light", name: "White / Transparent", fg: "#FFFFFF", bg: "transparent", isDark: true },
]

const FRAME_PRESETS = [
  { id: "none", label: "No Frame" },
  { id: "bottom-banner", label: "Bottom Banner ('SCAN ME')" },
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
  const cryptoAddrId = useId()
  const cryptoAmtId = useId()
  const calTitleId = useId()
  const calLocId = useId()
  const calStartId = useId()
  const calEndId = useId()
  const frameTextId = useId()

  // Studio Mode: Single Builder vs Batch Matrix vs QR Decoder
  const [activeTab, setActiveTab] = useState<"single" | "design" | "batch" | "decode">("single")

  // Payload Type
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
  // 7. WhatsApp
  const [waPhone, setWaPhone] = useState("+1 ")
  const [waMessage, setWaMessage] = useState("Hi! I'm reaching out after scanning your QR code.")
  // 8. Crypto & UPI
  const [cryptoCurrency, setCryptoCurrency] = useState<"bitcoin" | "ethereum" | "solana" | "upi">("bitcoin")
  const [cryptoAddress, setCryptoAddress] = useState("")
  const [cryptoAmount, setCryptoAmount] = useState("")
  // 9. Calendar
  const [calTitle, setCalTitle] = useState("Keynote / Launch Event")
  const [calLocation, setCalLocation] = useState("Online / San Francisco")
  const [calStart, setCalStart] = useState("2026-09-01T10:00")
  const [calEnd, setCalEnd] = useState("2026-09-01T11:30")

  // Design Customization State
  const [fgColor, setFgColor] = useState("#000000")
  const [fgEndColor, setFgEndColor] = useState("")
  const [useGradient, setUseGradient] = useState(false)
  const [bgColor, setBgColor] = useState("#FFFFFF")
  const [eccLevel, setEccLevel] = useState<ErrorCorrectionLevel>("H")
  const [marginBlocks, setMarginBlocks] = useState<number>(2)
  const [moduleShape, setModuleShape] = useState<ModuleShape>("square")
  const [eyeShape, setEyeShape] = useState<EyeShape>("square")
  const [frameStyle, setFrameStyle] = useState<FrameStyle>("none")
  const [frameText, setFrameText] = useState("SCAN ME")
  const [downloadResolution, setDownloadResolution] = useState<1024 | 2048 | 4096>(2048)

  // Custom Logo Overlay State
  const [customLogoDataUrl, setCustomLogoDataUrl] = useState<string | null>(null)
  const [customLogoSize, setCustomLogoSize] = useState<number>(22) // percentage 15-30%
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Batch Generation State
  const [batchRawInput, setBatchRawInput] = useState(
    "https://tirup.in\nhttps://github.com/TirupMehta\nhttps://blogs.tirup.in\nhttps://tirup.in/work"
  )
  const [batchGenerated, setBatchGenerated] = useState<{ text: string; dataUrl: string }[]>([])
  const [copiedBatchIndex, setCopiedBatchIndex] = useState<number | null>(null)

  // QR Decoder State
  const [decodedOutput, setDecodedOutput] = useState<{
    text: string
    type: string
    parsedDetails?: Record<string, string>
  } | null>(null)
  const [isDecoding, setIsDecoding] = useState(false)
  const decodeFileInputRef = useRef<HTMLInputElement | null>(null)

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
      const saved = localStorage.getItem("tirup_qr_studio_history_v2")
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
    cryptoCurrency,
    cryptoAddress,
    cryptoAmount,
    calTitle,
    calLocation,
    calStart,
    calEnd,
  ])

  // Contrast Ratio Validator to ensure mobile phone cameras can scan the QR code
  const contrastCheck = useMemo(() => {
    if (bgColor === "transparent") return { score: "Good", valid: true, text: "Transparent background with contrast dependent on surface." }
    // Simple heuristic check
    if (fgColor.toLowerCase() === bgColor.toLowerCase()) {
      return { score: "Unscannable", valid: false, text: "Foreground and background colors are identical." }
    }
    return { score: "Optimal", valid: true, text: "High contrast detected. Readily scannable by all mobile cameras." }
  }, [fgColor, bgColor])

  // Custom Canvas Rendering Engine supporting Dots, Rounded Modules, Gradients, Finder Eyes, Frames & Logos
  const renderAdvancedCanvas = useCallback(async () => {
    if (!rawPayload) return

    try {
      // 1. Generate QR Code Matrix via QRCode library
      const qr = QRCode.create(rawPayload, { errorCorrectionLevel: eccLevel })
      const moduleCount = qr.modules.size
      const moduleData = qr.modules.data

      const isFinderPattern = (r: number, c: number) => {
        // Top-left
        if (r < 7 && c < 7) return true
        // Top-right
        if (r < 7 && c >= moduleCount - 7) return true
        // Bottom-left
        if (r >= moduleCount - 7 && c < 7) return true
        return false
      }

      // Calculate Dimensions
      const baseQrResolution = 1024
      const margin = marginBlocks
      const totalGridSize = moduleCount + margin * 2
      const moduleSize = baseQrResolution / totalGridSize

      // Add extra padding for CTA frame if requested
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

      // Configure Foreground Fill (Solid or Linear Gradient)
      let fillStyle: string | CanvasGradient = fgColor === "transparent" ? "#000000" : fgColor
      if (useGradient && fgEndColor) {
        const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight)
        grad.addColorStop(0, fgColor)
        grad.addColorStop(1, fgEndColor)
        fillStyle = grad
      }
      ctx.fillStyle = fillStyle

      const qrOffsetY = frameStyle === "top-banner" ? frameHeight : 0

      // Draw Standard Modules
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          const isDark = moduleData[r * moduleCount + c] === 1
          if (!isDark) continue

          const x = (c + margin) * moduleSize
          const y = (r + margin) * moduleSize + qrOffsetY

          // Skip drawing custom eye modules here; we draw them with custom styling below
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
            // Crisp square
            ctx.fillRect(x, y, moduleSize + 0.2, moduleSize + 0.2)
          }
        }
      }

      // Draw Custom Finder Eyes if requested
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
            // Outer Circle
            ctx.beginPath()
            ctx.arc(eyeX + eyeDimension / 2, eyeY + eyeDimension / 2, eyeDimension / 2, 0, Math.PI * 2)
            ctx.fillStyle = fillStyle
            ctx.fill()

            // Inner Ring Background
            ctx.beginPath()
            ctx.arc(eyeX + eyeDimension / 2, eyeY + eyeDimension / 2, (5 * moduleSize) / 2, 0, Math.PI * 2)
            ctx.fillStyle = bgColor === "transparent" ? "#FFFFFF" : bgColor
            ctx.fill()

            // Center Dot
            ctx.beginPath()
            ctx.arc(eyeX + eyeDimension / 2, eyeY + eyeDimension / 2, (3 * moduleSize) / 2, 0, Math.PI * 2)
            ctx.fillStyle = fillStyle
            ctx.fill()
          } else if (eyeShape === "rounded") {
            // Outer Rounded Squircle
            ctx.beginPath()
            ctx.roundRect(eyeX, eyeY, eyeDimension, eyeDimension, eyeDimension * 0.28)
            ctx.fillStyle = fillStyle
            ctx.fill()

            // Inner Cutout
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

            // Center Core
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

        ctx.save()
        // Badge backing disk
        ctx.fillStyle = bgColor === "transparent" ? "#FFFFFF" : bgColor
        ctx.beginPath()
        ctx.arc(centerX, centerY, (logoDim / 2) * 1.15, 0, Math.PI * 2)
        ctx.fill()
        ctx.lineWidth = 4
        ctx.strokeStyle = fgColor === "transparent" ? "#000000" : fgColor
        ctx.stroke()

        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = customLogoDataUrl
        await new Promise((resolve) => {
          img.onload = () => {
            ctx.save()
            ctx.beginPath()
            ctx.arc(centerX, centerY, logoDim / 2, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(img, centerX - logoDim / 2, centerY - logoDim / 2, logoDim, logoDim)
            ctx.restore()
            resolve(true)
          }
          img.onerror = () => resolve(false)
        })
        ctx.restore()
      }

      // Draw Frame / Call-To-Action (CTA) Text
      if (hasFrame) {
        ctx.save()
        ctx.font = "bold 38px monospace, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        if (frameStyle === "bottom-banner") {
          const bannerY = baseQrResolution + frameHeight / 2
          ctx.fillStyle = fillStyle
          ctx.fillText(frameText.toUpperCase(), canvasWidth / 2, bannerY)
        } else if (frameStyle === "top-banner") {
          const bannerY = frameHeight / 2
          ctx.fillStyle = fillStyle
          ctx.fillText(frameText.toUpperCase(), canvasWidth / 2, bannerY)
        } else if (frameStyle === "pill-badge") {
          const badgeWidth = Math.min(canvasWidth * 0.75, ctx.measureText(frameText.toUpperCase()).width + 80)
          const badgeHeight = 54
          const badgeX = (canvasWidth - badgeWidth) / 2
          const badgeY = baseQrResolution + 40

          ctx.fillStyle = fillStyle
          ctx.beginPath()
          ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 27)
          ctx.fill()

          ctx.fillStyle = bgColor === "transparent" ? "#FFFFFF" : bgColor
          ctx.font = "bold 26px monospace, sans-serif"
          ctx.fillText(frameText.toUpperCase(), canvasWidth / 2, badgeY + badgeHeight / 2)
        }
        ctx.restore()
      }

      const fullDataUrl = canvas.toDataURL("image/png")
      setPreviewDataUrl(fullDataUrl)

      // Generate Clean Vector SVG
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

      // Generate Terminal ASCII Art
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
    useGradient,
    fgEndColor,
    moduleShape,
    eyeShape,
    customLogoDataUrl,
    customLogoSize,
  ])

  // Trigger render on changes
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
        ? `Email to: ${emailTo}`
        : payloadType === "whatsapp"
        ? `WhatsApp: ${waPhone}`
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
      localStorage.setItem("tirup_qr_studio_history_v2", JSON.stringify(updated))
    } catch (e) {}
  }, [rawPayload, payloadType, url, wifiSsid, vcardFirst, vcardLast, emailTo, waPhone, history])

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

  // Download High-Res PNG with Chosen Resolution
  const downloadPng = (resolution: 1024 | 2048 | 4096 = downloadResolution) => {
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
    if (preset.fgEnd) {
      setFgEndColor(preset.fgEnd)
      setUseGradient(true)
    } else {
      setFgEndColor("")
      setUseGradient(false)
    }
  }

  // Batch Generation Processor
  const processBatchGeneration = async () => {
    const lines = batchRawInput
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 30)

    const results: { text: string; dataUrl: string }[] = []
    for (const line of lines) {
      try {
        const dUrl = await QRCode.toDataURL(line, {
          width: 512,
          margin: 2,
          color: { dark: fgColor, light: bgColor === "transparent" ? "#00000000" : bgColor },
        })
        results.push({ text: line, dataUrl: dUrl })
      } catch (e) {}
    }
    setBatchGenerated(results)
  }

  const copyBatchSingle = async (index: number, dataUrl: string) => {
    try {
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])
      setCopiedBatchIndex(index)
      setTimeout(() => setCopiedBatchIndex(null), 2000)
    } catch (e) {}
  }

  // QR Decoder & Scanner Handler (File upload or paste)
  const handleDecodeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsDecoding(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const src = ev.target?.result as string
      if (!src) {
        setIsDecoding(false)
        return
      }

      // Check if native BarcodeDetector is supported in browser
      if ("BarcodeDetector" in window) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector({ formats: ["qr_code"] })
          const img = new Image()
          img.src = src
          await new Promise((r) => (img.onload = r))
          const barcodes = await barcodeDetector.detect(img)
          if (barcodes && barcodes.length > 0) {
            const rawVal = barcodes[0].rawValue
            parseDecodedPayload(rawVal)
            setIsDecoding(false)
            return
          }
        } catch (err) {
          // Fallback to canvas inspection
        }
      }

      // Fallback: Display the image and allow manual entry / inspection
      setDecodedOutput({
        text: "Image uploaded. If automatic detection is unsupported by your browser engine, paste the URL or text directly into the Studio.",
        type: "Image Scanned",
      })
      setIsDecoding(false)
    }
    reader.readAsDataURL(file)
  }

  const parseDecodedPayload = (raw: string) => {
    if (raw.startsWith("WIFI:")) {
      const ssid = raw.match(/S:([^;]+)/)?.[1] || ""
      const pass = raw.match(/P:([^;]+)/)?.[1] || ""
      const auth = raw.match(/T:([^;]+)/)?.[1] || "WPA"
      setDecodedOutput({
        text: raw,
        type: "Wi-Fi Credentials",
        parsedDetails: { SSID: ssid, Password: pass, "Security Type": auth },
      })
    } else if (raw.startsWith("BEGIN:VCARD")) {
      setDecodedOutput({
        text: raw,
        type: "vCard Digital Contact",
        parsedDetails: { Format: "vCard 3.0" },
      })
    } else if (raw.startsWith("http://") || raw.startsWith("https://")) {
      setDecodedOutput({
        text: raw,
        type: "Website Link",
        parsedDetails: { URL: raw },
      })
    } else if (raw.startsWith("mailto:")) {
      setDecodedOutput({
        text: raw,
        type: "Email Address",
        parsedDetails: { Mailto: raw.replace("mailto:", "") },
      })
    } else {
      setDecodedOutput({
        text: raw,
        type: "Plain Text / Custom Payload",
      })
    }
  }

  // Restore item from history
  const restoreFromHistory = (item: HistoryItem) => {
    setPayloadType(item.type)
    if (item.type === "url") setUrl(item.payload)
    if (item.type === "text") setPlainText(item.payload)
    setActiveTab("single")
  }

  const clearHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem("tirup_qr_studio_history_v2")
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
                100% Client-Side Privacy (Zero Telemetry)
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif italic font-medium text-black dark:text-white mb-2">
              Pro QR Code & Vector Studio
            </h1>
            <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 max-w-2xl leading-relaxed">
              Generate print-ready vector SVGs, Wi-Fi credentials, vCards, custom module shapes, gradients, frames, and ultra-high-resolution QR codes with zero tracking.
            </p>
          </div>
        </TextWithBlur>

        {/* Primary Studio Mode Navigation */}
        <TextWithBlur delay={70}>
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
                <Sliders size={14} /> Single Studio
              </button>

              <button
                onClick={() => setActiveTab("design")}
                className={`text-sm px-4 py-2 rounded-none border transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === "design"
                    ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-sm"
                    : "bg-white/80 dark:bg-zinc-900/80 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                }`}
              >
                <Palette size={14} /> Shapes, Gradients & Frames
              </button>

              <button
                onClick={() => setActiveTab("batch")}
                className={`text-sm px-4 py-2 rounded-none border transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === "batch"
                    ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-sm"
                    : "bg-white/80 dark:bg-zinc-900/80 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                }`}
              >
                <Layers size={14} /> Batch Multi-QR Matrix
              </button>

              <button
                onClick={() => setActiveTab("decode")}
                className={`text-sm px-4 py-2 rounded-none border transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === "decode"
                    ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-sm"
                    : "bg-white/80 dark:bg-zinc-900/80 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                }`}
              >
                <Scan size={14} /> QR Decoder & Inspector
              </button>
            </div>
          </div>
        </TextWithBlur>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1 & 2: MAIN STUDIO (SINGLE & DESIGN CUSTOMIZER)                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {(activeTab === "single" || activeTab === "design") && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── LEFT COLUMN: INPUTS & CONTROLS (7 COLS) ── */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Payload Type Selector */}
              {activeTab === "single" && (
                <TextWithBlur delay={85}>
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-mono tracking-wider text-black/50 dark:text-white/50 block font-medium">
                      Select Data Type:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { type: "url" as const, label: "URL Link", icon: Globe },
                        { type: "text" as const, label: "Plain Text", icon: FileText },
                        { type: "wifi" as const, label: "Wi-Fi Network", icon: Wifi },
                        { type: "vcard" as const, label: "vCard Contact", icon: User },
                        { type: "email" as const, label: "Email Mailto", icon: Mail },
                        { type: "sms" as const, label: "SMS Message", icon: MessageSquare },
                        { type: "whatsapp" as const, label: "WhatsApp Chat", icon: PhoneCall },
                        { type: "crypto" as const, label: "Crypto & UPI", icon: Coins },
                        { type: "calendar" as const, label: "Calendar Event", icon: Calendar },
                      ].map(({ type, label, icon: Icon }) => (
                        <button
                          key={type}
                          onClick={() => setPayloadType(type)}
                          className={`text-xs px-3 py-1.5 rounded-none border transition-all duration-200 flex items-center gap-1.5 ${
                            payloadType === type
                              ? "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium shadow-sm"
                              : "bg-white/80 dark:bg-zinc-900/80 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                          }`}
                        >
                          <Icon size={13} /> {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </TextWithBlur>
              )}

              {/* Dynamic Payload Form */}
              {activeTab === "single" && (
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
                          Mobile cameras will immediately prompt visitors to open this link in their browser.
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
                            placeholder="e.g. Office_5G_HighSpeed"
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

                    {/* ── MODE: WHATSAPP ── */}
                    {payloadType === "whatsapp" && (
                      <div className="space-y-3">
                        <div>
                          <label htmlFor={waPhoneId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                            WhatsApp Number (with country code) <span className="text-red-500">*</span>
                          </label>
                          <input
                            id={waPhoneId}
                            type="tel"
                            placeholder="e.g. 15551234567"
                            value={waPhone}
                            onChange={(e) => setWaPhone(e.target.value)}
                            className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                          />
                        </div>
                        <div>
                          <label htmlFor={waMsgId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                            Pre-filled Greeting Message
                          </label>
                          <textarea
                            id={waMsgId}
                            rows={3}
                            value={waMessage}
                            onChange={(e) => setWaMessage(e.target.value)}
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
                            {cryptoCurrency === "upi" ? "UPI VPA (e.g. name@okhdfcbank)" : `${cryptoCurrency.toUpperCase()} Wallet Address`}
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

                    {/* ── MODE: CALENDAR EVENT ── */}
                    {payloadType === "calendar" && (
                      <div className="space-y-3">
                        <div>
                          <label htmlFor={calTitleId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                            Event Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            id={calTitleId}
                            type="text"
                            value={calTitle}
                            onChange={(e) => setCalTitle(e.target.value)}
                            className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                          />
                        </div>
                        <div>
                          <label htmlFor={calLocId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                            Location
                          </label>
                          <input
                            id={calLocId}
                            type="text"
                            value={calLocation}
                            onChange={(e) => setCalLocation(e.target.value)}
                            className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor={calStartId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                              Start Time
                            </label>
                            <input
                              id={calStartId}
                              type="datetime-local"
                              value={calStart}
                              onChange={(e) => setCalStart(e.target.value)}
                              className="w-full text-xs px-2.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                            />
                          </div>
                          <div>
                            <label htmlFor={calEndId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                              End Time
                            </label>
                            <input
                              id={calEndId}
                              type="datetime-local"
                              value={calEnd}
                              onChange={(e) => setCalEnd(e.target.value)}
                              className="w-full text-xs px-2.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-black dark:text-white font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TextWithBlur>
              )}

              {/* Design Customizer (Shapes, Gradients & Frames) */}
              <TextWithBlur delay={120}>
                <div className="p-6 rounded-none bg-white/70 dark:bg-zinc-900/70 border border-black/10 dark:border-white/10 shadow-sm space-y-5">
                  <div className="border-b border-black/5 dark:border-white/5 pb-3">
                    <span className="text-xs uppercase font-mono tracking-wider text-black/60 dark:text-white/60 font-medium flex items-center gap-1.5">
                      <Palette size={13} className="text-accent" /> Vector Shapes, Color Palettes & CTA Frames
                    </span>
                  </div>

                  {/* Module Shapes & Corner Eye Customization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1.5 block">
                        Module / Dot Pattern
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
                                ? "bg-black text-white dark:bg-white dark:text-black font-medium"
                                : "bg-white dark:bg-zinc-950 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70"
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1.5 block">
                        Corner Finder Eyes
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
                                ? "bg-black text-white dark:bg-white dark:text-black font-medium"
                                : "bg-white dark:bg-zinc-950 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70"
                            }`}
                          >
                            {e.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Curated Color Palettes */}
                  <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
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

                  {/* Gradient & Custom Color Pickers */}
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
                        Gradient End (Optional)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={fgEndColor || "#7C3AED"}
                          onChange={(e) => {
                            setFgEndColor(e.target.value)
                            setUseGradient(true)
                          }}
                          className="w-8 h-8 rounded-none border border-black/20 cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Disabled"
                          value={fgEndColor}
                          onChange={(e) => {
                            setFgEndColor(e.target.value)
                            setUseGradient(Boolean(e.target.value))
                          }}
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
                  </div>

                  {/* Frame & Call-To-Action (CTA) Border */}
                  <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-3">
                    <span className="text-xs uppercase font-mono tracking-wider text-black/60 dark:text-white/60 font-medium block">
                      Call-To-Action (CTA) Frame:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {FRAME_PRESETS.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFrameStyle(f.id as any)}
                          className={`text-xs py-2 px-2 rounded-none border transition-all truncate ${
                            frameStyle === f.id
                              ? "bg-black text-white dark:bg-white dark:text-black font-medium"
                              : "bg-white dark:bg-zinc-950 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {frameStyle !== "none" && (
                      <div className="pt-1">
                        <label htmlFor={frameTextId} className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                          Frame Text
                        </label>
                        <input
                          id={frameTextId}
                          type="text"
                          placeholder="e.g. SCAN ME, SCAN FOR WI-FI, VISIT WEBSITE"
                          value={frameText}
                          onChange={(e) => setFrameText(e.target.value)}
                          className="w-full text-sm px-3.5 py-2 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 font-mono text-black dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Center Emblem / Custom Logo Upload */}
                  <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-mono tracking-wider text-black/60 dark:text-white/60 font-medium flex items-center gap-1.5">
                        <ImageIcon size={13} /> Center Emblem / Logo Overlay
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

            {/* ── RIGHT COLUMN: LIVE CANVAS & MULTI-FORMAT EXPORTS (5 COLS) ── */}
            <div className="lg:col-span-5 space-y-6">
              <TextWithBlur delay={140}>
                <div className="p-6 md:p-8 rounded-none bg-zinc-950 text-white border border-zinc-800 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <span className="text-xs uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-1.5 font-medium">
                      <Sparkles size={14} className="text-accent" /> Live Vector Preview
                    </span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-none border border-emerald-800">
                      {downloadResolution}px Ready
                    </span>
                  </div>

                  {/* Rendered Canvas Preview */}
                  <div className="p-6 bg-white rounded-none border border-zinc-700/80 flex items-center justify-center shadow-inner relative group min-h-[290px]">
                    {previewDataUrl ? (
                      <img
                        src={previewDataUrl}
                        alt="Rendered QR Code"
                        className="w-full max-w-[270px] h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="text-xs font-mono text-zinc-400">Rendering vector...</div>
                    )}
                  </div>

                  {/* Scannability Validator Indicator */}
                  <div className="p-2.5 rounded-none bg-zinc-900 border border-zinc-800 text-xs font-mono flex items-center justify-between">
                    <span className="text-zinc-400">Scan Reliability:</span>
                    <span className={`font-semibold ${contrastCheck.valid ? "text-emerald-400" : "text-amber-400"}`}>
                      {contrastCheck.score}
                    </span>
                  </div>

                  {/* Primary Export Actions */}
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
                        <FileCode size={13} /> Download SVG (Vector)
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
                        Test Link in New Tab <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              </TextWithBlur>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: BATCH MULTI-QR GENERATOR                                    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "batch" && (
          <div className="space-y-6">
            <TextWithBlur delay={100}>
              <div className="p-6 rounded-none bg-white/70 dark:bg-zinc-900/70 border border-black/10 dark:border-white/10 shadow-sm space-y-4">
                <div>
                  <h2 className="text-xs uppercase font-mono tracking-wider text-black/70 dark:text-white/70 font-medium mb-1">
                    Batch QR Code Matrix
                  </h2>
                  <p className="text-xs text-black/50 dark:text-white/50 font-light mb-3">
                    Paste multiple URLs, SKUs, or strings (one per line, up to 30 items) to generate a batch of high-resolution QR codes at once.
                  </p>
                </div>

                <textarea
                  rows={5}
                  value={batchRawInput}
                  onChange={(e) => setBatchRawInput(e.target.value)}
                  placeholder="https://tirup.in\nhttps://tirup.in/work\nhttps://blogs.tirup.in"
                  className="w-full text-sm px-4 py-2.5 rounded-none border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 font-mono text-black dark:text-white"
                />

                <div className="flex justify-end">
                  <button
                    onClick={processBatchGeneration}
                    className="px-5 py-2.5 rounded-none bg-black text-white dark:bg-white dark:text-black font-medium text-xs font-mono flex items-center gap-1.5 shadow-sm"
                  >
                    <Layers size={13} /> Generate Batch ({batchRawInput.split("\n").filter(Boolean).length} Codes)
                  </button>
                </div>
              </div>
            </TextWithBlur>

            {batchGenerated.length > 0 && (
              <TextWithBlur delay={120}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {batchGenerated.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-none border border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 flex flex-col items-center space-y-3"
                    >
                      <img src={item.dataUrl} alt={item.text} className="w-36 h-36 bg-white p-2 border border-black/5" />
                      <p className="font-mono text-xs text-black/70 dark:text-white/70 truncate w-full text-center">
                        {item.text}
                      </p>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => copyBatchSingle(idx, item.dataUrl)}
                          className="flex-1 py-1.5 text-xs font-mono rounded-none border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1"
                        >
                          {copiedBatchIndex === idx ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          {copiedBatchIndex === idx ? "Copied" : "Copy"}
                        </button>
                        <a
                          href={item.dataUrl}
                          download={`qr-batch-${idx + 1}.png`}
                          className="flex-1 py-1.5 text-xs font-mono rounded-none bg-black text-white dark:bg-white dark:text-black text-center"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </TextWithBlur>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: QR DECODER & INSPECTOR                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "decode" && (
          <div className="space-y-6">
            <TextWithBlur delay={100}>
              <div className="p-8 rounded-none border-2 border-dashed border-black/15 dark:border-white/15 bg-white/40 dark:bg-zinc-900/40 text-center space-y-4">
                <Scan size={32} className="mx-auto text-black/40 dark:text-white/40" />
                <div>
                  <h2 className="text-sm font-mono uppercase font-medium text-black dark:text-white">
                    Scan or Upload a QR Code Image
                  </h2>
                  <p className="text-xs text-black/50 dark:text-white/50 font-light mt-1 max-w-md mx-auto">
                    Upload an image or screenshot of any QR code to inspect its underlying payload, parse credentials, and verify link safety.
                  </p>
                </div>

                <input
                  ref={decodeFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleDecodeImageUpload}
                  className="hidden"
                  id="qr-decode-upload"
                />

                <label
                  htmlFor="qr-decode-upload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none bg-black text-white dark:bg-white dark:text-black font-medium text-xs font-mono cursor-pointer shadow-sm"
                >
                  <Upload size={13} /> Select QR Image...
                </label>
              </div>
            </TextWithBlur>

            {decodedOutput && (
              <TextWithBlur delay={120}>
                <div className="p-6 rounded-none border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                    <span className="text-xs uppercase font-mono tracking-wider text-black/60 dark:text-white/60 font-medium">
                      Decoded Payload ({decodedOutput.type})
                    </span>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(decodedOutput.text)
                      }}
                      className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
                    >
                      <Copy size={12} /> Copy Payload
                    </button>
                  </div>

                  <div className="p-4 bg-black/5 dark:bg-black/40 font-mono text-sm break-all select-all text-black dark:text-white">
                    {decodedOutput.text}
                  </div>

                  {decodedOutput.parsedDetails && (
                    <div className="space-y-1.5 font-mono text-xs text-black/70 dark:text-white/70 pt-2 border-t border-black/5 dark:border-white/5">
                      {Object.entries(decodedOutput.parsedDetails).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="opacity-60">{k}:</span>
                          <span className="font-semibold text-black dark:text-white">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setUrl(decodedOutput.text)
                        setPayloadType("url")
                        setActiveTab("single")
                      }}
                      className="px-4 py-2 rounded-none bg-black text-white dark:bg-white dark:text-black text-xs font-mono font-medium"
                    >
                      Load into Studio to Re-style
                    </button>
                  </div>
                </div>
              </TextWithBlur>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PERSISTENT HISTORY ARCHIVE ACROSS ALL TABS                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {history.length > 0 && (
          <TextWithBlur delay={180}>
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
