import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const csvPath = path.join(__dirname, '../../files/tracker.csv')
const raw = fs.readFileSync(csvPath, 'utf-8')

// Simple CSV parser (handles quoted fields)
function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = parseRow(lines[0])
  return lines.slice(1).map(line => {
    const values = parseRow(line)
    const obj = {}
    headers.forEach((h, i) => { obj[h.trim()] = (values[i] ?? '').trim() })
    return obj
  })
}

function parseRow(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQuotes = !inQuotes }
    else if (ch === ',' && !inQuotes) { result.push(current); current = '' }
    else { current += ch }
  }
  result.push(current)
  return result
}

const SUBTEAM_MAP = {
  'M&S': 'Marketing & Strategy',
  'Co-Chairs': 'Co-Chairs',
  'All-Board': 'All-Board',
  'Engagement': 'Engagement',
  'Engineering': 'Engineering',
  'Finance': 'Finance',
  'Logistics': 'Logistics',
  'Programming': 'Programming',
}

function normalizeStatus(s) {
  const v = (s || '').trim().toLowerCase()
  if (v === 'done' || v === 'done!') return 'done'
  if (v === 'in progress') return 'in progress'
  return 'not started'
}

function parseTeams(teamStr) {
  if (!teamStr) return []
  return teamStr.split(',').map(t => {
    const clean = t.trim()
    return SUBTEAM_MAP[clean] || clean
  }).filter(Boolean)
}

function esc(s) {
  return (s || '').replace(/'/g, "''")
}

function arrLiteral(teams) {
  if (!teams.length) return "'{}'"
  return `ARRAY[${teams.map(t => `'${esc(t)}'::subteam_enum`).join(',')}]`
}

const rows = parseCSV(raw)

// Detect month bucket from Section column (ALL-CAPS header rows have blank Team or
// the Section value IS the header label when it matches the Month column pattern).
// Strategy: use the Month column directly — it's already YYYY-MM formatted.

let currentMonth = '2026-04'
const tasks = []
const unassigned = []

for (const row of rows) {
  const month = row['Month'] || ''
  const section = row['Section'] || ''
  const desc = row['Description'] || ''
  const team = row['Team'] || ''
  const status = row['Status'] || ''

  // Skip header rows: ALL-CAPS Description with no team
  if (desc === desc.toUpperCase() && desc.length > 5 && !team) continue

  if (month) currentMonth = month

  const teams = parseTeams(team)
  const normalStatus = normalizeStatus(status)

  if (!team) {
    unassigned.push({ month: currentMonth, title: desc })
    continue
  }

  tasks.push({
    month: currentMonth,
    title: desc,
    teams,
    status: normalStatus,
  })
}

// Build SQL
let sql = `-- Seed: tasks from tracker.csv\n-- Generated ${new Date().toISOString()}\n\ninsert into tasks (title, subteam_tags, status, month_bucket) values\n`

const values = tasks.map(t =>
  `  ('${esc(t.title)}', ${arrLiteral(t.teams)}, '${t.status}'::task_status_enum, '${t.month}')`
)

sql += values.join(',\n') + ';\n'

sql += `\n-- TASKS NEEDING TEAM ASSIGNMENT (${unassigned.length} rows)\n-- Please assign a subteam_tags value to each before running:\n`
unassigned.forEach(u => {
  sql += `-- Month: ${u.month} | "${u.title}"\n`
})

const outPath = path.join(__dirname, '../supabase/seed.sql')
fs.writeFileSync(outPath, sql)
console.log(`Written ${tasks.length} tasks to seed.sql`)
console.log(`${unassigned.length} tasks need team assignment:`)
unassigned.forEach(u => console.log(`  [${u.month}] ${u.title}`))
