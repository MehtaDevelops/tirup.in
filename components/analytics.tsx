import Script from "next/script"

export default function GoogleAnalytics() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-N37XXZ2B"
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-BKS7VBCPH5"

  return (
    <>
      {/* Suppress unhandled rejections and disable GA telemetry on localhost */}
      <Script id="analytics-error-guard" strategy="afterInteractive">
        {`(function(){
          if (typeof window === 'undefined') return;

          // Disable GA data sending natively on localhost to prevent extension fetch errors
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window['ga-disable-${gaId}'] = true;
          }

          try {
            var origFetch = window.fetch;
            if (typeof origFetch === 'function' && !origFetch.__gtam_patched) {
              window.fetch = function(input, init) {
                var url = typeof input === 'string' ? input : (input && input.url) || '';
                var isAnalytics = url.indexOf('google-analytics') !== -1 || url.indexOf('googletagmanager') !== -1 || url.indexOf('/g/collect') !== -1;
                var isLocalOrExt = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || (origFetch.toString && origFetch.toString().indexOf('chrome-extension') !== -1);
                
                if (isAnalytics && isLocalOrExt) {
                  return Promise.resolve(new Response(JSON.stringify({ status: 'ok' }), { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/json' } }));
                }

                if (isAnalytics) {
                  try {
                    return origFetch.apply(this, arguments).catch(function() {
                      return new Response(JSON.stringify({ status: 'ok' }), { status: 200, statusText: 'OK' });
                    });
                  } catch(err) {
                    return Promise.resolve(new Response(JSON.stringify({ status: 'ok' }), { status: 200, statusText: 'OK' }));
                  }
                }
                return origFetch.apply(this, arguments);
              };
              window.fetch.__gtam_patched = true;
            }
          } catch(e){}

          window.addEventListener('unhandledrejection', function(e) {
            if (e && e.reason) {
              var msg = (e.reason && e.reason.message) ? e.reason.message : String(e.reason);
              var stack = (e.reason && e.reason.stack) ? e.reason.stack : '';
              if (msg.indexOf('Failed to fetch') !== -1 || stack.indexOf('chrome-extension:') !== -1 || stack.indexOf('googletagmanager') !== -1 || stack.indexOf('frame_ant') !== -1) {
                e.preventDefault();
              }
            }
          });
        })();`}
      </Script>

      {/* Google Tag Manager */}
      <Script id="google-tag-manager" strategy="afterInteractive">
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
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
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
