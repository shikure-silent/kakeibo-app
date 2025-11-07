import './globals.css'
import { PropsWithChildren } from 'react'

export const metadata = {
  title: '家計簿アプリ',
  description: '都道府県別 家計簿 App (TypeScript)',
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}
