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
        <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-200">
          WECode 2027 Planning Hub
        </h1>
        <p className="mt-2 text-purple-700 dark:text-purple-400 text-lg">
          Theme: <strong>Against the Current</strong> — The future of tech is built upstream.
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Internal use only · Harvard WiCS
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ href, title, desc, icon }) => (
          <Link
            key={href}
            href={href}
            className="group block rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/20 p-6 hover:border-purple-500 hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-3">{icon}</div>
            <h2 className="font-semibold text-purple-900 dark:text-purple-200 text-lg group-hover:text-purple-600">
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
