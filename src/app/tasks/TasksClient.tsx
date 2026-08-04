'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Task, Person, Subteam, TaskStatus } from '@/types'
import TaskModal, { TaskSaveData } from './TaskModal'

const SUBTEAMS: Subteam[] = [
  'Engagement', 'Engineering', 'Finance', 'Logistics',
  'Marketing & Strategy', 'Programming', 'Co-Chairs', 'All-Board',
]

const TAG_COLORS: Record<string, string> = {
  Engagement:             'bg-[#F2C4CA] text-[#112536]',
  Engineering:            'bg-[#112536] text-white',
  Finance:                'bg-[#DB5863] text-white',
  Logistics:              'bg-[#E37D8A] text-white',
  'Marketing & Strategy': 'bg-[#F2C4CA] text-[#DB5863] font-semibold',
  Programming:            'bg-[#DB5863]/15 text-[#DB5863]',
  'Co-Chairs':            'bg-[#112536]/10 text-[#112536]',
  'All-Board':            'bg-gray-100 text-[#112536]',
}

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'done') return false
  return new Date(task.due_date + 'T23:59:59') < new Date()
}

function isDueSoon(task: Task): boolean {
  if (!task.due_date || task.status === 'done') return false
  const diff = new Date(task.due_date + 'T23:59:59').getTime() - Date.now()
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000
}

