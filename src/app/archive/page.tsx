const YEARS = [
  {
    year: 2026,
    attendees: '800+',
    notes: 'Most recent conference. Theme and full records in Google Drive.',
    keynotes: [],
    highlights: [],
  },
  {
    year: 2025,
    attendees: '800+',
    notes: 'First ever Speaker Gala introduced to build community among speakers.',
    keynotes: [],
    highlights: ['Inaugural Speaker Gala'],
  },
  {
    year: 2024,
    attendees: '800+',
    notes: 'Finance team added to the board structure.',
    keynotes: [],
    highlights: ['Finance team created'],
  },
  {
    year: 2023,
    attendees: '800+',
    notes: '',
    keynotes: [],
    highlights: [],
  },
  {
    year: 2022,
    attendees: '800+',
    notes: '',
    keynotes: [],
    highlights: [],
  },
  {
    year: 2021,
    attendees: '1,200+',
    notes: 'Hosted on Hopin. 50+ countries represented. First fully virtual conference.',
    keynotes: ['Jennifer Hyman (CEO, Rent the Runway)'],
    highlights: ['First fully virtual year', '50+ countries represented', 'March 5–7'],
  },
  {
    year: 2020,
    attendees: '—',
    notes: 'Canceled due to COVID-19.',
    keynotes: [],
    highlights: ['🚫 Canceled — COVID-19'],
  },
  {
    year: 2019,
    attendees: '—',
    notes: 'Hosted in Science Center, Northwest, and Maxwell Dworkin. Feb 22–24.',
    keynotes: ['Dara Treseder', 'Margaret Mayer', 'Catarina Macedo', 'Pooja Sankar', 'Jessica McKellar'],
    highlights: ['Zumba with Google', 'Yoga with IMC Trading', 'WECode\'s Got Talent!'],
  },
  {
    year: 2018,
    attendees: '700',
    notes: 'March 2–4, 2018. 80+ events. 4 keynotes.',
    keynotes: [
      'Jess Lee (former CEO Polyvore, Sequoia Capital)',
      'Pamela Rice (Capital One)',
      'Chieko Asakawa (IBM)',
      'Ruthe Farmer (activist & policy maker)',
    ],
    highlights: ['80+ events'],
  },
  {
    year: 2017,
    attendees: '500+',
    notes: 'Hosted in Northwest. Collaborated with CS50. 60+ events.',
    keynotes: [
      'Latanya Sweeney (Harvard University)',
      'Julie Elberfeld (Capital One)',
      'Natalie Glance (Duolingo)',
      'Lili Cheng',
    ],
    highlights: ['60+ events', 'CS50 collaboration'],
  },
  {
    year: 2016,
    attendees: '600+',
    notes: 'Feb 27–28, 2016. Hosted in Northwest. 4 keynotes, 11 workshops, 6 panels.',
    keynotes: [
      'Laura Butler (Microsoft)',
      'Cathryn Posey (US Digital Services)',
      'Tracy Chou (Pinterest)',
      'Pooja Sankar (CEO, Piazza)',
    ],
    highlights: ['11 workshops', '6 panels', 'CS50 playlist recorded'],
  },
  {
    year: 2015,
    attendees: '500+',
    notes: '40+ colleges represented.',
    keynotes: [
      'Dona Sarkar (Microsoft)',
      'Marie Louise Kirk (Goldman Sachs)',
      'Parisa Tabriz (Google)',
      'Video from Sheryl Sandberg (Facebook COO)',
    ],
    highlights: ['40+ colleges represented'],
  },
  {
    year: 2014,
    attendees: '200+',
    notes: 'First conference! Inspired by Sheryl Sandberg\'s Lean In. Founded by Jiayun Fang \'16.',
    keynotes: [
      'Rebecca Parsons (CTO, ThoughtWorks)',
      'Kimberly Lockhart (Box)',
      'Marie L. Kirk (Goldman Sachs)',
    ],
    highlights: ['First conference ever', 'Founded by Jiayun Fang \'16', 'Press: Harvard Crimson, Harvard SEAS, Harvard Gazette'],
  },
]

export default function ArchivePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-200">WECode History Archive</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm max-w-2xl">
          Year-by-year record of WECode from 2014 to 2026. For current board structure and how WECode runs today, see the{' '}
          <a href="/reference" className="text-purple-600 hover:underline">Reference</a> page.
          Full details and documents are in Google Drive.
        </p>
      </div>

      <div className="space-y-4">
        {YEARS.map(({ year, attendees, notes, keynotes, highlights }) => (
          <details
            key={year}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/20 overflow-hidden group"
          >
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors list-none">
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-purple-800 dark:text-purple-300">{year}</span>
                {year === 2020 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Canceled</span>
                )}
                {attendees !== '—' && (
                  <span className="text-sm text-gray-500">{attendees} attendees</span>
                )}
              </div>
              <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>

            <div className="px-5 pb-5 pt-2 border-t border-gray-100 dark:border-gray-800">
              {notes && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{notes}</p>}

              <div className="grid sm:grid-cols-2 gap-4">
                {keynotes.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Keynotes</p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
                      {keynotes.map((k) => <li key={k}>· {k}</li>)}
                    </ul>
                  </div>
                )}
                {highlights.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Highlights</p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
                      {highlights.map((h) => <li key={h}>· {h}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </details>
        ))}
      </div>

      <p className="mt-8 text-xs text-gray-400">
        Credits: Kamryn Ohly. Full documents, photos, and press links in Google Drive.
      </p>
    </div>
  )
}
