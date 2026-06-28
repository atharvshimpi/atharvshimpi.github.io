import { experience, education } from '../data/experience'

interface ExperienceProps {
  isActive: boolean
}

export default function Experience({ isActive }: ExperienceProps) {
  return (
    <div id="page-experience" className={`page${isActive ? ' active' : ''}`}>
      <div className="shell">
        <p className="pg-label fade-1">Career Timeline</p>
        <h2 className="pg-title fade-2">
          Where I've worked
          <br />& <em>what I've built.</em>
        </h2>

        {experience.map((entry) => (
          <div className="xp-item" key={`${entry.company}-${entry.dateRange}`}>
            <div>
              <div className="xp-date">{entry.dateRange}</div>
              <div className="xp-co">{entry.company}</div>
              <div className="xp-role">{entry.role}</div>
              <span className="xp-tag">{entry.tag}</span>
            </div>
            <div>
              <h3 className="xp-h">{entry.heading}</h3>
              <ul className="xp-list">
                {entry.bullets.map((bullet, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: bullet }} />
                ))}
              </ul>
              <div className="xp-tags">
                {entry.techTags.map((tag) => (
                  <span
                    className={`xt${tag.outline ? ' ol' : ''}`}
                    key={tag.label}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
              {entry.certificateUrl && (
                <div style={{ marginTop: '.6rem' }}>
                  <a
                    href={entry.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '.65rem',
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                      color: 'var(--teal)',
                      textDecoration: 'none',
                      borderBottom: '1px solid rgba(91,191,191,.3)',
                      paddingBottom: '.15rem',
                    }}
                  >
                    Completion Link
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="edu-shelf">
          <p className="pg-label">Education</p>
          <div className="edu-grid">
            <div className="edu-card" data-y={education.yearMark}>
              <div className="edu-sch">{education.school}</div>
              <div className="edu-deg">{education.degree}</div>
              <div className="edu-gpa-row">
                <div>
                  <div className="edu-gpa-val">{education.gpa}</div>
                  <div className="edu-gpa-label">CGPA</div>
                </div>
                <div>
                  <div className="edu-date-val">{education.duration}</div>
                  <div className="edu-gpa-label">Duration</div>
                </div>
              </div>
              <div className="edu-note">{education.courses}</div>
              <div className="edu-badges">
                {education.badges.map((badge) => (
                  <span className="edu-b" key={badge}>
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
