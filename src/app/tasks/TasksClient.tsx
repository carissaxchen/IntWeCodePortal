'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Task, Subteam, TaskStatus } from '@/types'

const SUBTEAMS: Subteam[] = [
  'Engagement', 'Engineering', 'Finance', 'Logistics',
  'Marketing & Strategy', 'Programming', 'Co-Chairs', 'All-Board',
]

const TAG_COLORS: Record<string, string> = {
  Engagement:             'bg-teal-100 text-teal-800',
  Engineering:            'bg-blue-100 text-blue-800',
  Finance:                'bg-green-100 text-green-800',
  Logistics:              'bg-orange-100 text-orange-800',
  'Marketing & Strategy': 'bg-pink-100 text-pink-800',
  Programming:            'bg-indigo-100 text-indigo-800',
  'Co-Chairs':            'bg-purple-100 text-purple-800',
  'All-Board':            'bg-slate-100 text-slate-800',
}

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'done') return false
  return new Date(task.due_date) < new Date()
}

function isDueSoon(task: Task): boolean {
  if (!task.due_date || task.status === 'done') return false
  const diff = new Date(task.due_date).getTime() - Date.now()
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-purple-600 h-2 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">
        {done} / {total} done
      </span>
    </div>
  )
}

export default function TasksClient({
  initialTasks,
  monthLabels,
}: {
  initialTasks: Task[]
  monthLabels: Record<string, string>
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filter, setFilter] = useState<Subteam | 'All'>('All')
  const [updating, setUpdating] = useState<Set<string>>(new Set())
  const supabase = createClient()

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tasks' },
        (payload) => {
          setTasks((prev) =>
            prev.map((t) => (t.id === payload.new.id ? { ...t, ...payload.new } as Task : t))
          )
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const toggleStatus = useCallback(async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'done' ? 'not started' : 'done'
    setUpdating((s) => new Set(s).add(task.id))
    // Optimistic update
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: newStatus } : t))
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    setUpdating((s) => { const n = new Set(s); n.delete(task.id); return n })
  }, [supabase])

  const filtered = filter === 'All'
    ? tasks
    : tasks.filter((t) => t.subteam_tags.includes(filter as Subteam))

  // Group by month
  const months = [...new Set(filtered.map((t) => t.month_bucket))].sort()

  // Overall stats
  const totalAll = filtered.length
  const doneAll = filtered.filter((t) => t.status === 'done').length

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-200">Task Tracker</h1>
          <div className="mt-2 max-w-xs">
            <ProgressBar done={doneAll} total={totalAll} />
          </div>
        </div>

        {/* Subteam filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('All')}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              filter === 'All'
                ? 'bg-purple-700 text-white border-purple-700'
                : 'border-gray-300 text-gray-600 hover:border-purple-400'
            }`}
          >
            All
          </button>
          {SUBTEAMS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                filter === s
                  ? 'bg-purple-700 text-white border-purple-700'
                  : 'border-gray-300 text-gray-600 hover:border-purple-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {months.length === 0 && (
        <p className="text-gray-500">No tasks match this filter.</p>
      )}

      <div className="space-y-8">
        {months.map((month) => {
          const monthTasks = filtered.filter((t) => t.month_bucket === month)
          const monthDone = monthTasks.filter((t) => t.status === 'done').length
          return (
            <section key={month}>
              <div className="flex items-center gap-4 mb-3">
                <h2 className="text-lg font-semibold text-purple-800 dark:text-purple-300">
                  {monthLabels[month] ?? month}
                </h2>
                <div className="flex-1 max-w-xs">
                  <ProgressBar done={monthDone} total={monthTasks.length} />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden bg-white dark:bg-gray-900/30">
                {monthTasks.map((task) => {
                  const overdue = isOverdue(task)
                  const soon = isDueSoon(task)
                  const done = task.status === 'done'
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                        overdue ? 'bg-red-50 dark:bg-red-950/20' : ''
                      }`}
                    >
                      <button
                        onClick={() => toggleStatus(task)}
                        disabled={updating.has(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          done
                            ? 'bg-purple-600 border-purple-600'
                            : overdue
                            ? 'border-red-400 hover:border-red-600'
                            : 'border-gray-300 hover:border-purple-400'
                        } ${updating.has(task.id) ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                        aria-label={done ? 'Mark incomplete' : 'Mark done'}
                      >
                        {done && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${done ? 'line-through text-gray-400' : overdue ? 'text-red-700 dark:text-red-400 font-medium' : 'text-gray-800 dark:text-gray-200'}`}>
                          {task.title}
                        </p>

                        <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                          {/* Subteam tags */}
                          {task.subteam_tags.map((tag) => (
                            <span
                              key={tag}
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] ?? 'bg-gray-100 text-gray-700'}`}
                            >
                              {tag}
                            </span>
                          ))}

                          {/* Due date */}
                          {task.due_date && (
                            <span className={`text-xs ${overdue ? 'text-red-600 font-semibold' : soon ? 'text-amber-600' : 'text-gray-400'}`}>
                              {overdue ? '⚠ overdue · ' : soon ? '⏰ due soon · ' : ''}
                              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}

                          {/* Owner */}
                          {task.owner && (
                            <span className="text-xs text-gray-400">· {task.owner.name}</span>
                          )}

                          {/* Status badge for in-progress */}
                          {task.status === 'in progress' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                              in progress
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
