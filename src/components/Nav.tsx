'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const DO_THE_WORK = [
  { href: '/tasks', label: 'Task Tracker' },
  { href: '/people', label: 'People' },
  { href: '/milestones', label: 'Milestones' },
]

const REFERENCE = [
  { href: '/reference', label: 'Reference Guide' },
  { href: '/archive', label: 'Archive' },
]

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const active = pathname.startsWith(href)
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-[#DB5863] text-white font-medium'
          : 'text-[#112536]/70 dark:text-[#F2C4CA]/70 hover:bg-[#F2C4CA]/50 hover:text-[#DB5863]'
      }`}
    >
      {label}
    </Link>
  )
}

export default function Nav() {
  return (
    <aside className="w-[220px] shrink-0 h-screen sticky top-0 border-r border-[#F2C4CA] bg-white dark:bg-[#0c1a24] flex flex-col overflow-y-auto">
      {/* Logo */}
      <Link href="/" className="block p-5 border-b border-[#F2C4CA] hover:bg-[#F2C4CA]/20 transition-colors">
        <p className="text-[10px] uppercase tracking-widest text-[#DB5863]/60 font-semibold">Harvard WiCS</p>
        <p className="font-bold text-[#DB5863] text-xl leading-tight mt-0.5">WECode 2027</p>
        <p className="text-xs text-[#112536]/40 dark:text-[#F2C4CA]/40 mt-1 italic">Against the Current</p>
      </Link>

      {/* Navigation */}
      <div className="flex-1 p-3 space-y-5 mt-1">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#112536]/35 dark:text-[#F2C4CA]/35 font-semibold px-3 mb-1">
            Do the work
          </p>
          <div className="space-y-0.5">
            {DO_THE_WORK.map(l => <NavLink key={l.href} {...l} />)}
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#112536]/35 dark:text-[#F2C4CA]/35 font-semibold px-3 mb-1">
            Reference
          </p>
          <div className="space-y-0.5">
            {REFERENCE.map(l => <NavLink key={l.href} {...l} />)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#F2C4CA]">
        <p className="text-[11px] text-[#112536]/30 dark:text-[#F2C4CA]/30 px-3">Internal use only</p>
      </div>
    </aside>
  )
}
