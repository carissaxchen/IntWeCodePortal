'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home' },
  { href: '/tasks', label: 'Task Tracker' },
  { href: '/people', label: 'People' },
  { href: '/milestones', label: 'Milestones' },
  { href: '/reference', label: 'Reference' },
  { href: '/archive', label: 'Archive' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <header className="border-b border-purple-200 bg-white/80 dark:bg-purple-950/30 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 h-14">
        <Link href="/" className="font-bold text-purple-800 dark:text-purple-300 mr-4 text-lg shrink-0">
          WECode 2027
        </Link>
        <nav className="flex gap-1 flex-wrap">
          {links.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  active
                    ? 'bg-purple-700 text-white'
                    : 'text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
