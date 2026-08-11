"use client"

import React, { useEffect, useState } from "react"
import QRCode from "qrcode"
import { Download, X, Copy, Check, QrCode as QrIcon } from "lucide-react"

interface QrCodeModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
  title?: string
}

export default function QrCodeModal({ isOpen, onClose, url, title }: QrCodeModalProps) {
  const [dataUrl, setDataUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen || !url) return

    QRCode.toDataURL(
      url,
      {
        width: 320,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      },
      (err, data) => {
        if (!err && data) {
          setDataUrl(data)
        }
      }
    )
  }, [isOpen, url])

  if (!isOpen) return null

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm p-6 bg-white dark:bg-zinc-950 rounded-none border border-black/10 dark:border-white/10 shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm uppercase font-mono tracking-wider text-black/60 dark:text-white/60 flex items-center gap-1.5 font-medium">
            <QrIcon size={15} className="text-accent" /> Campaign QR Code
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-none text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {title && (
          <p className="text-sm text-black/70 dark:text-white/70 font-light mb-3 truncate">
            {title}
          </p>
        )}

        {/* QR Image Display */}
        <div className="p-3 bg-white rounded-none border border-black/10 flex items-center justify-center mb-3">
          {dataUrl ? (
            <img src={dataUrl} alt="Campaign QR Code" className="w-56 h-56 object-contain" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-sm text-zinc-400 font-mono">
              Generating...
            </div>
          )}
        </div>

        {/* URL Display */}
        <div className="p-2.5 rounded-none bg-black/5 dark:bg-white/5 font-mono text-sm text-black/80 dark:text-white/80 break-all select-all mb-4 max-h-20 overflow-y-auto border border-black/5 dark:border-white/5 leading-relaxed">
          {url}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyUrl}
            className="flex-1 py-2 px-3 rounded-none border border-black/10 dark:border-white/10 text-sm font-medium text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy URL"}
          </button>

          {dataUrl && (
            <a
              href={dataUrl}
              download="campaign-qr-code.png"
              className="flex-1 py-2 px-3 rounded-none bg-black text-white dark:bg-white dark:text-black font-medium text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download size={14} /> Download PNG
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
