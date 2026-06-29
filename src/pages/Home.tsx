import type { PageId } from '../types'

interface HomeProps {
  onNavigate: (page: PageId) => void
  isActive: boolean
}

const PILLS = ['Spring Boot', 'React', 'AWS', 'AI / LLMs', 'BITS Pilani']

export default function Home({ onNavigate, isActive }: HomeProps) {
  return (
    <div id="page-home" className={`page${isActive ? ' active' : ''}`}>
      <div className="hero-wrap">
        <div className="hero-eyebrow">Software Engineer</div>
        <h1 className="hero-name">
          Atharv
          <br />
          <em>Shimpi</em>
        </h1>
        <div className="hero-line"></div>
        <p className="hero-copy">
          <strong>Software Developer.</strong> I build enterprise SaaS platforms,
          AI-powered applications, and cloud-native systems. I enjoy solving
          complex engineering challenges and creating experiences that feel
          simple for the people who use them.
        </p>
        <div className="hero-pills">
          {PILLS.map((pill) => (
            <span className="pill" key={pill}>
              {pill}
            </span>
          ))}
        </div>
        <div className="hero-cta">
          <button className="btn-primary" onClick={() => onNavigate('experience')}>
            View Experience
          </button>
          <a
            className="btn-ghost"
            href="https://drive.google.com/file/d/15_J2rMKxH5CeHR50l2srdRckzUVoJ4c2/view?usp=sharing"
            target="_blank"
            rel="noreferrer"
          >
            Resume ↗
          </a>
        </div>
      </div>
    </div>
  )
}
