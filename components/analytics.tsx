import Script from "next/script"
import DeferredAnalytics from "@/components/deferred-analytics"

export default function GoogleAnalytics() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-N37XXZ2B"
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-BKS7VBCPH5"

  return (
    <>
      {/* Tiny queue so events fired early are kept until the tags start. */}
      <Script id="analytics-queue" strategy="beforeInteractive">
        {`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
        try{if(navigator&&navigator.doNotTrack==='1'){window.__DNT='1';}}catch(e){}`}
      </Script>
      {/* Tag Manager + Google Analytics start on the visitor's first interaction
          (or after 15s), not during page load. Queued dataLayer events are retained. */}
      <DeferredAnalytics gtmId={gtmId} gaId={gaId} />
    </>
  )
}

export function GoogleTagManagerNoscript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-N37XXZ2B"
  return (
    <noscript
      dangerouslySetInnerHTML={{
        __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
      }}
    />
  )
}
