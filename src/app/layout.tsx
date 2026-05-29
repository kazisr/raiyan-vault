import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { CHILD_NAME } from '@/constants/child'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: `${CHILD_NAME}'s Vault`,
    template: `%s | ${CHILD_NAME}'s Vault`,
  },
  description: 'A private family memory vault and digital archive.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#5B7FA6',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-[var(--background)] antialiased p-4 sm:p-6">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
