import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Random Picker - 랜덤 선택기',
  description: 'Google Sheets와 직접 입력을 활용한 랜덤 선택 애플리케이션',
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

