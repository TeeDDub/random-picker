import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '🎲 Random Picker - 랜덤 선택기',
  description: 'Next.js + TypeScript로 구현된 강력한 랜덤 선택 애플리케이션. 직접 입력, Google Sheets 불러오기, 룰렛 애니메이션으로 공정한 랜덤 선택을 경험하세요.',
  keywords: ['랜덤 선택기', 'random picker', '룰렛', '추첨', 'Google Sheets', 'Next.js', '랜덤 뽑기', '랜덤 추첨'],
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
    title: '🎲 Random Picker - 랜덤 선택기',
    description: 'Next.js + TypeScript로 구현된 강력한 랜덤 선택 애플리케이션. 직접 입력, Google Sheets 불러오기, 룰렛 애니메이션으로 공정한 랜덤 선택을 경험하세요.',
    siteName: 'Random Picker',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Random Picker - 랜덤 선택기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '🎲 Random Picker - 랜덤 선택기',
    description: 'Next.js + TypeScript로 구현된 강력한 랜덤 선택 애플리케이션. 직접 입력, Google Sheets 불러오기, 룰렛 애니메이션으로 공정한 랜덤 선택을 경험하세요.',
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
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

