import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'WECode 2027 Planning Hub',
  description: 'Internal planning hub for WECode 2027 board members',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full flex bg-[#FAFAFA] dark:bg-[#0c1a24]">
        <Nav />
        <main className="flex-1 min-h-screen overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
