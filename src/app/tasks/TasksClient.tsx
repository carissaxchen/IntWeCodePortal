'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, useDroppable,
  type DragStartEvent, type DragOverEvent, type DragEndEvent,
  type DraggableAttributes,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
  type SyntheticListenerMap,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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

// ── Task row (shared between sortable + drag overlay) ─────────────────────────
interface RowProps {
  task: Task
  updating: Set<string>
  onToggle: (task: Task) => void
  onCycleStatus: (task: Task) => void
  onEdit: (task: Task) => void
  dragListeners?: SyntheticListenerMap
  dragAttributes?: DraggableAttributes
  isGhost?: boolean
}

function TaskRow({ task, updating, onToggle, onCycleStatus, onEdit, dragListeners, dragAttributes, isGhost }: RowProps) {
  const od = isOverdue(task)
  const soon = isDueSoon(task)
  const isDone = task.status === 'done'
  const isInProgress = task.status === 'in progress'

  return (
    <div className={`relative flex items-center group transition-colors ${
      isGhost ? '' : od ? 'bg-red-50 dark:bg-red-950/20' : 'hover:bg-[#F2C4CA]/10'
    }`}>
      {od && !isGhost && <div className="absolute inset-y-0 left-0 w-[3px] bg-red-500" />}

      {/* Drag handle */}
      <div
        {...dragAttributes}
        {...dragListeners}
        className="pl-3 pr-1 py-3 shrink-0 cursor-grab active:cursor-grabbing text-[#112536]/20 opacity-0 group-hover:opacity-100 hover:text-[#112536]/50 transition-opacity touch-none select-none"
        aria-label="Drag to reorder"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 10 16">
          <circle cx="2.5" cy="2" r="1.5"/><circle cx="7.5" cy="2" r="1.5"/>
          <circle cx="2.5" cy="8" r="1.5"/><circle cx="7.5" cy="8" r="1.5"/>
          <circle cx="2.5" cy="14" r="1.5"/><circle cx="7.5" cy="14" r="1.5"/>
        </svg>
      </div>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task)}
        disabled={updating.has(task.id)}
        className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors my-3 ml-1 ${
          isDone ? 'bg-[#DB5863] border-[#DB5863]'
          : isInProgress ? 'border-[#E37D8A] bg-[#F2C4CA]/50'
          : od ? 'border-red-400 hover:border-red-600'
          : 'border-[#E37D8A] hover:border-[#DB5863]'
        } ${updating.has(task.id) ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
      >
        {isDone && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        )}
        {isInProgress && !isDone && <div className="w-1.5 h-1.5 rounded-full bg-[#E37D8A]"/>}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 px-3 py-3">
        <p className={`text-sm leading-snug ${
          isDone ? 'line-through text-[#112536]/30'
          : od ? 'text-red-700 dark:text-red-300 font-medium'
          : 'text-[#112536] dark:text-[#F2C4CA]'
        }`}>{task.title}</p>

        <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
          {task.subteam_tags.map(tag => (
            <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] ?? 'bg-gray-100 text-[#112536]'}`}>
              {tag}
            </span>
          ))}

          {/* In-progress toggle — always visible when in progress, hover-visible otherwise */}
          {!isDone && (
            <button
              onClick={() => onCycleStatus(task)}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                isInProgress
                  ? 'bg-[#F2C4CA] text-[#DB5863] border-[#F2C4CA] font-medium hover:bg-[#DB5863] hover:text-white hover:border-[#DB5863]'
                  : 'border-transparent text-[#112536]/25 opacity-0 group-hover:opacity-100 hover:bg-[#F2C4CA]/60 hover:text-[#DB5863] hover:border-[#F2C4CA]'
              }`}
            >
              {isInProgress ? '▶ In progress' : '▷ Start'}
            </button>
          )}

          {task.owner && (
            <span className="text-xs text-[#112536]/50 dark:text-[#F2C4CA]/50 font-medium">
              {task.owner.name}
            </span>
          )}

          {task.due_date && (
            <span className={`text-xs font-medium ${
              od ? 'text-red-600' : soon ? 'text-amber-600' : 'text-[#112536]/35'
            }`}>
              {od ? '⚠ overdue · ' : soon ? '⏰ ' : 'by '}
              {new Date(task.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Edit */}
      <button
        onClick={() => onEdit(task)}
        className="shrink-0 mr-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#112536]/25 hover:text-[#DB5863] hover:bg-[#F2C4CA]/60 transition-all"
        aria-label="Edit task"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
      </button>
    </div>
  )
}

function SortableTaskRow(props: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.task.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.25 : 1 }}
    >
      <TaskRow
        {...props}
        dragListeners={listeners ?? undefined}
        dragAttributes={attributes}
      />
    </div>
  )
}

