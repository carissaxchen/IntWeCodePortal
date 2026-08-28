export type Role = 'co-chair' | 'director' | 'associate director'

export type Subteam =
  | 'Engagement'
  | 'Engineering'
  | 'Finance'
  | 'Logistics'
  | 'Marketing & Strategy'
  | 'Programming'
  | 'Co-Chairs'
  | 'All-Board'

export type TaskStatus = 'open' | 'done' | 'in progress' | 'not started'

export interface Person {
  id: string
  name: string
  role: Role
  subteam: Subteam
  email: string
  phone?: string
  location?: string
  linkedin?: string
  to_confirm: boolean
  wecode_year: number // 2027 = current board, earlier = alumni
  created_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  owner_id?: string
  owner?: Person
  due_date?: string
  subteam_tags: Subteam[]
  status: TaskStatus
  month_bucket: string // e.g. "2026-05"
  sort_order: number
  created_at: string
}

export interface Milestone {
  id: string
  month: string
  general_label?: string
  team_label?: string
  team?: Subteam
}
