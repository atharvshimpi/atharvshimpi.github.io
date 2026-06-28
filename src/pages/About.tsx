interface AboutProps {
  isActive: boolean
}

const STATS = [
  { n: '2+', l: 'Years of Work Experience' },
  { n: '4×', l: 'Award Winner at Aurigo' },
  { n: '75%', l: 'Webpack bundle reduction' },
  { n: '18,780', l: 'JEE Advanced AIR' },
]

export default function About({ isActive }: AboutProps) {
  return (
    <div id="page-about" className={`page${isActive ? ' active' : ''}`}>
      <div className="shell">
        <p className="pg-label fade-1">About</p>
        <h2 className="pg-title fade-2">
          Engineer by training.
          <br />
          <em>Builder by curiosity.</em>
        </h2>
        <div className="about-grid">
          <div className="about-body fade-3">
            <p>
              I studied Computer Science at <strong>BITS Pilani, Goa</strong>,
              where I developed a strong foundation in software engineering,
              algorithms, and systems design, skills that continue to shape how
              I approach building products today.
            </p>
            <p>
              Since graduating, I've worked at <strong>Aurigo</strong>, where
              I've shipped reporting infrastructure, AI-powered conversational
              agents, dashboard microservices, and developer productivity
              tooling across enterprise SaaS products.
            </p>
            <p>
              That moment when you wake up at 3 a.m. with the solution to a bug
              that's been haunting you all day. I live for moments like that.
              For me, engineering isn't just a job; it's a way of thinking. I
              find myself drawn to hard problems not despite their complexity,
              but because of it.
            </p>
            <div className="about-quote">
              <blockquote>
                "First, solve the problem. Then, write the code."
              </blockquote>
              <cite>John Johnson, how I approach every engineering task</cite>
            </div>
          </div>
          <div className="stat-grid fade-4">
            {STATS.map((stat) => (
              <div className="stat-card" key={stat.l}>
                <div className="stat-n">{stat.n}</div>
                <div className="stat-l">{stat.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
