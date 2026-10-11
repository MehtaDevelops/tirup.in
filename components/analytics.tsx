import Script from "next/script"

export default function GoogleAnalytics() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-N37XXZ2B"
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-BKS7VBCPH5"

  return (
    <>
      <Script id="analytics-queue" strategy="beforeInteractive">
        {`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};`}
      </Script>
      {/* Tracking starts only after the page has loaded; queued dataLayer events are retained. */}
      <Script id="google-tag-manager" strategy="lazyOnload">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');`}
      </Script>

      {/* Google Analytics (gtag.js) */}
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');`}
      </Script>
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
