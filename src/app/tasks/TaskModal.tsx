'use client'
import { useState } from 'react'
import { Task, Person, Subteam, TaskStatus } from '@/types'

const SUBTEAMS: Subteam[] = [
  'Engagement', 'Engineering', 'Finance', 'Logistics',
  'Marketing & Strategy', 'Programming', 'Co-Chairs', 'All-Board',
]

const MONTH_OPTIONS = [
  { value: '2026-04', label: 'April 2026' },
  { value: '2026-05', label: 'May 2026' },
  { value: '2026-06', label: 'June 2026' },
  { value: '2026-07', label: 'July 2026' },
  { value: '2026-08', label: 'August 2026' },
  { value: '2026-09', label: 'September 2026' },
  { value: '2026-10', label: 'October 2026' },
  { value: '2026-11', label: 'November 2026' },
  { value: '2026-12', label: 'December 2026' },
  { value: '2027-01', label: 'January 2027' },
  { value: '2027-03', label: 'March 2027' },
]

export interface TaskSaveData {
  id?: string
  title: string
  month_bucket: string
  subteam_tags: Subteam[]
  owner_id?: string
  due_date?: string
  status: TaskStatus
}

interface Props {
  task?: Task | null
  people: Person[]
  defaultMonth?: string
  onClose: () => void
  onSave: (data: TaskSaveData) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export default function TaskModal({ task, people, defaultMonth, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [monthBucket, setMonthBucket] = useState(task?.month_bucket ?? defaultMonth ?? '2026-09')
  const [tags, setTags] = useState<Subteam[]>(task?.subteam_tags ?? [])
  const [ownerId, setOwnerId] = useState(task?.owner_id ?? '')
  const [dueDate, setDueDate] = useState(task?.due_date ?? '')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'not started')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const toggleTag = (tag: Subteam) =>
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    await onSave({
      id: task?.id,
      title: title.trim(),
      month_bucket: monthBucket,
      subteam_tags: tags,
      owner_id: ownerId || undefined,
      due_date: dueDate || undefined,
      status,
    })
    setSaving(false)
    onClose()
  }

  const handleDelete = async () => {
    if (!task?.id || !onDelete) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    await onDelete(task.id)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-[#112536] rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-[#F2C4CA]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F2C4CA] flex items-center justify-between">
          <h2 className="font-bold text-[#DB5863] text-lg">
            {task ? 'Edit task' : 'New task'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#112536]/40 hover:bg-[#F2C4CA]/60 hover:text-[#DB5863] text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-semibold text-[#112536]/50 uppercase tracking-widest mb-1.5">
              Title <span className="text-[#DB5863]">*</span>
            </label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="w-full border border-[#F2C4CA] rounded-lg px-3 py-2 text-sm text-[#112536] focus:outline-none focus:border-[#DB5863] focus:ring-2 focus:ring-[#DB5863]/10 transition-all"
              placeholder="Describe the task…"
            />
          </div>

          {/* Month + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#112536]/50 uppercase tracking-widest mb-1.5">Month</label>
              <select
                value={monthBucket}
                onChange={e => setMonthBucket(e.target.value)}
                className="w-full border border-[#F2C4CA] rounded-lg px-3 py-2 text-sm text-[#112536] focus:outline-none focus:border-[#DB5863] bg-white"
              >
                {MONTH_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#112536]/50 uppercase tracking-widest mb-1.5">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full border border-[#F2C4CA] rounded-lg px-3 py-2 text-sm text-[#112536] focus:outline-none focus:border-[#DB5863] bg-white"
              >
                <option value="not started">Not started</option>
                <option value="in progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Owner + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#112536]/50 uppercase tracking-widest mb-1.5">Owner</label>
              <select
                value={ownerId}
                onChange={e => setOwnerId(e.target.value)}
                className="w-full border border-[#F2C4CA] rounded-lg px-3 py-2 text-sm text-[#112536] focus:outline-none focus:border-[#DB5863] bg-white"
              >
                <option value="">— unassigned —</option>
                {people.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.subteam}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#112536]/50 uppercase tracking-widest mb-1.5">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full border border-[#F2C4CA] rounded-lg px-3 py-2 text-sm text-[#112536] focus:outline-none focus:border-[#DB5863]"
              />
            </div>
          </div>

          {/* Subteam tags */}
          <div>
            <label className="block text-[10px] font-semibold text-[#112536]/50 uppercase tracking-widest mb-2">Teams</label>
            <div className="flex flex-wrap gap-2">
              {SUBTEAMS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    tags.includes(tag)
                      ? 'bg-[#DB5863] text-white border-[#DB5863]'
                      : 'border-[#F2C4CA] text-[#112536]/60 hover:border-[#DB5863] hover:text-[#DB5863]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F2C4CA] bg-[#F2C4CA]/10 flex items-center justify-between">
          <div>
            {task && onDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`text-sm transition-colors disabled:opacity-40 ${
                  confirmDelete ? 'text-red-600 font-semibold' : 'text-[#112536]/35 hover:text-red-500'
                }`}
              >
                {deleting ? 'Deleting…' : confirmDelete ? 'Tap again to confirm' : 'Delete task'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#112536]/50 hover:text-[#112536] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-5 py-2 text-sm bg-[#DB5863] text-white rounded-lg hover:bg-[#E37D8A] disabled:opacity-40 transition-colors font-medium"
            >
              {saving ? 'Saving…' : task ? 'Save changes' : 'Add task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
