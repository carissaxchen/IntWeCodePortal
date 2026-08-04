import { createClient } from '@/lib/supabase-server'
import { Task } from '@/types'
import TasksClient from './TasksClient'

export const dynamic = 'force-dynamic'

const MONTH_LABELS: Record<string, string> = {
  '2026-04': 'April 2026 — Co-Chair Transition',
  '2026-05': 'May 2026 — Director Recruiting + Vision Foundation',
  '2026-06': 'June 2026 — Vision + Definition',
  '2026-07': 'July 2026 — Building Infrastructure',
  '2026-08': 'August 2026 — Back to School',
  '2026-09': 'September 2026 — AD Recruitment',
  '2026-10': 'October 2026 — Board Retreat + Momentum',
  '2026-11': 'November 2026',
  '2026-12': 'December 2026',
  '2027-01': 'January 2027',
  '2027-03': 'March 2027',
}

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*, owner:people(*)')
    .order('month_bucket', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    return <p className="text-red-600">Failed to load tasks: {error.message}</p>
  }

  return <TasksClient initialTasks={tasks as Task[]} monthLabels={MONTH_LABELS} />
}
