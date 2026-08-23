import type { Metadata } from "next"
import Header from "@/components/header"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for tirup.in — what data is collected, how it is used, and how to contact Tirup Mehta with data questions.",
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy" },
  robots: { index: false, follow: false },
}

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <Header />

      <section className="section px-6 md:px-20 pb-20 max-w-4xl mx-auto w-full">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif italic font-medium tracking-tight leading-tight text-black dark:text-white mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-black/40 dark:text-white/40 mb-10">
          Last updated: August 2025
        </p>

        <div className="space-y-10 text-base font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">Overview</h2>
            <p>
              This policy covers the personal portfolio site at tirup.in and its subdomains
              operated by Tirup Mehta. It describes what data is collected when you visit,
              how that data is used, and the choices available to you. This site is a
              personal portfolio and does not sell or share personal data with third parties
              for advertising purposes.
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">Data collected automatically</h2>
            <p>
              When you visit tirup.in, the following data is collected automatically through
              third-party analytics services:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>
                <strong>Vercel Analytics</strong> — page view counts, device type, browser,
                operating system, and country-level geolocation. Vercel does not collect
                personally identifiable information. Data is processed by Vercel Inc. under
                their{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Google Analytics / Google Tag Manager</strong> — page views, session
                duration, traffic source, and device type. Google Analytics uses cookies to
                distinguish visitors. IP addresses are anonymised. Data is processed by
                Google LLC under their{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Vercel Speed Insights</strong> — Core Web Vitals and performance
                metrics aggregated at the page level. No user identifiers are stored.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">Cookies</h2>
            <p>
              This site uses cookies set by Google Analytics to distinguish returning visitors
              and measure session duration. A theme preference (light/dark mode) is stored in
              your browser&apos;s localStorage — this data never leaves your device.
              No first-party session cookies, login cookies, or tracking pixels beyond the
              analytics services listed above are set.
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">Data not collected</h2>
            <p>This site does not collect:</p>
            <ul className="mt-3 space-y-1 list-disc list-inside">
              <li>Account registration data — there is no user authentication on this site.</li>
              <li>Form submissions or contact form data — contact happens via external platforms.</li>
              <li>Payment or billing information.</li>
              <li>Precise geolocation beyond country level.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">Third-party links</h2>
            <p>
              This site links to external services (GitHub, LinkedIn, npm, Peerlist, etc.).
              Those services operate under their own privacy policies. Tirup Mehta is not
              responsible for their data practices.
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">Data retention and deletion</h2>
            <p>
              Analytics data is retained according to the default policies of Vercel and
              Google Analytics (typically 14 months for Google Analytics event data).
              As this site does not collect first-party personal data, there is no
              first-party data to delete.
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">Your rights</h2>
            <p>
              If you are located in the European Economic Area or the United Kingdom you
              have rights under GDPR/UK GDPR to access, rectify, or erase personal data.
              For data held by Google Analytics, you can use Google&apos;s{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors"
              >
                opt-out browser add-on
              </a>
              . To exercise any rights regarding data processed on behalf of this site,
              contact Tirup via the{" "}
              <a href="/contact" className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors">
                contact page
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">Changes to this policy</h2>
            <p>
              This policy may be updated to reflect changes in analytics tooling or
              applicable law. Material changes will be noted by updating the date at
              the top of this page. Continued use of the site after a policy update
              constitutes acceptance of the revised terms.
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">Contact</h2>
            <p>
              Questions or requests relating to this privacy policy should be directed
              to Tirup Mehta via the channels listed on the{" "}
              <a href="/contact" className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors">
                contact page
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <footer className="py-6 px-6 text-center border-t border-black/10">
        <p className="text-black/50 dark:text-white/50" suppressHydrationWarning>
          © {currentYear} Tirup Mehta. All rights reserved.
        </p>
      </footer>
    </main>
  )
}
