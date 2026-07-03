import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: '🎲 Random Picker - 랜덤 뽑기',
  description: '랜덤 뽑기. 오늘의 결정, 팀 나누기 대신해 드립니다.',
  keywords: ['랜덤 뽑기', 'random picker', '룰렛', '추첨', 'Google Sheets', 'Next.js', '랜덤 추첨'],
  authors: [{ name: 'Minhyeok' }],
  creator: 'Minhyeok',
  publisher: 'Minhyeok',
  metadataBase: new URL('https://random.minhyeok.me'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://random.minhyeok.me',
    title: '🎲 Random Picker - 랜덤 뽑기',
    description: '랜덤 뽑기. 오늘의 결정, 팀 나누기 대신해 드립니다.',
    siteName: 'Random Picker',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Random Picker - 랜덤 뽑기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '🎲 Random Picker - 랜덤 뽑기',
    description: '랜덤 뽑기. 오늘의 결정, 팀 나누기 대신해 드립니다.',
    images: ['/opengraph-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

