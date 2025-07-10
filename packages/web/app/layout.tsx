import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Effect Deck',
  description: 'A strategic card game built with Effect-TS',
  keywords: ['card game', 'strategy', 'effect-ts', 'typescript'],
  authors: [{ name: 'Effect Deck Team' }],
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-game-bg text-foreground`}>
        <div className="min-h-screen bg-game-grid bg-game-grid">
          {children}
        </div>
      </body>
    </html>
  )
}