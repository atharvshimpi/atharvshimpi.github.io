import { awards } from '../../data/awards'

export default function AwardsTab() {
  return (
    <div id="pt-awards" className="tp on">
      <div className="awards-grid" style={{ paddingTop: '.8rem' }}>
        {awards.map((award, i) => (
          <div className="award-card" key={i}>
            <div className="award-n" style={{ fontSize: '1.6rem' }}>
              {award.emoji}
            </div>
            <div className="award-l">{award.label}</div>
            <div className="award-sub" style={{ marginTop: '.5rem' }}>
              {award.description}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '.8rem',
              }}
            >
              <span className="award-org">{award.org}</span>
              {award.certificateUrl && (
                <a
                  href={award.certificateUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '.6rem',
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: 'var(--teal)',
                    borderBottom: '1px solid rgba(91,191,191,.3)',
                    paddingBottom: '.15rem',
                    textDecoration: 'none',
                  }}
                >
                  Certificate ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
