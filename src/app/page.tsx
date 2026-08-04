import Link from 'next/link'

const cards = [
  {
    href: '/tasks',
    title: 'Task Tracker',
    desc: 'Month-by-month checklist with live progress, overdue highlights, and subteam filters.',
    icon: '✅',
  },
  {
    href: '/people',
    title: 'People',
    desc: 'Directory of all board members — co-chairs, directors, and associate directors.',
    icon: '👥',
  },
  {
    href: '/milestones',
    title: 'Milestones',
    desc: 'Public-facing milestones and key dates by month.',
    icon: '🗓️',
  },
  {
    href: '/reference',
    title: 'Reference',
    desc: 'The Vision, The Engine — subteams, positions, ecosystem, lifecycle, and expectations.',
    icon: '📖',
  },
  {
    href: '/archive',
    title: 'Archive',
    desc: 'WECode history 2014–2026 and past board structure.',
    icon: '🗃️',
  },
]

export default function Home() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#DB5863]">
          WECode 2027 Planning Hub
        </h1>
        <p className="mt-2 text-[#E37D8A] text-lg">
          Theme: <strong>Against the Current</strong> — The future of tech is built upstream.
        </p>
        <p className="mt-1 text-sm text-[#112536]/50 dark:text-[#F2C4CA]/50">
          Internal use only · Harvard WiCS
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ href, title, desc, icon }) => (
          <Link
            key={href}
            href={href}
            className="group block rounded-xl border border-[#F2C4CA] bg-white dark:bg-[#112536]/20 p-6 hover:border-[#DB5863] hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-3">{icon}</div>
            <h2 className="font-semibold text-[#112536] dark:text-[#F2C4CA] text-lg group-hover:text-[#DB5863] transition-colors">
              {title}
            </h2>
            <p className="mt-1 text-sm text-[#112536]/60 dark:text-[#F2C4CA]/60">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
