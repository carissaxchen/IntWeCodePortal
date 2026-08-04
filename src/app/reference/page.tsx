export default function ReferencePage() {
  return (
    <div className="max-w-4xl prose dark:prose-invert prose-rose">
      <h1>Reference Guide</h1>
      <p className="lead">
        Key information for WECode 2027 board members — the Vision and the Engine.
        See the <a href="/archive">Archive</a> for the full history (2014–2026).
      </p>

      {/* ── SECTION 1: THE VISION ── */}
      <section>
        <h2>1 / The Vision</h2>

        <h3>What is WECode?</h3>
        <p>
          WECode hosts the largest student-run women-in-tech conference in the world. We serve
          undergraduates every spring and are an initiative of the Harvard Undergraduate Women in
          CS group (WiCS). Our team of 30+ undergraduate students is united to uplift women and
          break boundaries in tech — building a space of support, learning, and inspiration for
          over a decade.
        </p>

        <h3>The Start</h3>
        <p>
          WECode started in 2014 under Jiayun Fang &apos;16, then co-president of Harvard WiCS,
          inspired by <em>Lean In</em>. Within five months, the first conference brought together
          tech industry leaders and 200+ attendees. That gathering has grown into an annual event
          welcoming 800+ women in tech.
        </p>

        <h3>Where We Go From Here</h3>
        <p>
          Women have always been at the forefront of computing — from Ada Lovelace and the ENIAC
          programmers to Grace Hopper and countless unnamed pioneers. The gender gap in tech today
          is the result of structures — some intentional, some invisible — not a gap in ability.
          WECode&apos;s work has never been just about one weekend or one industry, but a challenge
          to the status quo. As board members, you are not just continuing a tradition: you are
          actively shaping a vision.
        </p>
      </section>

      {/* ── SECTION 3: THE ENGINE ── */}
      <section>
        <h2>3 / The Engine</h2>

        <h3>Organizational Structure</h3>
        <p>WECode currently consists of 6 subteams managed by 2 co-chairs:</p>

        <div className="not-prose grid sm:grid-cols-2 gap-4 my-4">
          {[
            {
              name: 'Engagement',
              card: 'border-[#F2C4CA] bg-[#F2C4CA]/20',
              head: 'text-[#DB5863]',
              desc: 'Builds and nurtures the WECode community — Tech Fellows, pre-conference events, alumni engagement, Innovation Challenge, and Tech Demos.',
              initiatives: ['Pre-Conference Events', 'Tech Demos', 'Tech Fellows', 'Alumni Engagement', 'Innovation Challenge'],
            },
            {
              name: 'Engineering',
              card: 'border-[#112536] bg-[#112536]/5',
              head: 'text-[#112536] dark:text-[#F2C4CA]',
              desc: 'Leverages technical expertise to optimize systems and scale operations across the global community.',
              initiatives: ['Web App / Portal', 'Matching Algorithms', 'Data Analytics', 'Feedback Mechanisms', 'Sponsor Call Helper'],
            },
            {
              name: 'Finance',
              card: 'border-[#DB5863] bg-[#DB5863]/5',
              head: 'text-[#DB5863]',
              desc: 'Drives growth through strategic partnerships, sponsor relationships, and financial sustainability.',
              initiatives: ['Sponsorships', 'Reimbursements', 'Career Expo', 'Scholarships'],
            },
            {
              name: 'Logistics',
              card: 'border-[#E37D8A] bg-[#E37D8A]/10',
              head: 'text-[#E37D8A]',
              desc: 'Handles all operational infrastructure — venues, catering, accommodations, housing, and volunteers.',
              initiatives: ['Housing', 'Venue', 'Catering', 'Volunteers', 'Eventbrite & Ticketing'],
            },
            {
              name: 'Marketing & Strategy',
              card: 'border-[#F2C4CA] bg-[#F2C4CA]/30',
              head: 'text-[#DB5863]',
              desc: 'The face of WECode — brand narrative, social media, conference materials, merch, newsletter, and podcast.',
              initiatives: ['Advertisements / Pubbing', 'Social Media', 'Conference Materials', 'Board / Conference Merch', 'Newsletter', 'Podcast'],
            },
            {
              name: 'Programming',
              card: 'border-[#112536]/30 bg-[#112536]/5',
              head: 'text-[#112536] dark:text-[#F2C4CA]',
              desc: 'Curates the heart of the conference through speaker selection, mentorship, and event design.',
              initiatives: ['Mentorship Circles', 'Speaker Gala', 'Managing Speaker Travels', 'In-Person / Virtual Speakers', 'Virtual Conference Platform'],
            },
          ].map((team) => (
            <div key={team.name} className={`rounded-xl border ${team.card} p-4`}>
              <h4 className={`font-semibold ${team.head} mb-1`}>{team.name}</h4>
              <p className="text-sm text-[#112536]/60 dark:text-[#F2C4CA]/60 mb-2">{team.desc}</p>
              <ul className="text-xs text-[#112536]/50 dark:text-[#F2C4CA]/50 space-y-0.5">
                {team.initiatives.map((i) => <li key={i}>· {i}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <h3>Positions</h3>
        <dl>
          <dt><strong>Co-Chairs</strong></dt>
          <dd>Ensure each team understands their division of work and unify everyone under one mission. Responsible for vision development, supporting execution, and long-term organizational decisions. Also manage: Director Recruitment, Budget, All-Board/Directors Meetings, Board Retreat, Board Socials, Task Tracker, Sponsorship Warm Leads, Speaker Warm Leads.</dd>

          <dt><strong>Directors (Co-Directors)</strong></dt>
          <dd>Lead the Associate Directors on their subteam. Develop a unique team vision and solicit feedback from ADs throughout the process.</dd>

          <dt><strong>Associate Directors</strong></dt>
          <dd>Execute assigned tasks and actively participate in vision discussions. Encouraged to take initiative and facilitate cross-team collaboration. New ADs join in the fall — no code changes required, just add a row in the database.</dd>
        </dl>

        <h3>External Ecosystem</h3>
        <dl>
          <dt><strong>Alumni &amp; Advisory Board</strong></dt>
          <dd>Past board members are added to the alumni network automatically. Alumni may return as mentors, speakers, or advisors. WECode encourages coffee chats and regional meetups.</dd>

          <dt><strong>Tech Fellows</strong></dt>
          <dd>~30 undergraduates recruited globally each year to assist with pubbing. In exchange, Tech Fellows get access to exclusive professional development workshops and networking opportunities — a key connective tissue in the WECode system.</dd>

          <dt><strong>Speakers &amp; Mentors</strong></dt>
          <dd>Diverse group of speakers for panels, solo talks, and workshops; mentors for intimate small-group discussions. WECode 2025 introduced the first Speaker Gala to build community among speakers.</dd>

          <dt><strong>Partners &amp; Sponsors</strong></dt>
          <dd>Tech companies, startups, Harvard affiliates (WiCS, SEAS, Harvard Grid), and women-in-STEM organizations (Rewriting the Code, Girls Who Code, Kode with Klossy).</dd>

          <dt><strong>Volunteers</strong></dt>
          <dd>Conference Staffers (primarily from Harvard WiCS) and Housing Hosts (local undergraduates).</dd>
        </dl>

        <h3>Lifecycle</h3>
        <div className="not-prose overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-[#F2C4CA]/40">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-[#DB5863]">Month</th>
                <th className="px-4 py-2 text-left font-semibold text-[#DB5863]">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900/20">
              {[
                ['February', 'Pre-Conference Events · Conference'],
                ['March', 'Post-Conference Processing · Co-Chair Elections · Co-Chair Onboarding'],
                ['April', 'Director Recruiting / Onboarding'],
                ['May – June', '(Director transition & summer planning)'],
                ['July', 'Vision + OKR Definition'],
                ['August', '(Planning continues)'],
                ['September', 'AD Recruitment + Onboarding · Board Retreat'],
                ['October – January', 'Conference Planning · Winter Break'],
              ].map(([month, activity]) => (
                <tr key={month} className="hover:bg-[#F2C4CA]/20">
                  <td className="px-4 py-2 font-medium text-[#DB5863] whitespace-nowrap">{month}</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{activity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3>Infrastructure</h3>
        <div className="not-prose grid sm:grid-cols-2 gap-3 my-4 text-sm">
          {[
            { cat: 'Project Management', tools: ['Notion (task management, meeting notes)', 'Google Drive (official docs)', 'Google Calendar (deadlines)', 'Lastpass (passwords)'] },
            { cat: 'Communication', tools: ['Slack (primary board comms)', 'Gmail (official, less frequent)', 'iMessage (quick updates)', 'Mailchimp (newsletter)'] },
            { cat: 'Creating Materials', tools: ['Canva (social media, merch)', 'Figma (diagrams, org charts)'] },
            { cat: 'Social / Outward Facing', tools: ['WordPress (WECode website)', 'YouTube (conference recordings)', 'Instagram (announcements)', 'LinkedIn (alumni group)', 'Spotify (podcast)'] },
          ].map(({ cat, tools }) => (
            <div key={cat} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900/20">
              <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{cat}</p>
              <ul className="text-gray-500 dark:text-gray-400 space-y-0.5">
                {tools.map((t) => <li key={t}>· {t}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <h3>Board Expectations</h3>
        <dl>
          <dt><strong>Attendance</strong></dt>
          <dd>Required for all meetings and mandatory socials (including board retreat), except emergencies or unchangeable conflicts. Communicate absences in advance to your director or co-chair. Multiple absences may result in dismissal review.</dd>

          <dt><strong>Participation</strong></dt>
          <dd>Full participation is encouraged — posing questions, challenging ideas, initiating cross-team collaborations, or being a fully engaged listener. Every board member plays a vital role in WECode&apos;s success.</dd>

          <dt><strong>Privacy &amp; Security</strong></dt>
          <dd>What is said in WECode stays in WECode. Check permissions before sharing materials externally. Documents may be marked [INTERNAL] or [EXTERNAL] as guidance.</dd>
        </dl>
      </section>
    </div>
  )
}
