'use client'
import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Person, Subteam, Role } from '@/types'

const SUBTEAMS: Subteam[] = [
  'Co-Chairs', 'Engagement', 'Engineering', 'Finance',
  'Logistics', 'Marketing & Strategy', 'Programming',
]
const ROLES: Role[] = ['co-chair', 'director', 'associate director']
const CURRENT_YEAR = 2027

const ROLE_COLORS: Record<Role, string> = {
  'co-chair':           'bg-[#DB5863] text-white',
  'director':           'bg-[#E37D8A] text-white',
  'associate director': 'bg-[#F2C4CA] text-[#112536]',
}

// ── Person modal ──────────────────────────────────────────────────────────────
interface PersonForm {
  id?: string
  name: string
  role: Role
  subteam: Subteam
  email: string
  phone: string
  location: string
  linkedin: string
  wecode_year: number
  to_confirm: boolean
}

const BLANK: PersonForm = {
  name: '', role: 'director', subteam: 'Engagement',
  email: '', phone: '', location: '', linkedin: '',
  wecode_year: CURRENT_YEAR, to_confirm: false,
}

function PersonModal({
  person, onClose, onSave, onDelete,
}: {
  person: Person | null
  onClose: () => void
  onSave: (data: PersonForm) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}) {
  const [form, setForm] = useState<PersonForm>(
    person
      ? { id: person.id, name: person.name, role: person.role, subteam: person.subteam,
          email: person.email ?? '', phone: person.phone ?? '', location: person.location ?? '',
          linkedin: person.linkedin ?? '', wecode_year: person.wecode_year ?? CURRENT_YEAR,
          to_confirm: person.to_confirm }
      : BLANK
  )
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const set = (k: keyof PersonForm, v: unknown) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  const handleDelete = async () => {
    if (!form.id || !onDelete) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    await onDelete(form.id)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-[#112536] rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-[#F2C4CA] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F2C4CA] flex items-center justify-between">
          <h2 className="font-bold text-[#DB5863] text-lg">{person ? 'Edit person' : 'Add person'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-[#112536]/40 hover:bg-[#F2C4CA]/60 hover:text-[#DB5863] text-2xl transition-colors">×</button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-[10px] font-semibold text-[#112536]/50 uppercase tracking-widest mb-1.5">Name <span className="text-[#DB5863]">*</span></label>
            <input
              autoFocus value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full border border-[#F2C4CA] rounded-lg px-3 py-2 text-sm text-[#112536] focus:outline-none focus:border-[#DB5863] focus:ring-2 focus:ring-[#DB5863]/10"
              placeholder="Full name"
            />
          </div>

          {/* Role + Subteam */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#112536]/50 uppercase tracking-widest mb-1.5">Role</label>
              <select value={form.role} onChange={e => set('role', e.target.value as Role)}
                className="w-full border border-[#F2C4CA] rounded-lg px-3 py-2 text-sm text-[#112536] bg-white focus:outline-none focus:border-[#DB5863]">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#112536]/50 uppercase tracking-widest mb-1.5">Subteam</label>
              <select value={form.subteam} onChange={e => set('subteam', e.target.value as Subteam)}
                className="w-full border border-[#F2C4CA] rounded-lg px-3 py-2 text-sm text-[#112536] bg-white focus:outline-none focus:border-[#DB5863]">
                {SUBTEAMS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* WECode Year */}
          <div>
            <label className="block text-[10px] font-semibold text-[#112536]/50 uppercase tracking-widest mb-1.5">WECode Year</label>
            <input
              type="number" value={form.wecode_year}
              onChange={e => set('wecode_year', parseInt(e.target.value) || CURRENT_YEAR)}
              min={2018} max={2030}
              className="w-full border border-[#F2C4CA] rounded-lg px-3 py-2 text-sm text-[#112536] focus:outline-none focus:border-[#DB5863]"
            />
            <p className="text-[10px] text-[#112536]/40 mt-1">{form.wecode_year === CURRENT_YEAR ? 'Current board member' : `Alumni — WECode ${form.wecode_year}`}</p>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#112536]/50 uppercase tracking-widest mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full border border-[#F2C4CA] rounded-lg px-3 py-2 text-sm text-[#112536] focus:outline-none focus:border-[#DB5863]"
                placeholder="email@college.edu"/>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#112536]/50 uppercase tracking-widest mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                className="w-full border border-[#F2C4CA] rounded-lg px-3 py-2 text-sm text-[#112536] focus:outline-none focus:border-[#DB5863]"
                placeholder="(617) 555-0100"/>
            </div>
          </div>

          {/* Location + LinkedIn */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#112536]/50 uppercase tracking-widest mb-1.5">Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)}
                className="w-full border border-[#F2C4CA] rounded-lg px-3 py-2 text-sm text-[#112536] focus:outline-none focus:border-[#DB5863]"
                placeholder="Cambridge, MA"/>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#112536]/50 uppercase tracking-widest mb-1.5">LinkedIn URL</label>
              <input value={form.linkedin} onChange={e => set('linkedin', e.target.value)}
                className="w-full border border-[#F2C4CA] rounded-lg px-3 py-2 text-sm text-[#112536] focus:outline-none focus:border-[#DB5863]"
                placeholder="https://linkedin.com/in/…"/>
            </div>
          </div>

          {/* To confirm */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.to_confirm} onChange={e => set('to_confirm', e.target.checked)}
              className="w-4 h-4 rounded border-[#F2C4CA] accent-[#DB5863]"/>
            <span className="text-sm text-[#112536]/60">Mark as "to confirm"</span>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-[#F2C4CA] bg-[#F2C4CA]/10 flex items-center justify-between">
          <div>
            {person && onDelete && (
              <button onClick={handleDelete} disabled={deleting}
                className={`text-sm transition-colors disabled:opacity-40 ${confirmDelete ? 'text-red-600 font-semibold' : 'text-[#112536]/35 hover:text-red-500'}`}>
                {deleting ? 'Removing…' : confirmDelete ? 'Tap again to confirm' : 'Remove'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-[#112536]/50 hover:text-[#112536]">Cancel</button>
            <button
              onClick={handleSave} disabled={saving || !form.name.trim()}
              className="px-5 py-2 text-sm bg-[#DB5863] text-white rounded-lg hover:bg-[#E37D8A] disabled:opacity-40 transition-colors font-medium"
            >
              {saving ? 'Saving…' : person ? 'Save changes' : 'Add person'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main client component ─────────────────────────────────────────────────────
type ViewFilter = 'All' | 'Current' | 'Alumni'

export default function PeopleClient({ initialPeople }: { initialPeople: Person[] }) {
  const supabase = createClient()
  const [people, setPeople] = useState<Person[]>(initialPeople)
  const [view, setView] = useState<ViewFilter>('All')
  const [subteamFilter, setSubteamFilter] = useState<Subteam | 'All'>('All')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ open: boolean; person: Person | null }>({ open: false, person: null })

  const handleSave = useCallback(async (data: PersonForm) => {
    if (data.id) {
      const { data: updated } = await supabase
        .from('people')
        .update({ name: data.name, role: data.role, subteam: data.subteam, email: data.email, phone: data.phone || null, location: data.location || null, linkedin: data.linkedin || null, wecode_year: data.wecode_year, to_confirm: data.to_confirm })
        .eq('id', data.id).select('*').single()
      if (updated) setPeople(prev => prev.map(p => p.id === data.id ? updated as Person : p))
    } else {
      const { data: newPerson } = await supabase
        .from('people')
        .insert({ name: data.name, role: data.role, subteam: data.subteam, email: data.email, phone: data.phone || null, location: data.location || null, linkedin: data.linkedin || null, wecode_year: data.wecode_year, to_confirm: data.to_confirm })
        .select('*').single()
      if (newPerson) setPeople(prev => [...prev, newPerson as Person].sort((a, b) => a.name.localeCompare(b.name)))
    }
  }, [supabase])

  const handleDelete = useCallback(async (id: string) => {
    await supabase.from('people').delete().eq('id', id)
    setPeople(prev => prev.filter(p => p.id !== id))
    setModal({ open: false, person: null })
  }, [supabase])

  // Filter people
  const filtered = people.filter(p => {
    if (view === 'Current' && (p.wecode_year ?? CURRENT_YEAR) !== CURRENT_YEAR) return false
    if (view === 'Alumni' && (p.wecode_year ?? CURRENT_YEAR) >= CURRENT_YEAR) return false
    if (subteamFilter !== 'All' && p.subteam !== subteamFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return p.name.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.subteam.toLowerCase().includes(q)
    }
    return true
  })

  // Group by subteam (respecting filter) then by year for alumni
  const bySubteam = SUBTEAMS.reduce<Record<string, Person[]>>((acc, team) => {
    const members = filtered.filter(p => p.subteam === team)
    if (members.length) acc[team] = members.sort((a, b) => a.name.localeCompare(b.name))
    return acc
  }, {})

  // Also group by year if in alumni view
  const years = view === 'Alumni'
    ? [...new Set(filtered.map(p => p.wecode_year ?? CURRENT_YEAR))].sort((a, b) => b - a)
    : []

  const byYear = view === 'Alumni'
    ? years.reduce<Record<number, Person[]>>((acc, yr) => {
        acc[yr] = filtered.filter(p => (p.wecode_year ?? CURRENT_YEAR) === yr).sort((a, b) => a.name.localeCompare(b.name))
        return acc
      }, {})
    : {}

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#DB5863]">People</h1>
          <p className="text-xs text-[#112536]/40 mt-0.5">{filtered.length} people · WECode 2027 board &amp; alumni</p>
        </div>
        <button
          onClick={() => setModal({ open: true, person: null })}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#DB5863] text-white rounded-lg text-sm font-medium hover:bg-[#E37D8A] transition-colors shadow-sm"
        >
          <span className="text-base leading-none">+</span> Add person
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Current / Alumni toggle */}
        <div className="flex gap-1 p-1 bg-[#F2C4CA]/30 rounded-lg shrink-0">
          {(['All', 'Current', 'Alumni'] as ViewFilter[]).map(v => (
            <button key={v} onClick={() => { setView(v); setSubteamFilter('All') }}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${view === v ? 'bg-white text-[#DB5863] font-medium shadow-sm' : 'text-[#112536]/50 hover:text-[#DB5863]'}`}>
              {v}
            </button>
          ))}
        </div>

        {/* Subteam filter */}
        <select value={subteamFilter} onChange={e => setSubteamFilter(e.target.value as Subteam | 'All')}
          className="border border-[#F2C4CA] rounded-lg px-3 py-1.5 text-sm text-[#112536] bg-white focus:outline-none focus:border-[#DB5863]">
          <option value="All">All subteams</option>
          {SUBTEAMS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-[#F2C4CA] rounded-lg px-3 py-1.5 text-sm text-[#112536] placeholder:text-[#112536]/30 focus:outline-none focus:border-[#DB5863]"
          placeholder="Search by name, email, or team…"/>
      </div>

      {filtered.length === 0 && (
        <p className="text-[#112536]/40 text-sm">No people match this filter.</p>
      )}

      {/* Alumni view: group by year */}
      {view === 'Alumni' ? (
        <div className="space-y-8">
          {years.map(yr => (
            <section key={yr}>
              <h2 className="text-sm font-semibold text-[#112536] dark:text-[#F2C4CA] mb-3">WECode {yr}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {byYear[yr].map(p => <PersonCard key={p.id} person={p} onEdit={() => setModal({ open: true, person: p })} />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* Current / All view: group by subteam */
        <div className="space-y-8">
          {SUBTEAMS.map(team => {
            const members = bySubteam[team]
            if (!members?.length) return null
            return (
              <section key={team}>
                <h2 className="text-sm font-semibold text-[#112536] dark:text-[#F2C4CA] mb-3">{team}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {members.map(p => <PersonCard key={p.id} person={p} onEdit={() => setModal({ open: true, person: p })} />)}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {modal.open && (
        <PersonModal
          person={modal.person}
          onClose={() => setModal({ open: false, person: null })}
          onSave={handleSave}
          onDelete={modal.person ? handleDelete : undefined}
        />
      )}
    </div>
  )
}

function PersonCard({ person, onEdit }: { person: Person; onEdit: () => void }) {
  const isCurrent = (person.wecode_year ?? CURRENT_YEAR) === CURRENT_YEAR
  return (
    <div
      className={`rounded-xl border p-4 bg-white dark:bg-gray-900/20 cursor-pointer hover:border-[#DB5863]/40 transition-colors group ${
        person.to_confirm ? 'border-amber-300 dark:border-amber-700' : 'border-[#F2C4CA]'
      }`}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-gray-900 dark:text-gray-100 leading-snug">{person.name}</p>
        <div className="flex items-center gap-1 shrink-0">
          {!isCurrent && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#112536]/10 text-[#112536]/50">
              {person.wecode_year}
            </span>
          )}
          {person.to_confirm && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">to confirm</span>
          )}
          <span className="opacity-0 group-hover:opacity-60 text-[#112536]/40 text-xs ml-1">✏</span>
        </div>
      </div>
      <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[person.role] ?? 'bg-gray-100 text-gray-700'}`}>
        {person.role}
      </span>
      <div className="mt-2 space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
        {person.email && <p><a href={`mailto:${person.email}`} onClick={e => e.stopPropagation()} className="hover:text-[#DB5863]">{person.email}</a></p>}
        {person.phone && <p>{person.phone}</p>}
        {person.location && <p>{person.location}</p>}
        {person.linkedin && (
          <p><a href={person.linkedin} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="hover:text-[#DB5863]">LinkedIn ↗</a></p>
        )}
      </div>
    </div>
  )
}
