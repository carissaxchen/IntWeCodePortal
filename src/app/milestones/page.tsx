import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const MONTH_ORDER = [
  'Feb.', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December', 'January',
]

export default async function MilestonesPage() {
  const supabase = await createClient()
  const { data: milestones, error } = await supabase
    .from('milestones')
    .select('*')

  if (error) return <p className="text-red-600">Failed to load milestones: {error.message}</p>

  // Group by month
  type Row = { id: string; month: string; general_label?: string; team_label?: string; team?: string }
  const rows = milestones as Row[]
  const byMonth: Record<string, Row[]> = {}
  for (const row of rows) {
    if (!byMonth[row.month]) byMonth[row.month] = []
    byMonth[row.month].push(row)
  }
  const orderedMonths = MONTH_ORDER.filter((m) => byMonth[m])

  return (
    <div>
      <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-200 mb-6">Milestones</h1>
      <p className="text-sm text-gray-500 mb-6">Public-facing milestones by month for WECode 2027.</p>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-purple-50 dark:bg-purple-950/40">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-purple-800 dark:text-purple-300 w-28">Month</th>
              <th className="px-4 py-3 text-left font-semibold text-purple-800 dark:text-purple-300">General</th>
              <th className="px-4 py-3 text-left font-semibold text-purple-800 dark:text-purple-300">Team Milestone</th>
              <th className="px-4 py-3 text-left font-semibold text-purple-800 dark:text-purple-300">Team</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900/20">
            {orderedMonths.map((month) => {
              const monthRows = byMonth[month]
              // Deduplicate general_label per month (show once)
              const generalLabel = monthRows.find((r) => r.general_label)?.general_label
              return monthRows.map((row, i) => (
                <tr key={row.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/20">
                  {i === 0 && (
                    <td
                      className="px-4 py-3 font-medium text-purple-700 dark:text-purple-400 align-top"
                      rowSpan={monthRows.length}
                    >
                      {month}
                    </td>
                  )}
                  {i === 0 && (
                    <td
                      className="px-4 py-3 text-gray-600 dark:text-gray-400 align-top"
                      rowSpan={monthRows.length}
                    >
                      {generalLabel ?? '—'}
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {row.team_label ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {row.team ?? '—'}
                  </td>
                </tr>
              ))
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
