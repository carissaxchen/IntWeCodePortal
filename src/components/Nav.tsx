'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Subteam } from '@/types'

const SUBTEAMS: Subteam[] = [
  'Engagement', 'Engineering', 'Finance', 'Logistics',
  'Marketing & Strategy', 'Programming', 'Co-Chairs', 'All-Board',
]

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

function MyTeamSelector() {
  const [myTeam, setMyTeam] = useState<string>('')

  useEffect(() => {
    setMyTeam(localStorage.getItem('wecode-my-team') ?? '')
  }, [])

  const handleChange = (val: string) => {
    setMyTeam(val)
    localStorage.setItem('wecode-my-team', val)
    window.dispatchEvent(new StorageEvent('storage', { key: 'wecode-my-team', newValue: val }))
  }

  return (
    <div className="px-3 space-y-1.5">
      <p className="text-[10px] uppercase tracking-widest text-[#112536]/35 dark:text-[#F2C4CA]/35 font-semibold">
        My team
      </p>
      <select
        value={myTeam}
        onChange={e => handleChange(e.target.value)}
        className="w-full text-xs rounded-lg border border-[#F2C4CA] bg-white dark:bg-[#0c1a24] text-[#112536] dark:text-[#F2C4CA] px-2 py-1.5 focus:outline-none focus:border-[#DB5863] transition-colors"
      >
        <option value="">— All teams —</option>
        {SUBTEAMS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      {myTeam && (
        <p className="text-[10px] text-[#DB5863]/70">
          Task Tracker will filter to {myTeam}
        </p>
      )}
    </div>
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

      {/* My Team selector */}
      <div className="p-3 border-t border-[#F2C4CA] space-y-3">
        <MyTeamSelector />
        <p className="text-[11px] text-[#112536]/30 dark:text-[#F2C4CA]/30 px-3">Internal use only</p>
      </div>
    </aside>
  )
}