function DroppableMonthZone({ month, children }: { month: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `zone-${month}` })
  return (
    <div ref={setNodeRef} className={`min-h-[8px] transition-colors rounded-b ${isOver ? 'bg-[#F2C4CA]/20' : ''}`}>
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TasksClient({
  initialTasks,
  initialPeople,
  monthLabels,
}: {
  initialTasks: Task[]
  initialPeople: Person[]
  monthLabels: Record<string, string>
}) {
  const supabase = createClient()

  const [tasks, setTasks] = useState<Task[]>(
    [...initialTasks].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  )
  const tasksRef = useRef(tasks)
  useEffect(() => { tasksRef.current = tasks }, [tasks])

  const [filter, setFilter] = useState<Subteam | 'All'>(() => {
    if (typeof window === 'undefined') return 'All'
    const saved = localStorage.getItem('wecode-my-team')
    return (saved && SUBTEAMS.includes(saved as Subteam)) ? saved as Subteam : 'All'
  })
  const [showCompleted, setShowCompleted] = useState(true)
  const [updating, setUpdating] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [modal, setModal] = useState<{ open: boolean; task: Task | null; defaultMonth?: string }>({ open: false, task: null })

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })

  const setFilterAndSave = (f: Subteam | 'All') => {
    setFilter(f)
    localStorage.setItem('wecode-my-team', f === 'All' ? '' : f)
  }

  // Realtime
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

  // Listen for "My team" changes from Nav
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'wecode-my-team') {
        const val = e.newValue ?? ''
        setFilter(val && SUBTEAMS.includes(val as Subteam) ? val as Subteam : 'All')
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const toggleStatus = useCallback(async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'done' ? 'not started' : 'done'
    setUpdating(s => new Set(s).add(task.id))
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    setUpdating(s => { const n = new Set(s); n.delete(task.id); return n })
  }, [supabase])

  const cycleStatus = useCallback(async (task: Task) => {
    if (task.status === 'done') return
    const newStatus: TaskStatus = task.status === 'in progress' ? 'not started' : 'in progress'
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
  }, [supabase])

  const handleSave = useCallback(async (data: TaskSaveData) => {
    if (data.id) {
      const { data: updated } = await supabase
        .from('tasks')
        .update({ title: data.title, month_bucket: data.month_bucket, subteam_tags: data.subteam_tags, owner_id: data.owner_id ?? null, due_date: data.due_date ?? null, status: data.status })
        .eq('id', data.id).select('*, owner:people(*)').single()
      if (updated) setTasks(prev => prev.map(t => t.id === data.id ? updated as Task : t))
    } else {
      const maxOrder = Math.max(-1, ...tasksRef.current.filter(t => t.month_bucket === data.month_bucket).map(t => t.sort_order ?? 0))
      const { data: newTask } = await supabase
        .from('tasks')
        .insert({ title: data.title, month_bucket: data.month_bucket, subteam_tags: data.subteam_tags, owner_id: data.owner_id ?? null, due_date: data.due_date ?? null, status: data.status, sort_order: maxOrder + 1 })
        .select('*, owner:people(*)').single()
      if (newTask) setTasks(prev => [...prev, newTask as Task])
    }
  }, [supabase])

  const handleDelete = useCallback(async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
    setModal({ open: false, task: null })
  }, [supabase])

  // ── Drag and drop ─────────────────────────────────────────────────────────
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const current = tasksRef.current
    const activeTask = current.find(t => t.id === active.id)
    if (!activeTask) return

    const overTask = current.find(t => t.id === over.id)
    // over.id is either a task id or "zone-YYYY-MM"
    const overMonth = overTask?.month_bucket ?? (over.id as string).replace('zone-', '')
    if (!overMonth.match(/^\d{4}-\d{2}$/) || overMonth === activeTask.month_bucket) return

    const updated = current.map(t => t.id === active.id ? { ...t, month_bucket: overMonth } : t)
    tasksRef.current = updated
    setTasks(updated)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const current = tasksRef.current
    const activeTaskId = active.id as string
    const overId = over.id as string
    const overTask = current.find(t => t.id === overId)
    const activeTask = current.find(t => t.id === activeTaskId)
    if (!activeTask) return

    // Group by month, sorted by sort_order
    const groups: Record<string, Task[]> = {}
    current.forEach(t => { (groups[t.month_bucket] ??= []).push(t) })
    Object.values(groups).forEach(arr => arr.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)))

    // Reorder within same month if dragging over another task
    if (overTask && overTask.month_bucket === activeTask.month_bucket) {
      const month = activeTask.month_bucket
      const arr = groups[month]
      const from = arr.findIndex(t => t.id === activeTaskId)
      const to = arr.findIndex(t => t.id === overId)
      if (from !== -1 && to !== -1 && from !== to) {
        groups[month] = arrayMove(arr, from, to)
      }
    }

    // Re-index sort_orders and collect DB updates
    const newTasks: Task[] = []
    const updates: Array<{ id: string; sort_order: number; month_bucket: string }> = []

    Object.values(groups).forEach(arr => {
      arr.forEach((t, i) => {
        newTasks.push({ ...t, sort_order: i })
        const orig = current.find(x => x.id === t.id)!
        if (orig.sort_order !== i || orig.month_bucket !== t.month_bucket) {
          updates.push({ id: t.id, sort_order: i, month_bucket: t.month_bucket })
        }
      })
    })

    tasksRef.current = newTasks
    setTasks(newTasks)

    if (updates.length > 0) {
      Promise.all(updates.map(u =>
        supabase.from('tasks').update({ sort_order: u.sort_order, month_bucket: u.month_bucket }).eq('id', u.id)
      ))
    }
  }, [supabase])

  // ── Derived state ──────────────────────────────────────────────────────────
  const allFiltered = filter === 'All' ? tasks : tasks.filter(t => t.subteam_tags.includes(filter as Subteam))
  const displayed = showCompleted ? allFiltered : allFiltered.filter(t => t.status !== 'done')
  const months = [...new Set(allFiltered.map(t => t.month_bucket))].sort()

  const total = allFiltered.length
  const done = allFiltered.filter(t => t.status === 'done').length
  const overdue = allFiltered.filter(t => isOverdue(t)).length
  const dueSoon = allFiltered.filter(t => isDueSoon(t)).length
  const inProgress = allFiltered.filter(t => t.status === 'in progress').length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  const activeTask = activeId ? tasks.find(t => t.id === activeId) ?? null : null

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#DB5863]">Task Tracker</h1>
          <p className="text-xs text-[#112536]/40 mt-0.5">WECode 2027 · Against the Current · {todayStr}</p>
        </div>
        <button
          onClick={() => setModal({ open: true, task: null })}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#DB5863] text-white rounded-lg text-sm font-medium hover:bg-[#E37D8A] transition-colors shadow-sm"
        >
          <span className="text-base leading-none">+</span> Add task
        </button>
      </div>

      {/* Progress dashboard */}
      <div className="rounded-xl border border-[#F2C4CA] bg-white dark:bg-[#112536]/10 p-5 mb-6">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-3xl font-bold text-[#112536] dark:text-[#F2C4CA]">{done}</span>
            <span className="text-base text-[#112536]/40 dark:text-[#F2C4CA]/40 ml-1">of {total} done</span>
          </div>
          <span className="text-2xl font-bold text-[#DB5863]">{pct}%</span>
        </div>
        <div className="h-3 bg-[#F2C4CA] rounded-full overflow-hidden mb-4">
          <div className="h-full bg-[#DB5863] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
          <span className={`flex items-center gap-1.5 ${overdue > 0 ? 'text-red-600 font-semibold' : 'text-[#112536]/35'}`}>
            <span className={`w-2 h-2 rounded-full ${overdue > 0 ? 'bg-red-500' : 'bg-[#112536]/20'}`} />
            {overdue} overdue
          </span>
          <span className={`flex items-center gap-1.5 ${dueSoon > 0 ? 'text-amber-600' : 'text-[#112536]/35'}`}>
            <span className={`w-2 h-2 rounded-full ${dueSoon > 0 ? 'bg-amber-400' : 'bg-[#112536]/20'}`} />
            {dueSoon} due soon
          </span>
          <span className={`flex items-center gap-1.5 ${inProgress > 0 ? 'text-[#DB5863]' : 'text-[#112536]/35'}`}>
            <span className={`w-2 h-2 rounded-full ${inProgress > 0 ? 'bg-[#E37D8A]' : 'bg-[#112536]/15'}`} />
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

      {/* Filter row */}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div className="flex flex-wrap gap-2">
          {(['All', ...SUBTEAMS] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterAndSave(s)}
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
        <button
          onClick={() => setShowCompleted(v => !v)}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
            !showCompleted
              ? 'border-[#DB5863] text-[#DB5863] bg-[#DB5863]/5'
              : 'border-[#F2C4CA] text-[#112536]/50 hover:border-[#DB5863] hover:text-[#DB5863]'
          }`}
        >
          {showCompleted ? 'Hide done' : 'Show done'}
        </button>
      </div>

      {months.length === 0 && (
        <p className="text-[#112536]/40 text-sm">No tasks match this filter.</p>
      )}

      {/* Month sections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-8">
          {months.map(month => {
            const monthTasks = displayed
              .filter(t => t.month_bucket === month)
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            const allMonthTasks = allFiltered.filter(t => t.month_bucket === month)
            const monthDone = allMonthTasks.filter(t => t.status === 'done').length
            const monthOverdue = allMonthTasks.filter(t => isOverdue(t)).length
            const monthPct = allMonthTasks.length === 0 ? 0 : Math.round((monthDone / allMonthTasks.length) * 100)

            return (
              <section key={month}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-sm font-semibold text-[#112536] dark:text-[#F2C4CA] shrink-0">
                    {monthLabels[month] ?? month}
                  </h2>
                  <div className="flex-1 h-1.5 bg-[#F2C4CA] rounded-full overflow-hidden">
                    <div className="h-full bg-[#DB5863] rounded-full transition-all" style={{ width: `${monthPct}%` }} />
                  </div>
                  <span className="text-xs text-[#112536]/40 shrink-0 whitespace-nowrap">
                    {monthDone}/{allMonthTasks.length}
                    {monthOverdue > 0 && <span className="text-red-500 ml-1.5">· {monthOverdue} overdue</span>}
                  </span>
                </div>

                <SortableContext items={monthTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="rounded-xl border border-[#F2C4CA] overflow-hidden bg-white dark:bg-[#112536]/10 divide-y divide-[#F2C4CA]">
                    <DroppableMonthZone month={month}>
                      {monthTasks.map(task => (
                        <SortableTaskRow
                          key={task.id}
                          task={task}
                          updating={updating}
                          onToggle={toggleStatus}
                          onCycleStatus={cycleStatus}
                          onEdit={t => setModal({ open: true, task: t })}
                        />
                      ))}
                    </DroppableMonthZone>

                    <button
                      onClick={() => setModal({ open: true, task: null, defaultMonth: month })}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[#112536]/30 hover:text-[#DB5863] hover:bg-[#F2C4CA]/20 transition-colors"
                    >
                      <span>+</span> Add task in this month
                    </button>
                  </div>
                </SortableContext>
              </section>
            )
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rounded-xl border border-[#F2C4CA] bg-white shadow-2xl opacity-95">
              <TaskRow
                task={activeTask}
                updating={new Set()}
                onToggle={() => {}}
                onCycleStatus={() => {}}
                onEdit={() => {}}
                isGhost
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

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
