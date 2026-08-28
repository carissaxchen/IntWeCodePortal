import { createClient } from '@/lib/supabase-server'
import { Person } from '@/types'
import PeopleClient from './PeopleClient'

export const dynamic = 'force-dynamic'

export default async function PeoplePage() {
  const supabase = await createClient()
  const { data: people, error } = await supabase
    .from('people')
    .select('*')
    .order('wecode_year', { ascending: false })
    .order('name', { ascending: true })

  if (error) return <p className="text-red-600">Failed to load people: {error.message}</p>

  return <PeopleClient initialPeople={(people ?? []) as Person[]} />
}