export default function TasksClient({
  initialTasks,
  initialPeople,
  monthLabels,
}: {
  initialTasks: Task[]
  initialPeople: Person[]
  monthLabels: Record<string, string>
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filter, setFilter] = useState<Subteam | 'All'>('All')
  const [updating, setUpdating] = useState<Set<string>>(new Set())
  const [modal, setModal] = useState<{ open: boolean; task: Task | null; defaultMonth?: string }>({
    open: false, task: null,
  })
  const supabase = createClient()

  // Realtime: UPDATE and DELETE from other users
  useEffect(() => {
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, payload => {
        setTasks(prev => prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new } as Task : t))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks' }, payload => {
        setTasks(prev => prev.filter(t => t.id !== (payload.old as Task).id))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const toggleStatus = useCallback(async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'done' ? 'not started' : 'done'
    setUpdating(s => new Set(s).add(task.id))
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    setUpdating(s => { const n = new Set(s); n.delete(task.id); return n })
  }, [supabase])

  const handleSave = useCallback(async (data: TaskSaveData) => {
    if (data.id) {
      const { data: updated } = await supabase
        .from('tasks')
        .update({
          title: data.title,
          month_bucket: data.month_bucket,
          subteam_tags: data.subteam_tags,
          owner_id: data.owner_id ?? null,
          due_date: data.due_date ?? null,
          status: data.status,
        })
        .eq('id', data.id)
        .select('*, owner:people(*)')
        .single()
      if (updated) setTasks(prev => prev.map(t => t.id === data.id ? updated as Task : t))
    } else {
      const { data: newTask } = await supabase
        .from('tasks')
        .insert({
          title: data.title,
          month_bucket: data.month_bucket,
          subteam_tags: data.subteam_tags,
          owner_id: data.owner_id ?? null,
          due_date: data.due_date ?? null,
          status: data.status,
        })
        .select('*, owner:people(*)')
        .single()
      if (newTask) setTasks(prev => [...prev, newTask as Task])
    }
  }, [supabase])

  const handleDelete = useCallback(async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
    setModal({ open: false, task: null })
  }, [supabase])

  const filtered = filter === 'All'
    ? tasks
    : tasks.filter(t => t.subteam_tags.includes(filter as Subteam))

  const months = [...new Set(filtered.map(t => t.month_bucket))].sort()

  // Global stats
  const total = filtered.length
  const done = filtered.filter(t => t.status === 'done').length
  const overdue = filtered.filter(t => isOverdue(t)).length
  const dueSoon = filtered.filter(t => isDueSoon(t)).length
  const inProgress = filtered.filter(t => t.status === 'in progress').length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#DB5863]">Task Tracker</h1>
          <p className="text-xs text-[#112536]/40 mt-0.5">WECode 2027 · Against the Current</p>
        </div>
        <button
          onClick={() => setModal({ open: true, task: null })}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#DB5863] text-white rounded-lg text-sm font-medium hover:bg-[#E37D8A] transition-colors shadow-sm"
        >
          <span className="text-base leading-none">+</span> Add task
        </button>
      </div>

      {/* ── Progress dashboard ── */}
      <div className="rounded-xl border border-[#F2C4CA] bg-white dark:bg-[#112536]/10 p-5 mb-6">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-3xl font-bold text-[#112536] dark:text-[#F2C4CA]">{done}</span>
            <span className="text-base text-[#112536]/40 dark:text-[#F2C4CA]/40 ml-1">of {total} done</span>
          </div>
          <span className="text-2xl font-bold text-[#DB5863]">{pct}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-[#F2C4CA] rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[#DB5863] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
          <span className={`flex items-center gap-1.5 ${overdue > 0 ? 'text-red-600 font-semibold' : 'text-[#112536]/35'}`}>
            <span className={`w-2 h-2 rounded-full ${overdue > 0 ? 'bg-red-500' : 'bg-[#112536]/20'}`} />
            {overdue} overdue
          </span>
          <span className={`flex items-center gap-1.5 ${dueSoon > 0 ? 'text-amber-600' : 'text-[#112536]/35'}`}>
            <span className={`w-2 h-2 rounded-full ${dueSoon > 0 ? 'bg-amber-400' : 'bg-[#112536]/20'}`} />
            {dueSoon} due soon
          </span>
          <span className="flex items-center gap-1.5 text-[#112536]/35">
            <span className="w-2 h-2 rounded-full bg-[#E37D8A]" />
            {inProgress} in progress
          </span>
          <span className="flex items-center gap-1.5 text-[#112536]/35">
            <span className="w-2 h-2 rounded-full bg-[#112536]/15" />
            {total - done} remaining
          </span>
          <span className="flex items-center gap-1.5 text-[#DB5863]">
            <span className="w-2 h-2 rounded-full bg-[#DB5863]" />
            {done} complete
          </span>
        </div>
      </div>

      {/* ── Subteam filter ── */}
      <div className="flex flex-wrap gap-2 mb-7">
        {(['All', ...SUBTEAMS] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              filter === s
                ? 'bg-[#DB5863] text-white border-[#DB5863]'
                : 'border-[#F2C4CA] text-[#112536]/60 dark:text-[#F2C4CA]/60 hover:border-[#DB5863] hover:text-[#DB5863]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {months.length === 0 && (
        <p className="text-[#112536]/40 text-sm">No tasks match this filter.</p>
      )}

      {/* ── Month sections ── */}
      <div className="space-y-8">
        {months.map(month => {
          const monthTasks = filtered.filter(t => t.month_bucket === month)
          const monthDone = monthTasks.filter(t => t.status === 'done').length
          const monthOverdue = monthTasks.filter(t => isOverdue(t)).length
          const monthPct = monthTasks.length === 0 ? 0 : Math.round((monthDone / monthTasks.length) * 100)

          return (
            <section key={month}>
              {/* Month header */}
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-semibold text-[#112536] dark:text-[#F2C4CA] shrink-0">
                  {monthLabels[month] ?? month}
                </h2>
                <div className="flex-1 h-1.5 bg-[#F2C4CA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#DB5863] rounded-full transition-all" style={{ width: `${monthPct}%` }} />
                </div>
                <span className="text-xs text-[#112536]/40 shrink-0 whitespace-nowrap">
                  {monthDone}/{monthTasks.length}
                  {monthOverdue > 0 && <span className="text-red-500 ml-1.5">· {monthOverdue} overdue</span>}
                </span>
              </div>

              {/* Task list */}
              <div className="rounded-xl border border-[#F2C4CA] overflow-hidden bg-white dark:bg-[#112536]/10 divide-y divide-[#F2C4CA]">
                {monthTasks.map(task => {
                  const od = isOverdue(task)
                  const soon = isDueSoon(task)
                  const isDone = task.status === 'done'

                  return (
                    <div
                      key={task.id}
                      className={`relative flex items-start gap-3 px-4 py-3 group transition-colors ${
                        od ? 'bg-red-50 dark:bg-red-950/20' : 'hover:bg-[#F2C4CA]/10'
                      }`}
                    >
                      {/* Red left bar for overdue */}
                      {od && <div className="absolute inset-y-0 left-0 w-[3px] bg-red-500" />}

                      {/* Checkbox */}
                      <button
                        onClick={() => toggleStatus(task)}
                        disabled={updating.has(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                          isDone
                            ? 'bg-[#DB5863] border-[#DB5863]'
                            : od
                            ? 'border-red-400 hover:border-red-600'
                            : 'border-[#E37D8A] hover:border-[#DB5863]'
                        } ${updating.has(task.id) ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                        aria-label={isDone ? 'Mark incomplete' : 'Mark done'}
                      >
                        {isDone && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${
                          isDone
                            ? 'line-through text-[#112536]/30'
                            : od
                            ? 'text-red-700 dark:text-red-300 font-medium'
                            : 'text-[#112536] dark:text-[#F2C4CA]'
                        }`}>
                          {task.title}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
                          {task.subteam_tags.map(tag => (
                            <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] ?? 'bg-gray-100 text-[#112536]'}`}>
                              {tag}
                            </span>
                          ))}

                          {task.owner && (
                            <span className="text-xs text-[#112536]/50 dark:text-[#F2C4CA]/50 font-medium">
                              {task.owner.name}
                            </span>
                          )}

                          {task.due_date && (
                            <span className={`text-xs font-medium ${
                              od ? 'text-red-600' : soon ? 'text-amber-600' : 'text-[#112536]/35'
                            }`}>
                              {od ? '⚠ overdue · ' : soon ? '⏰ due soon · ' : 'by '}
                              {new Date(task.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}

                          {task.status === 'in progress' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F2C4CA] text-[#DB5863] font-medium">
                              in progress
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Edit button — appears on hover */}
                      <button
                        onClick={() => setModal({ open: true, task })}
                        className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#112536]/25 hover:text-[#DB5863] hover:bg-[#F2C4CA]/60 transition-all"
                        aria-label="Edit task"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  )
                })}

                {/* Add task row at bottom of each month */}
                <button
                  onClick={() => setModal({ open: true, task: null, defaultMonth: month })}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[#112536]/30 hover:text-[#DB5863] hover:bg-[#F2C4CA]/20 transition-colors"
                >
                  <span className="text-base leading-none">+</span> Add task in this month
                </button>
              </div>
            </section>
          )
        })}
      </div>

      {/* ── Modal ── */}
      {modal.open && (
        <TaskModal
          task={modal.task}
          people={initialPeople}
          defaultMonth={modal.defaultMonth}
          onClose={() => setModal({ open: false, task: null })}
          onSave={handleSave}
          onDelete={modal.task ? handleDelete : undefined}
        />
      )}
    </div>
  )
}
