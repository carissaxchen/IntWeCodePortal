import { createClient } from '@/lib/supabase-server'
import { Person, Subteam } from '@/types'

export const dynamic = 'force-dynamic'

const SUBTEAM_ORDER: Subteam[] = [
  'Co-Chairs', 'Engagement', 'Engineering', 'Finance',
  'Logistics', 'Marketing & Strategy', 'Programming',
]

const TAG_COLORS: Record<string, string> = {
  'co-chair':           'bg-purple-100 text-purple-800',
  'director':           'bg-indigo-100 text-indigo-800',
  'associate director': 'bg-blue-100 text-blue-800',
}

export default async function PeoplePage() {
  const supabase = await createClient()
  const { data: people, error } = await supabase
    .from('people')
    .select('*')
    .order('name', { ascending: true })

  if (error) return <p className="text-red-600">Failed to load people: {error.message}</p>

  const byTeam = SUBTEAM_ORDER.reduce<Record<string, Person[]>>((acc, team) => {
    acc[team] = (people as Person[]).filter((p) => p.subteam === team)
    return acc
  }, {})

  return (
    <div>
      <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-200 mb-6">
        Board Directory
      </h1>
      <div className="space-y-8">
        {SUBTEAM_ORDER.map((team) => {
          const members = byTeam[team]
          if (!members?.length) return null
          return (
            <section key={team}>
              <h2 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-3">
                {team}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map((person) => (
                  <div
                    key={person.id}
                    className={`rounded-xl border p-4 bg-white dark:bg-gray-900/20 ${
                      person.to_confirm
                        ? 'border-amber-300 dark:border-amber-700'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{person.name}</p>
                      {person.to_confirm && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0">
                          to confirm
                        </span>
                      )}
                    </div>
                    <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[person.role] ?? 'bg-gray-100 text-gray-700'}`}>
                      {person.role}
                    </span>
                    <div className="mt-2 space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {person.email && <p><a href={`mailto:${person.email}`} className="hover:text-purple-600">{person.email}</a></p>}
                      {person.phone && <p>{person.phone}</p>}
                      {person.location && <p>{person.location}</p>}
                      {person.linkedin && (
                        <p>
                          <a href={person.linkedin} target="_blank" rel="noreferrer" className="hover:text-purple-600">
                            LinkedIn ↗
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
      <p className="mt-8 text-xs text-gray-400">
        Add new members by inserting rows in the people table in Supabase — no code changes needed.
      </p>
    </div>
  )
}
