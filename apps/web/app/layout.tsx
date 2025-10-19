import type { Metadata } from "next"
import LiveRegion from "@/components/a11y/LiveRegion"
import "./globals.css"

export const metadata: Metadata = {
  title: "TERO Fiscal",
  description: "TERO Fiscal UI",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <a href="#main" className="skip-link">Skip to main content</a>
        <LiveRegion />
        <main id="main">{children}</main>
      </body>
    </html>
  )
}
