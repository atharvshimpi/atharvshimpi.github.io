import { projects } from '../../data/projects'
import GitHubIcon from '../../components/icons/GitHubIcon'

export default function ProjectsTab() {
  return (
    <div id="pt-projects" className="tp on">
      <div className="proj-grid" style={{ paddingTop: '.8rem' }}>
        {projects.map((project) => (
          <div className="proj-card" key={project.number}>
            <div className="proj-n">{project.number}</div>
            <div className="proj-t">{project.title}</div>
            <p className="proj-d">{project.description}</p>
            <div className="proj-chips">
              {project.chips.map((chip) => (
                <span className="pc" key={chip}>
                  {chip}
                </span>
              ))}
            </div>
            <div className="proj-footer">
              <span className="proj-stack">{project.stack}</span>
              {project.links && (
                <div
                  style={{
                    display: 'flex',
                    gap: '.5rem',
                    marginLeft: 'auto',
                    flexShrink: 0,
                  }}
                >
                  {project.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className={`proj-btn${link.highlighted ? ' proj-btn-live' : ''}`}
                      onClick={(e) => e.preventDefault()}
                    >
                      {link.icon === 'github' && <GitHubIcon />}
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
