import { useState } from 'react'
import EmailIcon from '../components/icons/EmailIcon'
import GitHubIcon from '../components/icons/GitHubIcon'
import LinkedInIcon from '../components/icons/LinkedInIcon'
import LeetCodeIcon from '../components/icons/LeetCodeIcon'

interface ContactProps {
  isActive: boolean
}

const CONTACT_LINKS = [
  {
    label: 'atharvashimpi@gmail.com',
    href: 'mailto:atharvashimpi@gmail.com',
    icon: <EmailIcon />,
    external: false,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/atharvshimpi',
    icon: <GitHubIcon />,
    external: true,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/atharv-shimpi',
    icon: <LinkedInIcon />,
    external: true,
  },
  {
    label: 'LeetCode',
    href: 'https://leetcode.com/u/atharvshimpi/',
    icon: <LeetCodeIcon />,
    external: true,
  },
]

export default function Contact({ isActive }: ContactProps) {
  const [status, setStatus] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setStatus('Sending...')
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        setStatus("✓ Message sent! I'll get back to you soon.")
        form.reset()
      } else {
        setStatus('Something went wrong. Please email me directly.')
      }
    } catch {
      setStatus('Something went wrong. Please email me directly.')
    }
  }

  return (
    <div id="page-contact" className={`page${isActive ? ' active' : ''}`}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '3.5rem 1rem 3rem',
          gap: '2rem',
        }}
      >
        <div className="contact-split">
          {/* LEFT: Form */}
          <div className="contact-left">
            <p className="pg-label fade-1">Get In Touch</p>
            <h2
              className="pg-title fade-2"
              style={{ fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', marginBottom: '.6rem' }}
            >
              Let's build something
              <br />
              <em>worth building.</em>
            </h2>
            <p
              className="contact-sub fade-3"
              style={{ fontSize: '.82rem', marginBottom: 0 }}
            >
              Whether it's about software, a shared interest, or just a good
              conversation, feel free to reach out.
            </p>
            <form
              className="contact-form fade-4"
              id="contact-form"
              action="https://formspree.io/f/mzbnnwop"
              method="POST"
              onSubmit={handleSubmit}
            >
              <input className="cf-input" type="text" name="name" placeholder="Your name" required />
              <input className="cf-input" type="email" name="email" placeholder="Your email" required />
              <textarea className="cf-input" name="message" rows={4} placeholder="Your message" required />
              <button className="cf-submit" type="submit">
                Send Message →
              </button>
              <p className="cf-msg" id="cf-msg">
                {status}
              </p>
            </form>
          </div>

          {/* DIVIDER */}
          <div className="contact-divider"></div>

          {/* RIGHT: Links */}
          <div className="contact-right">
            <p className="pg-label fade-1">Find Me Online</p>
            <h2
              className="pg-title fade-2"
              style={{ fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', marginBottom: '.6rem' }}
            >
              Open to great
              <br />
              <em>engineering problems.</em>
            </h2>
            <p
              className="contact-sub fade-3"
              style={{ fontSize: '.82rem', marginBottom: 0 }}
            >
              Always open to interesting opportunities and conversations.
            </p>
            <div className="contact-links-v fade-4" style={{ marginTop: '1.8rem' }}>
              {CONTACT_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="cl"
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noreferrer' : undefined}
                >
                  {link.icon}
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="foot" style={{ textAlign: 'center', marginTop: '2rem' }}>
          Atharv Shimpi · Software Engineer · Bengaluru, India
        </p>
      </div>
    </div>
  )
}
