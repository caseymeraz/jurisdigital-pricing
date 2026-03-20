import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Juris Digital - Service Recommendation Tool',
  description: 'Find the right legal marketing package for your firm',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-jd-light">
        {children}
      </body>
    </html>
  )
}
